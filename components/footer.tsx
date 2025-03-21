import { DiscordLogoIcon } from "@radix-ui/react-icons";
import { Facebook, Youtube, Mail, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("Footer");
  return (
    <footer className="bg-background py-12 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">CodePlease</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              {t("Description")}
            </p>
            <div className="flex items-center space-x-6">
              <Link
                href="https://www.facebook.com/codepleaseofficial/"
                target="_blank"
                className="text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110"
              >
                <Facebook className="w-5 h-5" />
              </Link>
              <Link
                href="https://discord.gg/Nygcq77rKn"
                target="_blank"
                className="text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110"
              >
                <DiscordLogoIcon className="w-5 h-5" />
              </Link>
              <Link
                href="https://www.youtube.com/@codepleasenet"
                target="_blank"
                className="text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110"
              >
                <Youtube className="w-5 h-5" />
              </Link>
              <Link
                href="mailto:contact@codeplease.net"
                className="text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110"
              >
                <Mail className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t("Platform")}</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 hover:gap-2 duration-200"
                >
                  {t("About")}
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link
                  href="/problems"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 hover:gap-2 duration-200"
                >
                  {t("Problems")}
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link
                  href="/topics"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 hover:gap-2 duration-200"
                >
                  {t("Topics")}
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t("Resources & Legal")}</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/developer-team"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 hover:gap-2 duration-200"
                >
                  {t("Our Developer Team")}
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link
                  href="/legality/terms-and-conditions"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 hover:gap-2 duration-200"
                >
                  {t("Terms and Conditions")}
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link
                  href="/legality/privacy-policy"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 hover:gap-2 duration-200"
                >
                  {t("Privacy Policy")}
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div> */}
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} CodePlease. {t("All Rights Reserved")}.
            </p>
            <p className="text-sm text-muted-foreground">
              {t("Outline")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
