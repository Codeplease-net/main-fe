import PlaygroundComponent from '@/components/Problems/PlaygroundPage';

interface PlaygroundPageProps {
  params: { id: string, tab: string };
  searchParams: { [key: string]: string | undefined };
}

export default async function PlayGroundPage({
  params,
  searchParams
}: PlaygroundPageProps){
  return (
    <PlaygroundComponent id={params.id} tab={params.tab} searchParams={searchParams} />
  )
}