import type { Metadata } from 'next';
import { AccountDashboardClient } from './_components/account-dashboard-client';

export const metadata: Metadata = { title: 'My Account — ElectroStore' };

export default function AccountPage() {
  return <AccountDashboardClient />;
}
