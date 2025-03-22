import ProblemDetail from "@/components/ProblemsBank/Problem";

interface PageProps {
    params: { id: string, tab: string};
    searchParams: { lang?: string };
}  

export default async function PolygonPage({
  params,
  searchParams
}: PageProps){
    const lang = (searchParams.lang || 'en');

  return (
    <>
      <head>
        <title>{`${params.id}`}</title>
      </head>
      <ProblemDetail id={params.id} lang={lang} tab={params.tab}/>
    </>
  )
}