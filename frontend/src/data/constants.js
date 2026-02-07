export const Role = {
  ADMIN: 'ADMIN',
  INTERNAL: 'INTERNAL',
  CUSTOMER: 'CUSTOMER',
};

export const InternalRequestStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

export const SubscriptionStatus = {
  DRAFT: 'DRAFT',
  QUOTATION: 'QUOTATION',
  CONFIRMED: 'CONFIRMED',
  ACTIVE: 'ACTIVE',
  CLOSED: 'CLOSED',
};

export const InvoiceStatus = {
  DRAFT: 'DRAFT',
  CONFIRMED: 'CONFIRMED',
  PAID: 'PAID',
};

export const DiscountType = {
  FIXED: 'FIXED',
  PERCENTAGE: 'PERCENTAGE',
};

export const SUBSCRIPTION_TRANSITIONS = {
  [SubscriptionStatus.DRAFT]: [SubscriptionStatus.QUOTATION],
  [SubscriptionStatus.QUOTATION]: [SubscriptionStatus.CONFIRMED, SubscriptionStatus.DRAFT],
  [SubscriptionStatus.CONFIRMED]: [SubscriptionStatus.ACTIVE, SubscriptionStatus.QUOTATION],
  [SubscriptionStatus.ACTIVE]: [SubscriptionStatus.CLOSED],
  [SubscriptionStatus.CLOSED]: [],
};

export const INVOICE_TRANSITIONS = {
  [InvoiceStatus.DRAFT]: [InvoiceStatus.CONFIRMED],
  [InvoiceStatus.CONFIRMED]: [InvoiceStatus.PAID],
  [InvoiceStatus.PAID]: [],
};
