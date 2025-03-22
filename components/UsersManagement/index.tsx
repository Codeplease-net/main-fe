"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";

// Import types
import { User } from "./types";

// Import hook
import useUsers from "./hooks/useUsers";

// Import components
import UserCard from "./components/UserCard";
import EditUserDialog from "./components/EditUserDialog";
import DeleteUserDialog from "./components/DeleteUserDialog";
import UserFilters from "./components/UserFilters";
import UserPagination from "./components/UserPagination";
import BulkActions from "./components/BulkActions";

export default function UsersManagement() {
  // Translations
  const t = useTranslations("UsersManagement");

  // Get user data and functions from custom hook
  const {
    users,
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
    clearSelectedUsers,
  } = useUsers();

  // Local state for edit/delete dialogs
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handlers for user operations
  const onEditUser = (user: User) => {
    setUserToEdit(user);
  };

  const onSaveUser = async (userData: Partial<User>) => {
    if (!userToEdit) return;

    setIsSaving(true);
    const success = await handleEditUser(userToEdit.id, userData);
    setIsSaving(false);

    if (success) {
      setUserToEdit(null);
    }
  };

  const onDeleteUser = (user: User) => {
    setUserToDelete(user);
  };

  const onConfirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    const success = await handleDeleteUser(userToDelete.id);
    setIsDeleting(false);

    if (success) {
      setUserToDelete(null);
    }
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setPagination({
      ...pagination,
      currentPage: page,
    });
  };

  const handlePageSizeChange = (size: number) => {
    setPagination({
      ...pagination,
      pageSize: size,
      currentPage: 1,
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading || isRefreshing}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? t("buttons.refreshing") : t("buttons.refresh")}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={exportUsersAsExcel}
          disabled={loading || filteredUsers.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          {selectedUsers.length > 0
            ? t("buttons.exportSelected", { count: selectedUsers.length })
            : t("buttons.exportAll")}
        </Button>
        </div>
      </div>

      {/* Filters */}
      <UserFilters filters={filters} onFiltersChange={setFilters} />

      {/* Bulk actions bar (shown when users are selected) */}
      {selectedUsers.length > 0 && (
        <BulkActions
          selectedCount={selectedUsers.length}
          totalCount={filteredUsers.length}
          onToggleSelectAll={toggleSelectAll}
          onMakeProblemSetters={() =>
            handleBulkRoleUpdate("problem-setter", true)
          }
          onRemoveProblemSetterRole={() =>
            handleBulkRoleUpdate("problem-setter", false)
          }
          onCancel={clearSelectedUsers}
        />
      )}

      {/* User list */}
      {loading && !isRefreshing ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            ))}
        </div>
      ) : error ? (
        <div className="p-6 text-center">
          <p className="text-red-500">{error}</p>
          <Button variant="outline" className="mt-4" onClick={handleRefresh}>
            {t("buttons.tryAgain")}
          </Button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-6 text-center border rounded-lg bg-muted/10">
          <p>{t("noUsersFound")}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onEdit={() => onEditUser(user)}
              onDelete={() => onDeleteUser(user)}
              isSelected={selectedUsers.includes(user.id)}
              onToggleSelect={() => toggleUserSelection(user.id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredUsers.length > 0 && (
        <UserPagination
          displayed={users.length}
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {/* Edit User Dialog */}
      {userToEdit && (
        <EditUserDialog
          isOpen={!!userToEdit}
          onClose={() => setUserToEdit(null)}
          user={userToEdit}
          onSave={onSaveUser}
          loading={isSaving}
        />
      )}

      {/* Delete User Dialog */}
      {userToDelete && (
        <DeleteUserDialog
          isOpen={!!userToDelete}
          onClose={() => setUserToDelete(null)}
          user={userToDelete}
          onDelete={onConfirmDelete}
          loading={isDeleting}
        />
      )}
    </div>
  );
}
