export interface Member {
  id: number;
  username: string;
  password: string;
  phone: string;
  isActive: boolean;
  name: string;
  balanceAfterCharge: number;
  amount: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UserFilters {
  username: string;
  phone: string;
  name: string;
  isActive: string;
}




