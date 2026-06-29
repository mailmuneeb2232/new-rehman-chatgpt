import { CustomerSidebar } from '@/components/layout/customer-sidebar';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <CustomerSidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
