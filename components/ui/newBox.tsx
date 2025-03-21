import { useTranslations } from "next-intl";
import { Badge } from "./badge";

export default function NewBox(){
  const t = useTranslations('NewBox')
  return <Badge variant="outline" className="bg-green-500 text-white">
  {t('New')}
</Badge>
}