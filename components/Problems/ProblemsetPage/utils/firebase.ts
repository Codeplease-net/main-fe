"use client";
import { db } from "@/api/Readfirebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { Problem, ProblemFilters } from "../types/interfaces";

export async function getProblems(userId: string | null, filters?: ProblemFilters): Promise<{
  problems: Problem[];
  total: number;
  notFound?: boolean;
}> {
  try {
    let q = collection(db, "problems");
    let constraints = [];

    // 🔥 Step 1: Fetch User Groups
    let userGroups: string[] = [];
    if (userId) {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        userGroups = userDoc.data().groups || [];
      }
    }

    // 🔥 Step 2: Get Accessible Problems
    const permissionsSnapshot = await getDocs(collection(db, "problem-permissions"));
    let accessibleProblemIds: string[] = [];

    permissionsSnapshot.forEach((doc) => {
      const { public: isPublic, restricted, allowedGroups } = doc.data();
      if (isPublic || (restricted && userId) || userGroups.some(group => allowedGroups.includes(group))) {
        accessibleProblemIds.push(doc.id);
      }
    });

    if (accessibleProblemIds.length === 0) {
      return { problems: [], total: 0, notFound: true };
    }

    constraints.push(where("__name__", "in", accessibleProblemIds));

    // 🔍 Step 3: Apply Filters
    if (filters) {
      if (filters.categories && filters.categories.length > 0) {
        filters.categories.forEach((category) => {
          constraints.push(where(`categories.${category}`, "==", true));
        });
      }

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        constraints.push(where("searchableTitle", "array-contains", searchTerm));
      }
    }

    // 🔢 Step 4: Get Total Count
    const countQuery = constraints.length > 0 ? query(q, ...constraints) : q;
    const totalSnapshot = await getDocs(countQuery);
    const total = totalSnapshot.size;

    // ⏩ Step 5: Apply Pagination
    if (filters?.limit) {
      if (filters?.page == 1) {
        constraints.push(limit(filters.limit));
      } else if (filters?.page !== undefined) {
        const lastVisibleRef = query(q, ...constraints, limit((filters.page - 1) * filters.limit));
        const lastVisibleSnapshot = await getDocs(lastVisibleRef);
        const lastVisible = lastVisibleSnapshot.docs[lastVisibleSnapshot.docs.length - 1];

        if (lastVisible) {
          constraints.push(startAfter(lastVisible));
        }
        constraints.push(limit(filters.limit));
      }
    }

    // 🔄 Step 6: Fetch Problems
    const queryRef = constraints.length > 0 ? query(q, ...constraints) : q;
    const problemsSnapshot = await getDocs(queryRef);

    if (problemsSnapshot.empty) {
      return { problems: [], total: 0 };
    }

    const problems = problemsSnapshot.docs.map((document) => {
      const data = document.data();
      const categoriesObj = data.categories || {};
      const activeCategories = Object.entries(categoriesObj)
        .filter(([_, isActive]) => isActive === true)
        .map(([category]) => category);
      return {
        id: document.id,
        displayTitle: data.displayTitle,
        categories: activeCategories,
        difficulty: data.difficulty,
        title: data.title,
      };
    });

    return { problems, total };
  } catch (error) {
    console.error("Error fetching problems from Firestore:", error);
    return { problems: [], total: 0, notFound: true };
  }
}
