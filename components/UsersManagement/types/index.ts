export interface User {
    id: string;
    email?: string;
    emailVerified?: boolean;
    createdAt?: any;
    updatedAt?: any;
    photoURL?: string;
    fullName?: string;
    handle?: string;
    birthdate?: string;
    country?: string;
    "problem-setter"?: boolean;
    admin?: boolean;
    profileCompleted?: boolean;
  }
  
  // Filter interface
  export interface UserFilters {
    search: string;
    role: "all" | "admin" | "problem-setter" | "user";
    profileStatus: "all" | "complete" | "incomplete";
    sort: "newest" | "oldest" | "name-asc" | "name-desc";
  }
  
  // Pagination settings
  export interface PaginationSettings {
    pageSize: number;
    currentPage: number;
    totalUsers: number;
    totalPages: number;
  }