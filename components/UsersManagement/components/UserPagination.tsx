import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaginationSettings } from '../types';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface UserPaginationProps {
  displayed: number;
  pagination: PaginationSettings;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const UserPagination: React.FC<UserPaginationProps> = ({
  displayed,
  pagination,
  onPageChange,
  onPageSizeChange
}) => {
  const t = useTranslations("UsersManagement");
  
  const totalPages = Math.ceil(pagination.totalUsers / pagination.pageSize);
  
  // Calculate which page numbers to show (always show max 5)
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if there are less than maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include current page
      pageNumbers.push(pagination.currentPage);
      
      // Add pages before current page
      let before = pagination.currentPage - 1;
      let after = pagination.currentPage + 1;
      let pagesAdded = 1; // We already added current page
      
      // Try to add pages alternating before and after current page
      while (pagesAdded < maxPagesToShow) {
        if (before >= 1) {
          pageNumbers.unshift(before);
          before--;
          pagesAdded++;
          if (pagesAdded >= maxPagesToShow) break;
        }
        
        if (after <= totalPages) {
          pageNumbers.push(after);
          after++;
          pagesAdded++;
          if (pagesAdded >= maxPagesToShow) break;
        }
        
        // If we can't add more pages on either side, break
        if (before < 1 && after > totalPages) break;
      }
    }
    
    return pageNumbers;
  };
  
  const pageNumbers = getPageNumbers();
  
  // Navigation buttons should be disabled at boundaries
  const isFirstPage = pagination.currentPage === 1;
  const isLastPage = pagination.currentPage === totalPages || totalPages === 0;

  return (
    <div className="flex flex-col md:flex-row justify-between items-center border-t pt-4 gap-3">
      <div className="text-sm text-muted-foreground">
        {t("pagination.showing", { 
          start: ((pagination.currentPage - 1) * pagination.pageSize) + 1,
          end: Math.min(pagination.currentPage * pagination.pageSize, pagination.totalUsers),
          total: pagination.totalUsers 
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Page controls */}
        <div className="flex items-center gap-1">
          {/* First page button */}
          <button
            className="p-2 rounded-md hover:bg-muted disabled:opacity-50 disabled:pointer-events-none"
            onClick={() => onPageChange(1)}
            disabled={isFirstPage}
            aria-label={t("pagination.first")}
            title={t("pagination.first")}
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          
          {/* Previous page button */}
          <button
            className="p-2 rounded-md hover:bg-muted disabled:opacity-50 disabled:pointer-events-none"
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={isFirstPage}
            aria-label={t("pagination.previous")}
            title={t("pagination.previous")}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          {/* Page numbers */}
          <div className="flex items-center">
            {pageNumbers.map(pageNumber => (
              <button
                key={pageNumber}
                className={`min-w-[2rem] h-8 px-2 flex items-center justify-center rounded-md text-sm 
                  ${pagination.currentPage === pageNumber 
                    ? 'bg-primary text-primary-foreground font-medium' 
                    : 'hover:bg-muted'
                  }`}
                onClick={() => onPageChange(pageNumber)}
                aria-current={pagination.currentPage === pageNumber ? 'page' : undefined}
              >
                {pageNumber}
              </button>
            ))}
          </div>
          
          {/* Next page button */}
          <button
            className="p-2 rounded-md hover:bg-muted disabled:opacity-50 disabled:pointer-events-none"
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={isLastPage}
            aria-label={t("pagination.next")}
            title={t("pagination.next")}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          
          {/* Last page button */}
          <button
            className="p-2 rounded-md hover:bg-muted disabled:opacity-50 disabled:pointer-events-none"
            onClick={() => onPageChange(totalPages)}
            disabled={isLastPage}
            aria-label={t("pagination.last")}
            title={t("pagination.last")}
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
        
        {/* Page size selector */}
        <Select
          value={String(pagination.pageSize)}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger className="w-[110px]">
            <SelectValue placeholder={t("pagination.pageSize")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12">{t("pagination.perPage", { count: 12 })}</SelectItem>
            <SelectItem value="24">{t("pagination.perPage", { count: 24 })}</SelectItem>
            <SelectItem value="48">{t("pagination.perPage", { count: 48 })}</SelectItem>
            <SelectItem value="96">{t("pagination.perPage", { count: 96 })}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default UserPagination;