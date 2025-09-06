export const PRODUCTS = {
  basic: {
    stripe: {
      productId: 'prod_basic',
      priceId: 'price_basic_monthly',
    },
  },
  pro: {
    stripe: {
      productId: 'prod_pro',
      priceId: 'price_pro_monthly',
    },
  },
  enterprise: {
    stripe: {
      productId: 'prod_enterprise',
      priceId: 'price_enterprise_monthly',
    },
  },
} as const;
