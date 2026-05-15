import axios from 'axios';
import router from '../router';
import type {
  ApiSuccess,
  PaginatedData,
  AdminLoginResponse,
  SeriesListItem,
  CreateSeriesRequest,
  UpdateSeriesRequest,
  Series,
  Item,
  CreateItemRequest,
  UpdateItemRequest,
  UploadImageResponse,
  UserListItem,
  UserDetail,
  BanUserResponse,
  StatsResponse,
} from '../types';

const http = axios.create({
  baseURL: '/api/admin',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach JWT token
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: unwrap data, handle 401
http.interceptors.response.use(
  (res) => {
    const body = res.data as ApiSuccess;
    if (body.code === 200 || body.code === 201) {
      return body.data as any;
    }
    return Promise.reject(new Error(body.message || '请求失败'));
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_info');
      router.push('/login');
    }
    const msg = err.response?.data?.message || err.message || '网络错误';
    return Promise.reject(new Error(msg));
  },
);

// Helpers to extract paginated data
function paginated<T>(data: PaginatedData<T>): PaginatedData<T> {
  return data;
}

// ====== Auth ======
export const authApi = {
  login: (username: string, password: string) =>
    http.post<any, AdminLoginResponse>('/auth/login', { username, password }),
};

// ====== Series ======
export const seriesApi = {
  list: (params?: { page?: number; pageSize?: number; keyword?: string; sortBy?: string; sortOrder?: string }) =>
    http.get<any, PaginatedData<SeriesListItem>>('/series', { params }).then(paginated),
  create: (data: CreateSeriesRequest) =>
    http.post<any, Series>('/series', data),
  update: (id: string, data: UpdateSeriesRequest) =>
    http.put<any, Series>(`/series/${id}`, data),
  delete: (id: string) =>
    http.delete<any, { success: true }>(`/series/${id}`),
};

// ====== Items ======
export const itemsApi = {
  list: (seriesId: string, params?: { page?: number; pageSize?: number; rarity?: string; keyword?: string }) =>
    http.get<any, PaginatedData<Item>>(`/series/${seriesId}/items`, { params }).then(paginated),
  create: (data: CreateItemRequest) =>
    http.post<any, Item>('/items', data),
  update: (id: string, data: UpdateItemRequest) =>
    http.put<any, Item>(`/items/${id}`, data),
  delete: (id: string) =>
    http.delete<any, { success: true }>(`/items/${id}`),
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return http.post<any, UploadImageResponse>('/items/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ====== Users ======
export const usersApi = {
  list: (params?: { page?: number; pageSize?: number; keyword?: string; isBanned?: boolean; sortBy?: string; sortOrder?: string }) =>
    http.get<any, PaginatedData<UserListItem>>('/users', { params }).then(paginated),
  detail: (id: string) =>
    http.get<any, UserDetail>(`/users/${id}`),
  ban: (id: string, isBanned: boolean, reason?: string) =>
    http.patch<any, BanUserResponse>(`/users/${id}/ban`, { isBanned, reason }),
};

// ====== Stats ======
export const statsApi = {
  get: () =>
    http.get<any, StatsResponse>('/stats'),
};

export default http;
