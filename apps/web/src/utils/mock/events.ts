import type { MockEvent } from "./types";

export const mockEvents: MockEvent[] = [
  // Mock data will be added here when needed
];

export function getMockEvents(): MockEvent[] {
  return mockEvents;
}

export function getMockEventById(id: string): MockEvent | undefined {
  return mockEvents.find((event) => event.id === id);
}

