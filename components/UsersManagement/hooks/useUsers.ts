import { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  getFirestore, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc, 
  DocumentData 
} from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { toast } from 'sonner';
import { User, UserFilters, PaginationSettings } from '../types';
import * as XLSX from 'xlsx';

export default function useUsers() {
  // User data state
  const [users, setUsers] = useState<User[]>([]);
  const [lastVisible, setLastVisible] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Add this state to store all users
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  
  // Selected users
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Filters and pagination
  const [filters, setFilters] = useState<UserFilters>({
    search: "",
    role: "all",
    profileStatus: "all",
    sort: "newest",
  });

  const [pagination, setPagination] = useState<PaginationSettings>({
    pageSize: 12,
    currentPage: 1,
    totalUsers: 0,
    totalPages: 1,
  });

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshTrigger((prev) => prev + 1);
  };

  // Add a function to apply client-side filtering and pagination
  const applyFilters = (users: User[]) => {
    let filtered = [...users]; // Create a copy to work with
    
    // Apply role filter
    if (filters.role !== 'all') {
      if (filters.role === 'admin') {
        filtered = filtered.filter(user => user.admin === true);
      } else if (filters.role === 'problem-setter') {
        filtered = filtered.filter(user => user['problem-setter'] === true);
      } else if (filters.role === 'user') {
        filtered = filtered.filter(user => 
          !user.admin && !user['problem-setter']
        );
      }
    }
    
    // Apply profile status filter
    if (filters.profileStatus !== 'all') {
      if (filters.profileStatus === 'complete') {
        filtered = filtered.filter(user => user.profileCompleted === true);
      } else {
        filtered = filtered.filter(user => user.profileCompleted === false);
      }
    }
    
    // Apply search filter
    if (filters.search) {
      filtered = filtered.filter(
        (user) =>
          (user.fullName?.toLowerCase() || '').includes(filters.search.toLowerCase()) ||
          (user.email?.toLowerCase() || '').includes(filters.search.toLowerCase()) ||
          (user.handle?.toLowerCase() || '').includes(filters.search.toLowerCase())
      );
    }
    
    // Apply sorting
    if (filters.sort === "newest") {
      filtered.sort((a, b) => b.createdAt?.toMillis?.() - a.createdAt?.toMillis?.() || 0);
    } else if (filters.sort === "oldest") {
      filtered.sort((a, b) => a.createdAt?.toMillis?.() - b.createdAt?.toMillis?.() || 0);
    } else if (filters.sort === "name-asc") {
      filtered.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
    } else if (filters.sort === "name-desc") {
      filtered.sort((a, b) => (b.fullName || '').localeCompare(a.fullName || ''));
    }
    
    // Update filtered users and pagination info
    setFilteredUsers(filtered);
    
    // Update pagination
    setPagination((prev) => ({
      ...prev,
      totalUsers: filtered.length,
      totalPages: Math.ceil(filtered.length / prev.pageSize) || 1,
      currentPage: Math.min(prev.currentPage, Math.ceil(filtered.length / prev.pageSize) || 1),
    }));
  };

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const db = getFirestore(getApp());
      const usersCollection = collection(db, "users");

      // Get all users sorted by creation date (most recent first)
      const userQuery = query(usersCollection, orderBy("createdAt", "desc"));
      const userSnapshot = await getDocs(userQuery);

      // Map results to User objects
      const userList: User[] = userSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<User, "id">),
      }));

      // Store all users
      setAllUsers(userList);
      setUsers(userList); // Set this for backwards compatibility
      
      // Apply all filters client-side
      applyFilters(userList);
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users");
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // User management functions
  const handleEditUser = async (userId: string, userData: Partial<User>) => {
    try {
      setLoading(true);
      const db = getFirestore(getApp());
      const userRef = doc(db, "users", userId);

      // Add updatedAt timestamp
      const updatedData = {
        ...userData,
        updatedAt: new Date(),
      };

      await updateDoc(userRef, updatedData);
      handleRefresh();
      toast.success("User updated successfully");
      return true;
    } catch (err) {
      console.error("Error updating user:", err);
      toast.error("Failed to update user");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setLoading(true);
      const db = getFirestore(getApp());
      const userRef = doc(db, "users", userId);

      await deleteDoc(userRef);
      handleRefresh();
      toast.success("User deleted successfully");
      return true;
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error("Failed to delete user");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleBulkRoleUpdate = async (
    role: "admin" | "problem-setter",
    value: boolean
  ) => {
    try {
      setLoading(true);
      const db = getFirestore(getApp());

      // Create array of promises for batch updates
      const updatePromises = selectedUsers.map((userId) => {
        const userRef = doc(db, "users", userId);
        return updateDoc(userRef, {
          [role]: value,
          updatedAt: new Date(),
        });
      });

      await Promise.all(updatePromises);
      setSelectedUsers([]);
      handleRefresh();
      toast.success(`${selectedUsers.length} users updated successfully`);
      return true;
    } catch (err) {
      console.error("Error updating users:", err);
      toast.error("Failed to update users");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Export users as Excel
  const exportUsersAsExcel = () => {
    try {
      // Prepare the data
      const headers = [
        "ID",
        "Email",
        "Name",
        "Handle",
        "Country",
        "Birth Date",
        "Admin",
        "Problem Setter",
        "Profile Completed",
        "Created At",
      ];

      const data = [
        headers,
        ...users.map((user) => [
          user.id,
          user.email || "",
          user.fullName || "",
          user.handle || "",
          user.country || "",
          user.birthdate || "",
          user.admin ? "Yes" : "No",
          user["problem-setter"] ? "Yes" : "No",
          user.profileCompleted ? "Yes" : "No",
          user.createdAt?.toDate?.()
            ? user.createdAt.toDate().toLocaleString()
            : "",
        ]),
      ];

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(data);

      // Set column widths for better readability
      const colWidths = [
        { wch: 25 }, // ID
        { wch: 30 }, // Email
        { wch: 20 }, // Name
        { wch: 15 }, // Handle
        { wch: 10 }, // Country
        { wch: 12 }, // Birth Date
        { wch: 8 }, // Admin
        { wch: 15 }, // Problem Setter
        { wch: 15 }, // Profile Completed
        { wch: 20 }, // Created At
      ];
      ws["!cols"] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Users");

      // Generate Excel file
      const excelFileName = `users_export_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      XLSX.writeFile(wb, excelFileName);

      toast.success("Users exported as Excel file successfully");
    } catch (err) {
      console.error("Error exporting users to Excel:", err);
      toast.error("Failed to export users");
    }
  };

  // Toggle selection for bulk actions
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Select/deselect all visible users
  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.id));
    }
  };

  // Compute the current page of users to display
  const getCurrentPageUsers = () => {
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
    const endIndex = Math.min(startIndex + pagination.pageSize, filteredUsers.length);
    return filteredUsers.slice(startIndex, endIndex);
  };

  // Detect when refresh operation completes
  useEffect(() => {
    if (!loading && isRefreshing) {
      setIsRefreshing(false);
    }
  }, [loading, isRefreshing]);

  // Initial data load and when filters/pagination change
  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger]); // Only refetch when explicitly triggered

  // Apply filters whenever filter criteria change
  useEffect(() => {
    if (allUsers.length > 0) {
      applyFilters(allUsers);
    }
  }, [filters.role, filters.profileStatus, filters.sort, pagination.pageSize]);

  // Apply filters when search term changes
  useEffect(() => {
    if (allUsers.length > 0) {
      applyFilters(allUsers);
    }
  }, [filters.search]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }));
    // Reset lastVisible to ensure we start from the beginning
    setLastVisible(null);
  }, [filters.role, filters.profileStatus, filters.search]);

  return {
    users: getCurrentPageUsers(),
    allUsers,
    filteredUsers,
    loading,
    error,
    isRefreshing,
    selectedUsers,
    filters,
    pagination,
    handleRefresh,
    setFilters,
    setPagination,
    toggleUserSelection,
    toggleSelectAll,
    handleEditUser,
    handleDeleteUser,
    handleBulkRoleUpdate,
    exportUsersAsExcel,
    clearSelectedUsers: () => setSelectedUsers([])
  };
}