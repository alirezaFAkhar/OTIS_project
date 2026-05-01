export interface Payment {
  Id: number;
  MemberId: number | string | null;
  MemberName?: string | null;
  MemberUsername?: string | null;
  MemberPhone?: string | null;
  ComplexId: number | null;
  PayDate: string | null;
  AddDate: string | null;
  PayType: string;
  TrackingNumber: string | null;
  Amount: number;
  Credit: number;
  Status: string | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaymentFilters {
  fromDate: string;
  toDate: string;
  trackingNumber: string;
  status: string;
}
















