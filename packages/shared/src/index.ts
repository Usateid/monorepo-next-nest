/**
 * Shared utilities for the monorepo
 *
 * Add shared types, constants, and helper functions here.
 * These can be imported in both frontend and backend.
 *
 * Note: For database types, use @monorepo/db instead.
 */

export function greet(name: string): string {
  return `Hello, ${name}!`;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
