// data/mock.js
// Private fixture data — only services/orders.js should import from here.

export const _confirmed = {
  count: 28,
  shopify: 18,
  ginkgo: 10,
  territory: 'Lahore Central',
};

export const _reconList = [
  { id: 'LS-0312', distributor: 'Bilal Traders', delivered: 22, returned: 2, collected: 48000, expected: 50000 },
  { id: 'LS-0311', distributor: 'Bilal Traders', delivered: 19, returned: 0, collected: 51000, expected: 51000 },
];

export const _todaySheet = {
  id: 'LS-0313',
  distributor: 'Bilal Traders',
  territory: 'Lahore Central',
  stops: [
    { name: 'Khan Mart',        items: 6, amount: 8000  },
    { name: 'Green Leaf Store', items: 9, amount: 12000 },
    { name: 'Daily Fresh',      items: 4, amount: 5500  },
    { name: 'Organic Hub',      items: 7, amount: 9000  },
    { name: 'Nature Basket',    items: 5, amount: 7000  },
    { name: 'Pure Mart',        items: 8, amount: 11000 },
  ],
};

export const _reconDetail = {
  id: 'LS-0312',
  distributor: 'Bilal Traders',
  stops: 24,
  delivered: 22,
  returned: 2,
  expected: 50000,
  collected: 48000,
  cleanCount: 21,
  cleanCash: 46000,
  exceptions: [
    { name: 'Khan Mart',        meta: 'delivered · expected ₨4,000 · got ₨2,000',        tag: 'short ₨2,000', kind: 'bad'   },
    { name: 'Green Leaf Store', meta: 'returned · goods back · rolls to next sheet',       tag: 'returned',     kind: 'muted' },
    { name: 'Pure Mart',        meta: 'returned · goods back · rolls to next sheet',       tag: 'returned',     kind: 'muted' },
  ],
};
