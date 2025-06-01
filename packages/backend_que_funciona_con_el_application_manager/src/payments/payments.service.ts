import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { DatabaseService } from 'src/database/database.service';
import Stripe from 'stripe';
import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { StripeService } from 'src/stripe/stripe.service';
import { WoocommerceService } from 'src/woocommerce/woocommerce.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly stripeService: StripeService,
    private readonly woocommerceService: WoocommerceService,
  ) {}

  // Not used right now!
  public async loadFromStripe() {
    Logger.log('Fetching stripe payments', 'PaymentsService');
    const users = await this.databaseService.user.findMany({
      select: {
        email: true,
        id: true,
      },
      where: {
        role: 'STUDENT',
      },
    });
    const registeredEmails = new Set(users.map((user) => user.email));

    // TODO: use a date from the database instead of 5 days ago
    const fiveDaysAgo = Math.floor(
      (Date.now() - 100000 * 24 * 60 * 60 * 1000) / 1000,
    );

    let lastPaymentId: string | undefined = undefined;
    let hasMore = true;
    let payments: Stripe.PaymentIntent[] = [];

    while (hasMore) {
      const paymentIntents =
        await this.stripeService.stripe.paymentIntents.list({
          created: {
            gte: fiveDaysAgo,
          },
          expand: ['data.invoice', 'data.latest_charge'],
          starting_after: lastPaymentId,
        });

      payments = payments.concat(
        paymentIntents.data
          .map((paymentIntent) => {
            paymentIntent.receipt_email = paymentIntent.receipt_email
              ? paymentIntent.receipt_email.toLowerCase()
              : null;
            return paymentIntent;
          })
          .filter(
            (paymentIntent) =>
              paymentIntent.status === 'succeeded' &&
              (paymentIntent.latest_charge as Stripe.Charge).refunded === false,
          )
          .filter((paymentIntent) => {
            // seed data for dev
            if (process.env.NODE_ENV === 'development') {
              // 1 / 4 probability of being john, 1 / 4 probability of being jane and rest for random registered users
              const random = Math.random();
              if (random < 0.25) {
                paymentIntent.receipt_email = 'john@example.com';
              } else if (random < 0.5) {
                paymentIntent.receipt_email = 'jane@example.com';
              } else {
                const randomIndex = Math.floor(Math.random() * users.length);

                paymentIntent.receipt_email = users[randomIndex].email;
              }
            }
            return (
              paymentIntent.receipt_email &&
              registeredEmails.has(paymentIntent.receipt_email)
            );
          }),
      );

      hasMore = paymentIntents.has_more;
      if (hasMore) {
        lastPaymentId = paymentIntents.data[paymentIntents.data.length - 1].id;
      }
    }

    const data: Prisma.PaymentCreateManyArgs['data'] = payments.map(
      (paymentIntent) => {
        const isSubscription =
          paymentIntent.invoice !== null &&
          typeof paymentIntent.invoice !== 'string' &&
          paymentIntent.invoice.subscription;

        return {
          stripePaymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          paidAt: new Date(paymentIntent.created * 1000),
          currency: paymentIntent.currency,
          method: 'STRIPE',
          type: isSubscription ? 'SUBSCRIPTION' : 'ONE_TIME',
          userId: users.find(
            (user) => user.email === paymentIntent.receipt_email,
          ).id,
        };
      },
    );

    const loaded = await this.databaseService.payment.createMany({
      data,
      skipDuplicates: true,
    });

    Logger.log(
      `Fetched ${data.length} stripe payments, and loaded ${loaded.count} into the database`,
      'PaymentsService',
    );
  }

  public async loadFromWoocommerce() {
    Logger.log('Fetching woocommerce payments', 'PaymentsService');
    const orders = await this.woocommerceService.retrieveOrders();
    const users = await this.databaseService.user
      .findMany({
        select: {
          email: true,
          id: true,
        },
        where: {
          role: 'STUDENT',
        },
      })
      .then((users) =>
        users.map((user) => ({ ...user, email: user.email.toLowerCase() })),
      );
    const data: Prisma.PaymentCreateManyArgs['data'] = orders
      .map((order) => {
        // seed data for dev
        if (process.env.NODE_ENV === 'development') {
          // 1 / 4 probability of being john, 1 / 4 probability of being jane and rest for random registered users
          const random = Math.random();
          if (random < 0.25) {
            order.email = 'john@example.com';
          } else if (random < 0.5) {
            order.email = 'jane@example.com';
          }
        }
        const userId = users.find((user) => user.email === order.email)?.id;
        if (!userId) {
          return null;
        }
        return {
          woocommerceOrderId: String(order.orderId),
          amount: order.amount,
          paidAt: order.datePaid,
          currency: order.currency,
          method: 'WOOCOMMERCE',
          type: order.isSubscription ? 'SUBSCRIPTION' : 'ONE_TIME',
          userId,
        };
      })
      .filter(Boolean) as Prisma.PaymentCreateManyArgs['data'];
    const loaded = await this.databaseService.payment.createMany({
      data,
      skipDuplicates: true,
    });

    Logger.log(
      `Fetched ${orders.length} woocommerce payments, and loaded ${loaded.count} into the database`,
      'PaymentsService',
    );
  }

  public async create(createPaymentDto: CreatePaymentDto) {
    await this.databaseService.payment.create({
      data: {
        paidAt: createPaymentDto.paidAt,
        amount: createPaymentDto.amount,
        method: createPaymentDto.method,
        type: createPaymentDto.type,
        description: createPaymentDto.description,
        user: {
          connect: {
            id: createPaymentDto.userId,
          },
        },
        currency: 'eur',
      },
    });
  }

  public async delete(id: string) {
    await this.databaseService.payment.delete({
      where: {
        id,
      },
    });
  }
}
