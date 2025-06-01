export interface WoocommerceBooking {
  id: number;
  all_day: boolean;
  cost: string;
  customer_id: number;
  date_created: number;
  date_modified: number;
  end: number;
  google_calendar_event_id: string;
  order_id: number;
  order_item_id: number;
  parent_id: number;
  person_counts: number[];
  product_id: number;
  resource_id: number;
  start: number;
  status: BookingStatus;
  local_timezone: string;
}

export interface FilteredBookings extends WoocommerceBooking {
  order_ids: number[];
}

export type OrderStatus =
  | 'completed'
  | 'pending'
  | 'cancelled'
  | 'on-hold'
  | 'refunded'
  | 'processing'
  | 'failed'
  | 'trash';

export type BookingStatus =
  | 'complete'
  | 'confirmed'
  | 'paid'
  | 'cancelled'
  | 'unpaid'
  | 'pending';

export interface WoocommerceOrder {
  id: number;
  parent_id: number;
  status: OrderStatus;
  currency: string;
  version: string;
  prices_include_tax: boolean;
  date_created: string; // ISO date string
  date_completed: string; // ISO date string
  date_modified: string; // ISO date string
  date_paid: string; // ISO date string
  discount_total: string;
  discount_tax: string;
  shipping_total: string;
  shipping_tax: string;
  cart_tax: string;
  total: string;
  total_tax: string;
  customer_id: number;
  order_key: string;
  billing: BillingInfo;
}

export interface WoocommerceProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  type: string;
  status: string;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
}

interface BillingInfo {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
}
