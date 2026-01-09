import type { MockSubscriptionPlan, MockSubscription } from "./types";

export const mockSubscriptionPlans: MockSubscriptionPlan[] = [
  // Mock data will be added here when needed
];

export const mockSubscriptions: MockSubscription[] = [
  // Mock data will be added here when needed
];

export function getMockSubscriptionPlans(): MockSubscriptionPlan[] {
  return mockSubscriptionPlans;
}

export function getMockSubscriptions(): MockSubscription[] {
  return mockSubscriptions;
}

export function getMockSubscriptionById(id: string): MockSubscription | undefined {
  return mockSubscriptions.find((sub) => sub.id === id);
}

