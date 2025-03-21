import { useTranslations } from "next-intl";
import { RenderMathJaxText } from "@/components/ui/description/mathjax";
import { CardTitle } from "@/components/ui/card";
import { CategoryBadge } from "@/components/Problems/ProblemsetPage/components/CategoryBadges";

interface FormattedDescriptionProps {
  content: string;
  title: string;
  difficulty: number;
  categories: string[];
}

const formatDescription = (description: string, t: (key: string) => string) => {
  if (!description) {
    return <p>{t("NoDes")}</p>;
  }
  return <RenderMathJaxText content={description} />;
};

export function FormattedDescription({
  content,
  title,
  categories,
}: FormattedDescriptionProps) {
  const t = useTranslations("Playground");
  console.log(categories)
  return (
    <div className="w-full pb-2">
      <CardTitle className="text-2xl mb-4">{title}</CardTitle>
      <div className="flex items-center space-x-2 mb-4">
        {categories?.map((category) => (
          <CategoryBadge key={category} category={category} />
        ))}
      </div>
      {formatDescription(content, t)}
    </div>
  );
}

export default FormattedDescription;