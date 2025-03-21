import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User } from '../types';
import { useTranslations } from 'next-intl';

interface DeleteUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onDelete: () => void;
  loading: boolean;
}

const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  isOpen,
  onClose,
  user,
  onDelete,
  loading
}) => {
  const t = useTranslations("UsersManagement");
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("deleteUser.title")}</DialogTitle>
          <DialogDescription>
            {t("deleteUser.confirmation", { 
              name: user.fullName || user.email || t("deleteUser.thisUser") 
            })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
          >
            {t("buttons.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={loading}
          >
            {loading ? t("buttons.deleting") : t("buttons.deleteUser")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUserDialog;