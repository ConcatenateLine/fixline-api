import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RegisterService as RegisterAccountService } from 'src/account/register/register.service';
import { RegisterService as RegisterSubscriptionService } from 'src/subscriptions/register/register.service';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe;
  private webhookSecret: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly registerAccountService: RegisterAccountService,
    private readonly registerSubscriptionService: RegisterSubscriptionService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY', ''), {
      apiVersion: this.configService.get(
        'STRIPE_API_VERSION',
        '2025-08-27.basil',
      ),
    });
    this.webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET', '');

    if (!this.webhookSecret) {
      this.logger.warn(
        'STRIPE_WEBHOOK_SECRET is not set. Webhook verification will fail.',
      );
    }
  }

  async handleWebhook(signature: string, rawBody: Buffer) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.webhookSecret,
      );
    } catch (err) {
      throw new Error(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(
            event.data.object as Stripe.Checkout.Session,
          );
          break;
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          await this.handleSubscriptionUpdate(
            event.data.object as Stripe.Subscription,
          );
          break;
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(
            event.data.object as Stripe.Invoice,
          );
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;
        // Add more event types as needed
        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error(`Error handling webhook event ${event.type}:`, error);
      throw new Error(`Webhook Error: ${error.message}`);
    }

    return { received: true };
  }

  private async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
  ) {
    this.logger.log(`Processing checkout session: ${session.id}`);

    this.logger.log(`Session mode: ${session.mode}`);
    this.logger.log(`Session subscription: ${session.subscription}`);
    
    if (session.mode === 'subscription' && session.subscription) {
      const account =
        await this.registerAccountService.registerAccount(session);
      await this.registerSubscriptionService.registerSubscription(
        session,
        account,
      );
      this.logger.log(`Successfully processed checkout session: ${session.id}`);
    }
  }

  private async handleSubscriptionUpdate(subscription: Stripe.Subscription) {
    // Handle subscription updates (e.g., plan changes, cancellations)
    this.logger.log(`Subscription ${subscription.id} was updated`);
    // Implement your subscription update logic here
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice) {
    // Handle successful payment
    this.logger.log(`Payment succeeded for invoice ${invoice.id}`);
    // Implement your payment success logic here
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    // Handle failed payment
    this.logger.warn(`Payment failed for invoice ${invoice.id}`);
    // Implement your payment failure logic here
  }
}
