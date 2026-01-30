import { redirect } from 'next/navigation';

interface PageProps {
  params: { locale: string };
}

export default function HomePage({ params: { locale } }: PageProps) {
  redirect(`/${locale}/dashboard`);
}
