export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface Social {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  website?: string;
}

export interface Contact {
  _id?: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  company?: string;
  jobTitle?: string;
  department?: string;
  address?: Address;
  birthday?: string;
  notes?: string;
  tags?: string[];
  groups?: string[];
  social?: Social;
  avatar?: string;
  isFavorite?: boolean;
  isBlocked?: boolean;
  lastContacted?: string;
  source?: 'manual' | 'import' | 'api';
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactFilter {
  search?: string;
  group?: string;
  tag?: string;
  isFavorite?: boolean;
  company?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface ContactStats {
  total: number;
  favorites: number;
  withEmail: number;
  withPhone: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  lastLogin?: string;
  createdAt?: string;
}
