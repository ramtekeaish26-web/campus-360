import { ApiErrorResponse, ApiSuccessResponse } from '../types/index.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  code: string;
  statusCode: number;
  details?: unknown;

  constructor(message: string, code: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('campus360_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('campus360_token', token);
    } else {
      localStorage.removeItem('campus360_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('campus360_token');
    }
    return this.token;
  }

  private getHeaders(customHeaders?: HeadersInit): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return {
      ...headers,
      ...customHeaders,
    };
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const headers = this.getHeaders(options.headers);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      let json: ApiSuccessResponse<T> | ApiErrorResponse;
      try {
        json = await response.json();
      } catch {
        if (!response.ok) {
          throw new ApiError(
            `HTTP ${response.status} ${response.statusText}`,
            'HTTP_ERROR',
            response.status
          );
        }
        return {} as T;
      }

      if (!response.ok || !json.success) {
        const errorData = (json as ApiErrorResponse).error || {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred.',
        };

        if (response.status === 401) {
          // Token expired or invalid, clear stored token
          this.setToken(null);
        }

        throw new ApiError(
          errorData.message || 'Request failed',
          errorData.code || 'UNKNOWN_ERROR',
          response.status,
          errorData.details
        );
      }

      return (json as ApiSuccessResponse<T>).data;
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError(
        err instanceof Error ? err.message : 'Network connection failed',
        'NETWORK_ERROR',
        0
      );
    }
  }

  get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
