import apiClient from './api';
import { User, ApiResponse, ApiPaginatedResponse } from '../types/user';
import { UserFormData } from '../utils/validators';

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  isDeleted?: boolean;
}

export const userService = {
  getUsers: async (params: ListUsersParams): Promise<ApiPaginatedResponse<User[]>> => {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },

  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (data: UserFormData): Promise<ApiResponse<User>> => {
    const response = await apiClient.post('/users', data);
    return response.data;
  },

  updateUser: async (id: string, data: UserFormData & { version: number }): Promise<ApiResponse<User>> => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },

  restoreUser: async (id: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.patch(`/users/${id}/restore`);
    return response.data;
  },
};
