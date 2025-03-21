import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Problem',
};

export default function ProblemPage({
    params,
}: {
    params: { id: string; locale: string };
}) {
    redirect(`/${params.locale}/problems/${params.id}/description`);
}