"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const t = useTranslations("Problems");

  const renderPageButtons = () => {
    const buttons = [];

    // Always show first page
    buttons.push(
      <Button
        key="first"
        variant={currentPage === 1 ? "default" : "outline"}
        size="sm"
        onClick={() => onPageChange(1)}
        className="min-w-[2.5rem]"
        disabled={currentPage === 1}
      >
        1
      </Button>
    );

    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);

    // Add ellipsis after first page if needed
    if (startPage > 2) {
      buttons.push(
        <span key="dots-1" className="px-2 text-muted-foreground">
          {t("ellipsis")}
        </span>
      );
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(i)}
          className="min-w-[2.5rem]"
        >
          {i}
        </Button>
      );
    }

    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      buttons.push(
        <span key="dots-2" className="px-2 text-muted-foreground">
          {t("ellipsis")}
        </span>
      );
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      buttons.push(
        <Button
          key="last"
          variant={currentPage === totalPages ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(totalPages)}
          className="min-w-[2.5rem]"
          disabled={currentPage === totalPages}
        >
          {totalPages}
        </Button>
      );
    }

    return buttons;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        {t("previous")}
      </Button>

      <div className="flex items-center gap-2">{renderPageButtons()}</div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        {t("next")}
      </Button>
    </div>
  );
}