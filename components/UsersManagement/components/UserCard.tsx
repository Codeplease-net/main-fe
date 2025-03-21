import React from "react";
import { useTranslations } from "next-intl"; // Added import for internationalization
import {
  Calendar,
  Mail,
  Check,
  X,
  Globe,
  User,
  Clock,
  Shield,
  AlertCircle,
  MoreHorizontal,
  Trash,
  Edit,
  UserCog,
} from "lucide-react";

// UI Components
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
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

interface UserCardProps {
  user: User;
  onEdit: () => void;
  onDelete: () => void;
  isSelected: boolean;
  onToggleSelect: () => void;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  onEdit,
  onDelete,
  isSelected,
  onToggleSelect,
}) => {
  // Initialize translations for UsersManagement namespace
  const t = useTranslations("UsersManagement");

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-200 hover:shadow-md ${
        isSelected ? "ring-2 ring-primary ring-offset-2" : ""
      }`}
    >
      {/* Selection checkbox */}
      <div className="absolute top-2 left-2 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
      </div>

      <CardHeader className="p-3 pb-2 bg-muted/30 border-b flex flex-row items-center gap-3">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.fullName || t("userCard.unnamed")}
            className="w-10 h-10 rounded-full border border-primary/20 object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User className="h-5 w-5" />
          </div>
        )}
        <div className="overflow-hidden">
          <h3 className="text-base font-medium truncate">
            {user.fullName || t("userCard.unnamed")}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            @{user.handle || t("userCard.noHandle")} • {user.email || t("userCard.noEmail")}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-auto h-7 w-7">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" /> {t("buttons.editUser")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash className="h-4 w-4 mr-2" /> {t("buttons.deleteUser")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      {/* Roles section */}
      <div className="px-3 pt-2 flex flex-wrap gap-1.5">
        {user["problem-setter"] && (
          <Badge variant="outline" className="bg-primary/5 text-primary text-xs font-normal">
            <Shield className="h-3 w-3 mr-1" />
            {t("roles.problemSetter")}
          </Badge>
        )}

        {user.admin && (
          <Badge variant="outline" className="bg-destructive/5 text-destructive text-xs font-normal">
            <Shield className="h-3 w-3 mr-1" />
            {t("roles.admin")}
          </Badge>
        )}
        
        {user.emailVerified ? (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 text-xs font-normal">
            <Check className="h-3 w-3 mr-1" />
            {t("status.verified")}
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-amber-50 text-amber-600 text-xs font-normal">
            <X className="h-3 w-3 mr-1" />
            {t("status.unverified")}
          </Badge>
        )}
        
        {user.profileCompleted ? (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 text-xs font-normal">
            <Check className="h-3 w-3 mr-1" />
            {t("status.complete")}
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-amber-50 text-amber-600 text-xs font-normal">
            <AlertCircle className="h-3 w-3 mr-1" />
            {t("status.incomplete")}
          </Badge>
        )}
      </div>

      <CardContent className="p-3 pt-2 space-y-2.5 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{user.country || t("userCard.noCountry")}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{user.birthdate || t("userCard.noBirthdate")}</span>
          </div>

          <div className="flex items-center gap-1.5 col-span-2">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span>
              {t("userCard.joined")}: {user.createdAt?.toDate
                ? new Date(user.createdAt.toDate()).toLocaleDateString()
                : t("userCard.unknown")}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-2.5 bg-muted/10 border-t flex justify-between items-center">
        <div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-xs"
            onClick={onToggleSelect}
          >
            {isSelected ? t("buttons.deselect") : t("buttons.select")}
          </Button>
        </div>
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" className="h-8 px-2.5" onClick={onEdit}>
            <Edit className="h-3.5 w-3.5 mr-1" /> {t("buttons.edit")}
          </Button>
          <Button variant="destructive" size="sm" className="h-8 px-2.5" onClick={onDelete}>
            <Trash className="h-3.5 w-3.5 mr-1" /> {t("buttons.delete")}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default UserCard;