import { Controller, Post, Req, Res, RawBodyRequest } from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { StripeService } from './stripe.service';
import { HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('webhook')
  @Public()
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
  ) {
    const signature = req.headers['stripe-signature'] as string;

    if (!signature) {
      res.status(HttpStatus.BAD_REQUEST).send('No Stripe signature found');
      return;
    }

    try {
      const rawBody = req.rawBody;

      if (!rawBody) {
        throw new Error('No raw body found');
      }

      await this.stripeService.handleWebhook(signature, rawBody);
      res.json({ received: true });
    } catch (err) {
      console.error(`Webhook Error: ${err.message}`);
      res.status(HttpStatus.BAD_REQUEST).send(`Webhook Error: ${err.message}`);
    }
  }
}
