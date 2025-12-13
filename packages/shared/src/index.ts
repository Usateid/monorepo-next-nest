/**
 * Shared utilities for the monorepo
 */

export function greet(name: string): string {
  return `Hello, ${name}!`;
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

