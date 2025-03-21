"use server"

import { db } from "@/api/Readfirebase";
import { collection, doc, getDoc, getDocs, query, where, orderBy, limit, startAfter, getCountFromServer } from "firebase/firestore";
import { SUPPORTED_LANGUAGES } from "../../Problem/types/language";

interface Problem {
  id: string;
  displayTitle?: string;
  owner: string;  // This is the handle
  ownerId: string; // This is the UID
  createdAt: number;
  numberOfTestCases: number;
  availableLanguages: string[];
}

interface ProblemFilters {
  search?: string;
  owners?: string[];  // These are handles
  page?: number;
  pageSize?: number;
  lastDocId?: string; // For pagination
}

interface OwnerInfo {
  uid: string;
  handle: string;
}

export default async function getProblems(filters?: ProblemFilters): Promise<{
  problems: Problem[];
  lastVisible: any;
  total: number;
  hasMore: boolean;
  allOwners: string[];  // These are handles
}> {
  try {
    const pageSize = filters?.pageSize || 10;
    const currentPage = filters?.page || 1;
    let problemsQuery = collection(db, "problems");

    // First, get all owner UIDs and their handles
    const ownersMap = await getAllOwnerMappings();
    
    // Get all owner handles for the dropdown - this is independent of filtering
    const allOwnerHandles = Object.values(ownersMap).map(info => info.handle);
    
    // Convert the selected owner handles to UIDs for filtering
    let ownerUIDs: string[] = [];
    if (filters?.owners && filters.owners.length > 0) {
      ownerUIDs = filters.owners
        .map(handle => {
          const match = Object.entries(ownersMap).find(([uid, info]) => info.handle === handle);
          return match ? match[0] : null;
        })
        .filter(Boolean) as string[];
      
      // If no UIDs could be found for the handles, return empty results
      if (ownerUIDs.length === 0) {
        return {
          problems: [],
          lastVisible: null,
          total: 0,
          hasMore: false,
          allOwners: allOwnerHandles // Still return all owners for dropdown
        };
      }
    }
    
    // For search by ID, we need to get all problems first
    // since Firestore doesn't support native "contains" queries on document IDs
    let allProblemsSnapshot;
    
    // If we're searching or filtering by owner, we might need all documents
    if ((filters?.search && filters.search.trim() !== "") || 
        (filters?.owners && filters.owners.length > 0)) {
      // Start with a base query that might include owner filter
      let baseQueryConstraints = [];
      
      // Add owner filter if provided - this helps narrow down the initial query
      if (ownerUIDs.length > 0) {
        baseQueryConstraints.push(where("owner", "in", ownerUIDs));
      }
      
      try {
        // Always sort by creation date for consistent results
        baseQueryConstraints.push(orderBy("createdAt", "desc"));
        
        // Get the filtered set of problems
        const filteredQuery = query(problemsQuery, ...baseQueryConstraints);
        allProblemsSnapshot = await getDocs(filteredQuery);
      } catch (error: any) {
        // Handle index error - fall back to unsorted query if needed
        if (error.name === "FirebaseError" && error.code === "failed-precondition" && error.message.includes("index")) {
          console.warn("Index error - sorting will be done client-side:", error.message);
          
          // Remove the orderBy that requires an index
          baseQueryConstraints = baseQueryConstraints.filter(c => c.type !== "orderBy");
          
          // Try the query again without sorting
          const filteredQuery = query(problemsQuery, ...baseQueryConstraints);
          allProblemsSnapshot = await getDocs(filteredQuery);
        } else {
          throw error; // Re-throw if it's not an index error
        }
      }
      
      // Now if we're also searching by ID, further filter the results
      let filteredDocs = allProblemsSnapshot.docs;
      
      if (filters?.search && filters.search.trim() !== "") {
        const searchTerm = filters.search.toLowerCase().trim();
        
        // Filter by ID contains search term
        filteredDocs = filteredDocs.filter(doc => 
          doc.id.toLowerCase().includes(searchTerm)
        );
      }
      
      // Manual sorting if we had to skip the orderBy
      if (!baseQueryConstraints.some(c => c.type === "orderBy")) {
        filteredDocs.sort((a, b) => {
          const aData = a.data();
          const bData = b.data();
          return (bData.createdAt || 0) - (aData.createdAt || 0);
        });
      }
      
      // Calculate pagination
      const totalCount = filteredDocs.length;
      const startIndex = (currentPage - 1) * pageSize;
      const pageData = filteredDocs.slice(startIndex, startIndex + pageSize);
      const hasMore = totalCount > currentPage * pageSize;
      const lastVisible = pageData.length > 0 ? pageData[pageData.length - 1] : null;
      
      // Map to problem objects
      const problems: Problem[] = await Promise.all(pageData.map(async (document) => {
        return mapDocumentToProblem(document, ownersMap);
      }));
      
      return {
        problems,
        lastVisible: lastVisible?.id || null,
        total: totalCount,
        hasMore,
        allOwners: allOwnerHandles // Return all owners regardless of current filter
      };
    } 
    else {
      // Standard query without search or owner filter
      let queryConstraints = [];
      
      // Order by creation date
      queryConstraints.push(orderBy("createdAt", "desc"));
      
      try {
        // Create the query
        const baseQuery = query(problemsQuery, ...queryConstraints);
        
        // Get total count efficiently
        const countSnapshot = await getCountFromServer(baseQuery);
        const totalCount = countSnapshot.data().count;
        
        // Handle pagination
        let paginatedQuery;
        if (filters?.lastDocId) {
          const lastDocRef = doc(db, "problems", filters.lastDocId);
          const lastDocSnap = await getDoc(lastDocRef);
          
          if (lastDocSnap.exists()) {
            paginatedQuery = query(baseQuery, startAfter(lastDocSnap), limit(pageSize));
          } else {
            paginatedQuery = query(baseQuery, limit(pageSize));
          }
        } else {
          // For page-based pagination
          paginatedQuery = query(baseQuery, limit(pageSize));
          
          // Skip documents for pagination
          if (currentPage > 1) {
            const previousPageQuery = query(baseQuery, limit((currentPage - 1) * pageSize));
            const previousPageSnapshot = await getDocs(previousPageQuery);
            const lastVisible = previousPageSnapshot.docs[previousPageSnapshot.docs.length - 1];
            
            if (lastVisible) {
              paginatedQuery = query(baseQuery, startAfter(lastVisible), limit(pageSize));
            }
          }
        }
        
        // Execute the query
        const problemsSnapshot = await getDocs(paginatedQuery);
        const pageData = problemsSnapshot.docs;
        
        // Calculate if there are more results
        const hasMore = totalCount > (currentPage * pageSize);
        
        // Get last document for cursor-based pagination
        const lastVisible = pageData.length > 0 ? pageData[pageData.length - 1] : null;
        
        // Map the documents to our problem structure
        const problems: Problem[] = await Promise.all(pageData.map(async (document) => {
          return mapDocumentToProblem(document, ownersMap);
        }));
        
        return {
          problems,
          lastVisible: lastVisible?.id || null,
          total: totalCount,
          hasMore,
          allOwners: allOwnerHandles // Return all owners regardless of current page
        };
      } catch (error: any) {
        // Handle index errors here too
        if (error.name === "FirebaseError" && error.code === "failed-precondition" && error.message.includes("index")) {
          console.warn("Index error in standard query - falling back to manual sorting:", error.message);
          
          // Get all problems without sorting
          const simpleQuery = query(problemsQuery);
          const allSnapshot = await getDocs(simpleQuery);
          
          // Sort manually
          let allDocs = [...allSnapshot.docs];
          allDocs.sort((a, b) => {
            const aData = a.data();
            const bData = b.data();
            return (bData.createdAt || 0) - (aData.createdAt || 0);
          });
          
          // Calculate pagination manually
          const totalCount = allDocs.length;
          const startIndex = (currentPage - 1) * pageSize;
          const pageData = allDocs.slice(startIndex, startIndex + pageSize);
          const hasMore = totalCount > currentPage * pageSize;
          
          // Map to problem objects
          const problems: Problem[] = await Promise.all(pageData.map(async (document) => {
            return mapDocumentToProblem(document, ownersMap);
          }));
          
          return {
            problems,
            lastVisible: null, // Can't use lastVisible with manual pagination
            total: totalCount,
            hasMore,
            allOwners: allOwnerHandles
          };
        } else {
          throw error;
        }
      }
    }
  } catch (error) {
    console.error("Error fetching problems:", error);
    return {
      problems: [],
      lastVisible: null,
      total: 0,
      hasMore: false,
      allOwners: []
    };
  }
}

// Get all owner UIDs and map them to handles
async function getAllOwnerMappings(): Promise<Record<string, OwnerInfo>> {
  // Get all unique owner UIDs
  const problemsQuery = collection(db, "problems");
  const problemsSnapshot = await getDocs(problemsQuery);
  const ownerUIDs = Array.from(new Set(
    problemsSnapshot.docs
      .map(doc => doc.data().owner)
      .filter(Boolean)
  ));
  
  // Create mapping from UID to handle
  const ownersMap: Record<string, OwnerInfo> = {};
  
  // Fetch handles for each UID
  await Promise.all(ownerUIDs.map(async (uid) => {
    if (typeof uid === 'string') {
      try {
        const userDocRef = doc(db, 'users', uid);
        const userDocSnapshot = await getDoc(userDocRef);
        
        if (userDocSnapshot.exists()) {
          const handle = userDocSnapshot.data().handle || uid;
          ownersMap[uid] = { uid, handle };
        } else {
          ownersMap[uid] = { uid, handle: uid };
        }
      } catch (error) {
        console.error("Error fetching owner details:", error);
        ownersMap[uid] = { uid, handle: uid };
      }
    }
  }));
  
  return ownersMap;
}

// Helper function to map Firestore document to Problem object
async function mapDocumentToProblem(document: any, ownersMap: Record<string, OwnerInfo>): Promise<Problem> {
  const data = document.data();
  const ownerUID = data.owner;
  
  // Get owner handle from map
  let ownerHandle = ownerUID;
  if (ownersMap[ownerUID]) {
    ownerHandle = ownersMap[ownerUID].handle;
  }

  function getLanguage(data: any){
    if (!data) return [];
    const languages = [];
    for (const key of Object.keys(SUPPORTED_LANGUAGES)) {
      if (data[key]) {
        languages.push(key);
      }
    }
    return languages;
  }

  return {
    id: document.id,
    displayTitle: data.displayTitle,
    owner: ownerHandle || "unknown",
    ownerId: ownerUID,
    createdAt: data.createdAt,
    numberOfTestCases: data.testCases ? data.testCases.length : 0,
    availableLanguages: getLanguage(data.description),
  };
}