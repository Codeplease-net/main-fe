import { doc, getDoc, updateDoc } from "firebase/firestore";
import { defaultProblem, Problem } from "../types/problem";
import { db } from "@/api/Readfirebase";

export async function fetchProblemById(id: string): Promise<any> {
  try {
    const docRef = doc(db, "problems", id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return { error: `Problem ${id} not found` };
    }

    const data = docSnap.data();
    // Convert categories object to array of active categories
    const categoriesObj = data.categories || {};
    const activeCategories = Object.entries(categoriesObj)
      .filter(([_, isActive]) => isActive === true)
      .map(([category]) => category);
    // console.log(docSnap.data())
    // console.log("data.title", (data.title == null || data.title === "") ? defaultProblem.content.title : data.title,)
    return {
      data: {
        id: docSnap.id,
        displayTitle: data.displayTitle || "",
        categories: activeCategories, // Now returns array of active categories
        difficulty: data.difficulty || 0,
        content: {
          title: (data.title == null || data.title === "") ? defaultProblem.content.title : data.title,
          description: (data.description == null || data.description === "") ? defaultProblem.content.description : data.description,
          solution: (data.solution == null || data.solution === "") ? defaultProblem.content.solution : data.solution,        
        }
      }
    };
  } catch (error) {
    console.error("Error fetching problem:", error);
    return { error: "Failed to fetch problem" };
  }
}

export async function updateProblem(
  id: string,
  updates: Partial<Problem>
): Promise<any> {
  try {
    const docRef = doc(db, "problems", id);
    
    // Convert categories array to object with boolean values
    const categoriesUpdate = updates.categories 
      ? updates.categories.reduce((acc, category) => ({
          ...acc,
          [category]: true
        }), {})
      : undefined;

    console.log(updates)

    // Build update data object - key/value pairs to update in Firestore
    const updateData = {
      ...(updates.displayTitle !== undefined && { displayTitle: updates.displayTitle }),
      ...(updates.categories && { categories: categoriesUpdate }),
      ...(updates.difficulty !== undefined && { difficulty: updates.difficulty }),
      ...(updates.content?.title && { title: updates.content.title }),
      ...(updates.content?.description && { description: updates.content.description }),
      ...(updates.content?.solution && { solution: updates.content.solution }),
      
      // Replace the entire searchableTitle array with the new one
      // This ensures we're not appending to the existing array
      ...(updates.searchableTitle !== undefined && { 
        searchableTitle: updates.searchableTitle 
      }),
    };

    await updateDoc(docRef, updateData);
    return { success: true };
  } catch (error) {
    console.error("Error updating problem:", error);
    return { error: "Failed to update problem" };
  }
}

// ... rest of the code ...