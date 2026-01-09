/**
 * Type definitions for mock data structures
 * These types should match the database schema when implementing real functionality
 */

export interface MockUser {
  id: string;
  email: string;
  role: "user" | "admin";
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  profile?: {
    id: string;
    userId: string;
    name: string;
    birthDate?: Date;
    address?: string;
    fiscalCode?: string;
  };
}

export interface MockSubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in days
  features: string[];
  active: boolean;
  createdAt: Date;
}

export interface MockSubscription {
  id: string;
  userId: string;
  planId: string;
  startDate: Date;
  endDate: Date;
  status: "active" | "expired" | "cancelled";
  createdAt: Date;
}

export interface MockLesson {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  startTime: Date;
  endTime: Date;
  maxParticipants: number;
  currentParticipants: number;
  status: "scheduled" | "completed" | "cancelled";
  createdAt: Date;
}

export interface MockEvent {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  maxParticipants?: number;
  currentParticipants: number;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  createdAt: Date;
}

export interface MockTeacher {
  id: string;
  userId: string;
  bio?: string;
  specialties: string[];
  hourlyRate?: number;
  active: boolean;
  createdAt: Date;
  profile?: {
    name: string;
    email: string;
  };
}
