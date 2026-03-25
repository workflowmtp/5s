// src/app/dashboard/layout.tsx
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { ChatFab } from '@/components/layout/ChatFab';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ThemeInit } from '@/components/layout/ThemeInit';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/auth/login');

  const user = session.user as any;

  return (
    <>
      <ThemeInit />
      <div className="flex flex-col h-dvh overflow-hidden">
        <TopBar user={user} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-24 pt-4 max-w-[600px] mx-auto w-full">
          {children}
        </main>
        <BottomNav role={user.role} />
      </div>
      <ChatFab />
      <ConfirmModal />
    </>
  );
}
