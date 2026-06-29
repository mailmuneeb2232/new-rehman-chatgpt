export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  author: { name: string; avatar: string | null };
  rating: number;
  title: string;
  body: string;
  isVerifiedPurchase: boolean;
  status: ReviewStatus;
  helpfulCount: number;
  createdAt: Date;
}
