import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { z } from 'zod';
import axios from 'axios';
import {
  FilteredBookings,
  WoocommerceBooking,
  WoocommerceOrder,
  WoocommerceProduct,
} from './dto/get-bookings.response.dto';
import { fromUnixTime } from 'date-fns';

const CompletedOrderInfoSchema = z
  .object({
    customer_id: z.number(),
    id: z.number(),
    total: z.string(),
    currency: z.string(),
    billing: z
      .object({
        email: z.string().optional(),
      })
      .optional(),
    date_paid: z.string(),
    created_via: z.string(),
  })
  .required();

const CustomerInfoSchema = z.object({
  email: z.string(),
});
@Injectable()
export class WoocommerceService {
  private readonly ordersEndpoint = '/wp-json/wc/v3/orders';
  private readonly productsEndpoint = '/wp-json/wc/v3/products';
  private readonly customersEndpoint = '/wp-json/wc/v3/customers';
  private readonly bookingsEndpoint = '/wp-json/wc-bookings/v1/bookings';

  private productCache = new Map<number, WoocommerceProduct>();
  private ordersCache = new Map<number, WoocommerceOrder>();

  private readonly baseUrl = this.configService.getOrThrow<string>(
    'WOOCOMMERCE_API_BASE_URL',
  );
  private readonly apiKey = this.configService.getOrThrow<string>(
    'WOOCOMMERCE_API_KEY',
  );
  private readonly apiSecret = this.configService.getOrThrow<string>(
    'WOOCOMMERCE_API_SECRET',
  );

  private readonly httpHeaders = {
    Authorization: `Basic ${Buffer.from(
      `${this.apiKey}:${this.apiSecret}`,
    ).toString('base64')}`,
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly http: HttpService,
  ) {}

  /**
   * Retrieves all orders from the WooCommerce API
   * @returns An array of orders
   */
  public async retrieveOrders() {
    const totalOrders: Array<{
      customerId: number;
      orderId: number;
      amount: number;
      currency: string;
      email: string;
      datePaid: Date;
      isSubscription: boolean;
    }> = [];

    let currentPage = 1;
    let completed = false;
    /*
    https://woocommerce.github.io/woocommerce-rest-api-docs/#parameters
    Link Header
    Pagination info is included in the Link Header. It's recommended that you follow these values instead of building your own URLs where possible.

    Link: <https://www.example.com/wp-json/wc/v3/products?page=2>; rel="next",
    <https://www.example.com/wp-json/wc/v3/products?page=3>; rel="last"`
    The possible rel values are:

    Value	Description
    next	Shows the URL of the immediate next page of results.
    last	Shows the URL of the last page of results.
    first	Shows the URL of the first page of results.
    prev	Shows the URL of the immediate previous page of results.
    */
    while (!completed) {
      try {
        const orders = await lastValueFrom(
          this.http.get(
            this.baseUrl + this.ordersEndpoint + `?page=${currentPage}`,
            {
              headers: this.httpHeaders,
            },
          ),
        );
        // check if completed
        const linkHeader = orders.headers.next;
        if (!linkHeader) {
          completed = true;
        }
        const partialOrders = orders.data
          .map((order: any) => {
            const result = CompletedOrderInfoSchema.safeParse(order);
            if (!result.success) {
              return null;
            }
            const data = result.data;
            try {
              return {
                customerId: data.customer_id,
                orderId: data.id,
                amount: parseFloat(data.total) * 100, // it returns an amount in EUR, but we want to store it in cents
                currency: data.currency,
                billingEmail: data.billing?.email,
                datePaid: new Date(data.date_paid),
                isSubscription: data.created_via === 'subscription',
              };
            } catch (error) {
              return null;
            }
          })
          .filter(Boolean) as Array<{
          customerId: number;
          orderId: number;
          amount: number;
          datePaid: Date;
          currency: string;
          isSubscription: boolean;
          billingEmail: string | undefined;
        }>;
        // We need to retrieve first orders. But those orders dont include a 'customer' object, only a 'customer_id' field.
        // We need to retrieve the customer info from the 'customer' endpoint, and check their email from there.
        const completeInfoOrders = [];
        for (const order of partialOrders) {
          let email = order.billingEmail;
          const AULA_EMAIL = this.configService.get<string>(
            'SENDINBLUE_SENDER_EMAIL',
          );
          // Given to how the managers bill, sometimes payments will have their own email: info@.....com
          // But that does not correspond to the customer email
          // So we have various options.
          // If customerId is 0, we keep the billingEmail, since customerId == 0 means a guest.
          // If customerId is not 0 and we do not have an actual email (existing or not from AULA), we retrieve the customer info, and try to get the email from there.
          // In other conditions, we keep the billingEmail, since it should be the actual customer email.
          if (
            ((email && email === AULA_EMAIL) || !email) &&
            order.customerId !== 0
          ) {
            const customer = await lastValueFrom(
              this.http.get(
                `${this.baseUrl}${this.customersEndpoint}/${order.customerId}`,
                {
                  headers: {
                    Authorization: `Basic ${Buffer.from(
                      `${this.apiKey}:${this.apiSecret}`,
                    ).toString('base64')}`,
                  },
                },
              ),
            );
            const result = CustomerInfoSchema.safeParse(customer.data);
            if (result.success) {
              const data = result.data;
              email = data.email;
            }
          }

          completeInfoOrders.push({
            ...order,
            email,
          });
        }
        totalOrders.push(...completeInfoOrders);
        currentPage++;
      } catch (error) {
        return null;
      }
    }

    return totalOrders;
  }

  /**
   * Retrieves bookings from the WooCommerce API
   * @returns An array of bookings
   */
  public async retrieveBookings() {
    // Fetch all bookings
    const { data: bookings } = await axios.get<WoocommerceBooking[]>(
      this.baseUrl + this.bookingsEndpoint,
      { headers: this.httpHeaders },
    );

    if (bookings.length === 0) return [];

    // Remove duplicates and initialize product cache
    const bookingMap = new Map<string, FilteredBookings>();

    bookings.forEach(({ start, end, order_id, ...book }) => {
      const key = `${start}_${end}`;

      if (!bookingMap.has(key)) {
        bookingMap.set(key, { ...book, start, end, order_ids: [], order_id });
      }

      bookingMap.get(key).order_ids.push(order_id);
    });

    const filteredBookings = Array.from(bookingMap.values());

    // Fetch product with caching
    const getProduct = async (
      productId: number,
    ): Promise<WoocommerceProduct | null> => {
      if (this.productCache.has(productId)) {
        return this.productCache.get(productId) || null;
      }

      try {
        const { data: product } = await axios.get<WoocommerceProduct>(
          `${this.baseUrl}${this.productsEndpoint}/${productId}`,
          { headers: this.httpHeaders },
        );
        this.productCache.set(productId, product);
        return product;
      } catch (error) {
        console.error(`Failed to fetch product with ID ${productId}:`, error);
        this.productCache.set(productId, null); // Cache null to prevent further requests
        return null;
      }
    };

    // Map filtered bookings with product data
    return Promise.all(
      filteredBookings.map(async (book) => {
        const product = await getProduct(book.product_id);

        return {
          id: book.id,
          cost: book.cost,
          dateCreated: fromUnixTime(book.date_created),
          startDate: fromUnixTime(book.start),
          endDate: fromUnixTime(book.end),
          orderIds: book.order_ids,
          productId: book.product_id,
          status: book.status,
          event: product
            ? {
                name: product.name,
                dateCreated: product.date_created,
                description: product.description,
              }
            : null,
        };
      }),
    );
  }

  /**
   * Retrieves orders by current ids from the WooCommerce API
   * @returns An array of filtered orders
   */
  public async retrieveCurrentOrders(ordersIds: number[]) {
    const getOrder = async (
      orderId: number,
    ): Promise<WoocommerceOrder | null> => {
      if (this.ordersCache.has(orderId)) {
        return this.ordersCache.get(orderId) || null;
      }

      try {
        const { data: order } = await axios.get<WoocommerceOrder>(
          `${this.baseUrl}${this.ordersEndpoint}/${orderId}`,
          { headers: this.httpHeaders },
        );

        this.ordersCache.set(orderId, order);

        return order;
      } catch (error) {
        console.error(`Failed to fetch product with ID ${orderId}:`, error);

        this.ordersCache.set(orderId, null); // Cache null to prevent further requests
        return null;
      }
    };

    return Promise.all(
      ordersIds.map(async (id) => {
        const order = await getOrder(id);

        return {
          id: order.id,
          status: order.status,
          dateCreated: order.date_created,
          dateCompleted: order.date_completed,
          datePaid: order.date_paid,

          user: {
            customerId: order.customer_id,
            ...order.billing,
          },
        };
      }),
    );
  }
}
