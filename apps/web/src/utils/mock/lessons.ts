import type { MockLesson } from "./types";

export const mockLessons: MockLesson[] = [
  // Mock data will be added here when needed
];

export function getMockLessons(): MockLesson[] {
  return mockLessons;
}

export function getMockLessonById(id: string): MockLesson | undefined {
  return mockLessons.find((lesson) => lesson.id === id);
}

