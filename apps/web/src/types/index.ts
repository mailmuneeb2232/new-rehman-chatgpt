export type * from '@electronic-store/types';

export interface PageProps {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export interface LayoutProps {
  children: React.ReactNode;
  params?: Promise<Record<string, string>>;
}
