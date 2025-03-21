import React from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserFilters } from '../types';
import { useTranslations } from 'next-intl';

interface UserFiltersProps {
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
}

const UserFiltersComponent: React.FC<UserFiltersProps> = ({ 
  filters, 
  onFiltersChange 
}) => {
  const t = useTranslations("UsersManagement");
  
  return (
    <div className="flex flex-col md:flex-row gap-3">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("filters.searchPlaceholder")}
          className="pl-10"
          value={filters.search}
          onChange={(e) => {
            onFiltersChange({ ...filters, search: e.target.value });
          }}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          value={filters.role}
          onValueChange={(value: any) =>
            onFiltersChange({ ...filters, role: value })
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={t("filters.role")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allRoles")}</SelectItem>
            <SelectItem value="admin">{t("filters.admins")}</SelectItem>
            <SelectItem value="problem-setter">{t("filters.problemSetters")}</SelectItem>
            <SelectItem value="user">{t("filters.regularUsers")}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.profileStatus}
          onValueChange={(value: any) =>
            onFiltersChange({ ...filters, profileStatus: value })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("filters.profileStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allProfiles")}</SelectItem>
            <SelectItem value="complete">{t("filters.completedProfiles")}</SelectItem>
            <SelectItem value="incomplete">{t("filters.incompleteProfiles")}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.sort}
          onValueChange={(value: any) =>
            onFiltersChange({ ...filters, sort: value })
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={t("filters.sortBy")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t("filters.newestFirst")}</SelectItem>
            <SelectItem value="oldest">{t("filters.oldestFirst")}</SelectItem>
            <SelectItem value="name-asc">{t("filters.nameAZ")}</SelectItem>
            <SelectItem value="name-desc">{t("filters.nameZA")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default UserFiltersComponent;