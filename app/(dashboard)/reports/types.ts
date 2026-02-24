export interface Payment {
  Id: number;
  PayDate: string | null;
  AddDate: string | null;
  PayType: string | null;
  TrackingNumber: string | null;
  Amount: number;
  Credit: number;
  Status: number | string;
}

export interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

