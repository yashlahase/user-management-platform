export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: string;
  name: string;
  email: string;
  primaryMobile: string;
  secondaryMobile: string | null;
  aadhaar: string;
  pan: string;
  dateOfBirth: string; // ISO string or YYYY-MM-DD
  placeOfBirth: string;
  currentAddress: string;
  permanentAddress: string;
  
  // Enterprise Fields
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isDeleted: boolean;
  version: number;
  createdBy: string;
  updatedBy: string | null;
  status: UserStatus;
  remarks: string | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiPaginatedResponse<T> extends ApiResponse<T> {
  pagination: PaginationMeta;
}
