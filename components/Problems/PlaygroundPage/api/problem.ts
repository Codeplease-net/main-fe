import { doc, getDoc } from "firebase/firestore";
import { db } from "@/api/Readfirebase";

interface ProblemData {
  id: string;
  title: Record<string, string>;
  description: Record<string, string>;
  solution: Record<string, string>;
  difficulty: number;
  acceptance: number;
  status?: string;
  categories: string[];  // Changed from object to string array
}

export async function fetchProblemById(id: string): Promise<ProblemData | null> {
  try {
    const docRef = doc(db, "problems", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // Transform the category object into an array of strings
      const categoryObj = data.categories || {};
      const categories = Object.keys(categoryObj).filter(key => categoryObj[key] === true);
      
      return {
        ...data,
        id,
        categories: categories
      } as ProblemData;
    }
    
    console.log("No Documents Found!");
    return null;
  } catch (error) {
    console.error("Error fetching document: ", error);
    return null;
  }
}


export async function getUserHandle(userId: string): Promise<string> {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists() ? userDoc.data()?.handle || "" : "";
  } catch (error) {
    console.error("Error fetching user handle:", error);
    return "";
  }
}