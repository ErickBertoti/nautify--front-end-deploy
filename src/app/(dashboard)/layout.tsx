'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { PageTransition } from '@/components/shared/PageTransition';
import { UserProvider } from '@/contexts/UserContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="lg:ml-64">
          <Header />
          <main className="p-4 lg:p-6">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
    </UserProvider>
  );
}
