import type { MockTeacher } from "./types";

export const mockTeachers: MockTeacher[] = [
  // Mock data will be added here when needed
];

export function getMockTeachers(): MockTeacher[] {
  return mockTeachers;
}

export function getMockTeacherById(id: string): MockTeacher | undefined {
  return mockTeachers.find((teacher) => teacher.id === id);
}

