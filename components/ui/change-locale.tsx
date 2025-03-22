'use client';

import { useLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import listCountry from '../../messages/listlang.json'
import clsx from 'clsx';
import { useParams } from 'next/navigation';
import { useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/routing';
import { Check, Globe } from "lucide-react";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";


export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const params = useParams();

  function changeLocale(nextLocale: string) {
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- TypeScript will validate that only known `params`
        // are used in combination with a given `pathname`. Since the two will
        // always match for the current route, we can skip runtime checks.
        { pathname, params },
        { locale: nextLocale }
      );
      // Reload to apply changes
      window.location.reload();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 px-0 data-[state=open]:bg-muted border"
          disabled={isPending}
        >
          <Globe className="h-4 w-4" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {routing.locales.map((localeOption) => (
          <DropdownMenuItem
            key={localeOption}
            onClick={() => changeLocale(localeOption)}
            className={clsx(
              "flex cursor-pointer items-center gap-2 px-3 py-2 text-sm",
              locale === localeOption && "bg-primary/10 font-medium text-primary"
            )}
          >
            {locale === localeOption && (
              <Check className="h-4 w-4 text-primary" />
            )}
            <span className={locale !== localeOption ? "pl-6" : ""}>
              {listCountry[localeOption]}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}