'use client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Package, Heart, MapPin, User, Bell, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api-client';
import { formatDate, formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const ORDER_STATUS_VARIANT: Record<string, any> = {
  PENDING: 'warning', PAID: 'success', SHIPPED: 'info', DELIVERED: 'success', CANCELLED: 'destructive',
};

export function AccountDashboardClient() {
  const { user, logout } = useAuthStore();

  const { data: profile } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => api.get<any>('/users/me'),
    enabled: !!user,
  });

  const { data: ordersData } = useQuery({
    queryKey: ['user', 'orders'],
    queryFn: () => api.get<any>('/users/me/orders', { limit: 5 }),
    enabled: !!user,
  });

  const quickLinks = [
    { icon: Package, label: 'Orders', href: '/account/orders', count: profile?._count?.orders },
    { icon: Heart, label: 'Wishlist', href: '/wishlist', count: profile?._count?.wishlistItems },
    { icon: MapPin, label: 'Addresses', href: '/account/addresses' },
    { icon: User, label: 'Profile', href: '/account/profile' },
    { icon: Bell, label: 'Notifications', href: '/account/notifications' },
    { icon: Settings, label: 'Settings', href: '/account/settings' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-20">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white">My Account</h1>
          {user && <p className="text-zinc-500 mt-1">Welcome back, {user.firstName}!</p>}
        </div>
        <Button variant="outline" size="sm" onClick={logout}>
          <LogOut size={16} /> Sign Out
        </Button>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {quickLinks.map(({ icon: Icon, label, href, count }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-4 text-center transition-all hover:border-violet-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <Icon size={18} className="text-zinc-700 dark:text-zinc-300" />
            </div>
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{label}</span>
            {count !== undefined && <span className="text-xs text-zinc-400">{count}</span>}
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-black text-lg text-zinc-900 dark:text-white">Recent Orders</h2>
          <Link href="/account/orders" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">View all →</Link>
        </div>

        {!ordersData?.data?.length ? (
          <p className="text-sm text-zinc-500 py-6 text-center">No orders yet. <Link href="/shop" className="underline">Start shopping →</Link></p>
        ) : (
          <div className="space-y-3">
            {ordersData.data.map((order: any) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.orderNumber}`}
                className="flex items-center justify-between rounded-xl border border-zinc-100 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
              >
                <div>
                  <p className="font-semibold text-sm text-zinc-900 dark:text-white">{order.orderNumber}</p>
                  <p className="text-xs text-zinc-500">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={ORDER_STATUS_VARIANT[order.status] ?? 'secondary'}>{order.status}</Badge>
                  <span className="font-bold text-sm">{formatPrice(order.total)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
