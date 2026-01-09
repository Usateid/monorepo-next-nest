import type { MockUser } from "./types";

export const mockUsers: MockUser[] = [
  // Mock data will be added here when needed
];

export function getMockUsers(): MockUser[] {
  return mockUsers;
}

export function getMockUserById(id: string): MockUser | undefined {
  return mockUsers.find((user) => user.id === id);
}

