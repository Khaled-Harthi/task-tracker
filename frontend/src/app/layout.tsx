import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'متتبع المهام | Task Tracker',
  description: 'تطبيق متتبع المهام - نظّم مهامك ومشاريعك بسهولة',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
