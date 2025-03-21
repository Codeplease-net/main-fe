import Footer from "@/components/footer";
import Header from "@/components/header";
import ProblemList from "@/components/ProblemsBank/ProblemList";

interface SearchParams {
  [key: string]: string | undefined
}

export default function Polygon({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <header>
        <title>Problems Bank</title>
      </header>
      <Header/>
      <ProblemList searchParams={searchParams}/>
      <Footer />
    </>
  );
}