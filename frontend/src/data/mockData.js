import { Role, SubscriptionStatus, InvoiceStatus, InternalRequestStatus } from './constants';

// Pending internal user requests (stored in localStorage for persistence)
export const getPendingInternalRequests = () => {
  const stored = localStorage.getItem('pendingInternalRequests');
  return stored ? JSON.parse(stored) : [];
};

export const addPendingInternalRequest = (request) => {
  const requests = getPendingInternalRequests();
  const newRequest = {
    id: Date.now(),
    ...request,
    status: InternalRequestStatus.PENDING,
    createdAt: new Date().toISOString(),
  };
  requests.push(newRequest);
  localStorage.setItem('pendingInternalRequests', JSON.stringify(requests));
  return newRequest;
};

export const approveInternalRequest = (requestId) => {
  const requests = getPendingInternalRequests();
  const requestIndex = requests.findIndex(r => r.id === requestId);
  if (requestIndex !== -1) {
    const request = requests[requestIndex];
    requests[requestIndex] = { ...request, status: InternalRequestStatus.APPROVED };
    localStorage.setItem('pendingInternalRequests', JSON.stringify(requests));
    
    // Add user to mockUsers in localStorage
    const storedUsers = localStorage.getItem('additionalUsers');
    const additionalUsers = storedUsers ? JSON.parse(storedUsers) : [];
    const newUser = {
      id: Date.now(),
      name: request.name,
      email: request.email,
      password: request.password,
      role: Role.INTERNAL,
      createdAt: new Date().toISOString(),
    };
    additionalUsers.push(newUser);
    localStorage.setItem('additionalUsers', JSON.stringify(additionalUsers));
    return true;
  }
  return false;
};

export const rejectInternalRequest = (requestId) => {
  const requests = getPendingInternalRequests();
  const requestIndex = requests.findIndex(r => r.id === requestId);
  if (requestIndex !== -1) {
    requests[requestIndex] = { ...requests[requestIndex], status: InternalRequestStatus.REJECTED };
    localStorage.setItem('pendingInternalRequests', JSON.stringify(requests));
    return true;
  }
  return false;
};

// Get all users including those added via approved requests
export const getAllUsers = () => {
  const storedUsers = localStorage.getItem('additionalUsers');
  const additionalUsers = storedUsers ? JSON.parse(storedUsers) : [];
  return [...mockUsers, ...additionalUsers];
};

export const mockUsers = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: Role.ADMIN,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 2,
    name: 'Internal Staff',
    email: 'internal@example.com',
    password: 'internal123',
    role: Role.INTERNAL,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 3,
    name: 'John Customer',
    email: 'customer@example.com',
    password: 'customer123',
    role: Role.CUSTOMER,
    createdAt: new Date('2024-02-01'),
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    password: 'customer123',
    role: Role.CUSTOMER,
    createdAt: new Date('2024-02-15'),
  },
  {
    id: 5,
    name: 'Mike Johnson',
    email: 'mike@example.com',
    password: 'customer123',
    role: Role.CUSTOMER,
    createdAt: new Date('2024-03-01'),
  },
];

export const mockProducts = [
  {
    id: 1,
    name: 'Cloud Storage Basic',
    type: 'Service',
    salePrice: 9.99,
    costPrice: 3.00,
  },
  {
    id: 2,
    name: 'Cloud Storage Pro',
    type: 'Service',
    salePrice: 29.99,
    costPrice: 8.00,
  },
  {
    id: 3,
    name: 'API Access',
    type: 'Service',
    salePrice: 49.99,
    costPrice: 15.00,
  },
  {
    id: 4,
    name: 'Premium Support',
    type: 'Support',
    salePrice: 99.99,
    costPrice: 40.00,
  },
  {
    id: 5,
    name: 'Analytics Dashboard',
    type: 'Feature',
    salePrice: 19.99,
    costPrice: 5.00,
  },
];

export const mockPlans = [
  {
    id: 1,
    name: 'Starter Plan',
    price: 29.99,
    billingPeriod: 'Monthly',
    minQty: 1,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-12-31'),
  },
  {
    id: 2,
    name: 'Professional Plan',
    price: 79.99,
    billingPeriod: 'Monthly',
    minQty: 1,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-12-31'),
  },
  {
    id: 3,
    name: 'Enterprise Plan',
    price: 199.99,
    billingPeriod: 'Monthly',
    minQty: 5,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-12-31'),
  },
  {
    id: 4,
    name: 'Annual Starter',
    price: 299.99,
    billingPeriod: 'Yearly',
    minQty: 1,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-12-31'),
  },
  {
    id: 5,
    name: 'Legacy Plan',
    price: 19.99,
    billingPeriod: 'Monthly',
    minQty: 1,
    startDate: new Date('2023-01-01'),
    endDate: new Date('2024-01-01'),
  },
];

export const mockSubscriptions = [
  {
    id: 1,
    number: 'SUB-001',
    startDate: new Date('2024-06-01'),
    endDate: new Date('2025-06-01'),
    status: SubscriptionStatus.ACTIVE,
    userId: 3,
    planId: 2,
  },
  {
    id: 2,
    number: 'SUB-002',
    startDate: new Date('2024-07-01'),
    endDate: new Date('2025-07-01'),
    status: SubscriptionStatus.ACTIVE,
    userId: 4,
    planId: 1,
  },
  {
    id: 3,
    number: 'SUB-003',
    startDate: new Date('2024-08-01'),
    endDate: new Date('2025-08-01'),
    status: SubscriptionStatus.CONFIRMED,
    userId: 5,
    planId: 3,
  },
  {
    id: 4,
    number: 'SUB-004',
    startDate: new Date('2024-09-01'),
    endDate: new Date('2025-09-01'),
    status: SubscriptionStatus.QUOTATION,
    userId: 3,
    planId: 4,
  },
  {
    id: 5,
    number: 'SUB-005',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-06-01'),
    status: SubscriptionStatus.CLOSED,
    userId: 4,
    planId: 1,
  },
  {
    id: 6,
    number: 'SUB-006',
    startDate: new Date('2024-10-01'),
    endDate: new Date('2025-10-01'),
    status: SubscriptionStatus.DRAFT,
    userId: 5,
    planId: 2,
  },
];

export const mockInvoices = [
  {
    id: 1,
    number: 'INV-001',
    total: 79.99,
    status: InvoiceStatus.PAID,
    createdAt: new Date('2024-06-01'),
    userId: 3,
    subscriptionId: 1,
  },
  {
    id: 2,
    number: 'INV-002',
    total: 79.99,
    status: InvoiceStatus.PAID,
    createdAt: new Date('2024-07-01'),
    userId: 3,
    subscriptionId: 1,
  },
  {
    id: 3,
    number: 'INV-003',
    total: 79.99,
    status: InvoiceStatus.CONFIRMED,
    createdAt: new Date('2024-08-01'),
    userId: 3,
    subscriptionId: 1,
  },
  {
    id: 4,
    number: 'INV-004',
    total: 29.99,
    status: InvoiceStatus.PAID,
    createdAt: new Date('2024-07-01'),
    userId: 4,
    subscriptionId: 2,
  },
  {
    id: 5,
    number: 'INV-005',
    total: 29.99,
    status: InvoiceStatus.CONFIRMED,
    createdAt: new Date('2024-08-01'),
    userId: 4,
    subscriptionId: 2,
  },
  {
    id: 6,
    number: 'INV-006',
    total: 199.99,
    status: InvoiceStatus.DRAFT,
    createdAt: new Date('2024-08-15'),
    userId: 5,
    subscriptionId: 3,
  },
];

export const getUserById = (id) => mockUsers.find(u => u.id === id);

export const getPlanById = (id) => mockPlans.find(p => p.id === id);

export const getSubscriptionById = (id) => mockSubscriptions.find(s => s.id === id);

export const getSubscriptionsWithDetails = () =>
  mockSubscriptions.map(sub => ({
    ...sub,
    user: getUserById(sub.userId),
    plan: getPlanById(sub.planId),
  }));

export const getInvoicesWithDetails = () =>
  mockInvoices.map(inv => ({
    ...inv,
    user: getUserById(inv.userId),
    subscription: getSubscriptionById(inv.subscriptionId),
  }));

export const getCustomerSubscriptions = (userId) =>
  mockSubscriptions.filter(s => s.userId === userId);

export const getCustomerInvoices = (userId) =>
  mockInvoices.filter(i => i.userId === userId);

export const getDashboardStats = () => ({
  totalProducts: mockProducts.length,
  activeSubscriptions: mockSubscriptions.filter(s => s.status === SubscriptionStatus.ACTIVE).length,
  monthlyRevenue: mockInvoices
    .filter(i => i.status === InvoiceStatus.PAID)
    .reduce((sum, i) => sum + i.total, 0),
  pendingInvoices: mockInvoices.filter(i => i.status !== InvoiceStatus.PAID).length,
});
