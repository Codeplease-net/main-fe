import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { RenderMathJaxText } from "@/components/ui/description/mathjax";
import { AlertTriangle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface FormattedSolutionProps {
  content: string;
  title: string;
}

const formatDescription = (description: string, t: (key: string) => string) => {
  if (!description) {
    return <p>{t("noSolution")}</p>;
  }
  return <RenderMathJaxText content={description} />;
};

export function FormattedSolution({ content, title }: FormattedSolutionProps) {
  const t = useTranslations("Playground.solution");
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [hasMounted, setHasMounted] = useState<boolean>(false);
  
  // Use this effect to check local storage after component mounts
  useEffect(() => {
    const savedPreference = localStorage.getItem(`solution-preference-${title}`);
    if (savedPreference === "show") {
      setShowSolution(true);
    }
    setHasMounted(true);
  }, [title]);
  
  const handleShowSolution = () => {
    setShowSolution(true);
    // Save preference to local storage
    localStorage.setItem(`solution-preference-${title}`, "show");
  };
  
  const handleHideSolution = () => {
    setShowSolution(false);
    // Save preference to local storage
    localStorage.setItem(`solution-preference-${title}`, "hide");
  };
  
  // Don't render anything until after we've checked local storage
  if (!hasMounted) {
    return null;
  }
  
  return (
    <div className="w-full pb-6">
      <h1 className="text-2xl font-bold mb-4">{t("titleFormat", { problemTitle: title })}</h1>
      
      {!showSolution ? (
        <Card className="bg-muted/20 border border-border p-6">
          <div className="flex flex-col items-center text-center gap-4 py-6">
            <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">{t("hiddenTitle")}</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {t("hiddenDescription")}
              </p>
            </div>
            <div className="flex gap-3 mt-2">
              <Button
                onClick={handleShowSolution}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                {t("showButton")}
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-500">
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">{t("visibleStatus")}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHideSolution}
              className="text-sm"
            >
              {t("hideButton")}
            </Button>
          </div>
          <div className="border-t pt-4">
            {formatDescription(content, t)}
          </div>
        </div>
      )}
    </div>
  );
}

export default FormattedSolution;