import { Inject, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { MODULE_OPTIONS_TOKEN } from './stripe.module';
import { StripeModuleOptions } from './stripe.interface';
import { DatabaseService } from './../database/database.service';

@Injectable()
export class StripeService {
  public readonly stripe: Stripe;
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private options: StripeModuleOptions,
    private databaseService: DatabaseService,
  ) {
    if (!this.options.isActivated) {
      this.stripe = null;
      return;
    }
    this.stripe = new Stripe(this.options.apiKey, this.options.options);
  }
}
