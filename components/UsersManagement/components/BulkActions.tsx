import React from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from 'next-intl';

interface BulkActionsProps {
  selectedCount: number;
  totalCount: number;
  onToggleSelectAll: () => void;
  onMakeProblemSetters: () => void;
  onRemoveProblemSetterRole: () => void;
  onCancel: () => void;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCount,
  totalCount,
  onToggleSelectAll,
  onMakeProblemSetters,
  onRemoveProblemSetterRole,
  onCancel,
}) => {
  const t = useTranslations("UsersManagement");

  return (
    <div className="bg-muted/30 border rounded-lg p-3 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          {t("bulkActions.usersSelected", { count: selectedCount })}
        </span>
        <Button variant="ghost" size="sm" onClick={onToggleSelectAll}>
          {selectedCount === totalCount
            ? t("bulkActions.deselectAll")
            : t("bulkActions.selectAll")}
        </Button>
      </div>

      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {t("bulkActions.bulkActions")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t("bulkActions.roleManagement")}</DropdownMenuLabel>
            <DropdownMenuItem onClick={onMakeProblemSetters}>
              {t("bulkActions.makeProblemSetters")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onRemoveProblemSetterRole}>
              {t("bulkActions.removeProblemSetterRole")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
        >
          {t("bulkActions.cancel")}
        </Button>
      </div>
    </div>
  );
};

export default BulkActions;