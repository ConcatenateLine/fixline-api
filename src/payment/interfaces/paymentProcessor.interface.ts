export interface PaymentProcessor {
  createCheckoutSession(
    userEmail: string,
    planId: string,
  ): Promise<{ url: string }>;
}
