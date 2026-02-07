const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ========================================
  // 1. Seed Admin User (Idempotent)
  // ========================================
  const adminEmail = 'admin@demo.com';
  const adminPassword = 'Admin@1234';
  
  let admin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!admin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'System Admin',
        role: 'ADMIN',
        isActive: true
      }
    });
    console.log('✅ Created ADMIN user:', admin.email);
  } else {
    console.log('ℹ️  ADMIN user already exists:', admin.email);
  }

  // ========================================
  // 1.1 Seed Internal User (Idempotent)
  // ========================================
  const internalEmail = 'staff@demo.com';
  const internalPassword = 'Staff@1234';
  
  let internalUser = await prisma.user.findUnique({
    where: { email: internalEmail }
  });

  if (!internalUser) {
    const hashedPassword = await bcrypt.hash(internalPassword, 10);
    internalUser = await prisma.user.create({
      data: {
        email: internalEmail,
        password: hashedPassword,
        name: 'Internal Staff',
        role: 'INTERNAL',
        isActive: true
      }
    });
    console.log('✅ Created INTERNAL user:', internalUser.email);
  } else {
    console.log('ℹ️  INTERNAL user already exists:', internalUser.email);
  }

  // ========================================
  // 2. Seed Portal Users (Customers)
  // ========================================
  const portalUsers = [
    { email: 'john.doe@customer.com', name: 'John Doe', password: 'Customer@123' },
    { email: 'jane.smith@customer.com', name: 'Jane Smith', password: 'Customer@123' },
    { email: 'robert.wilson@customer.com', name: 'Robert Wilson', password: 'Customer@123' },
    { email: 'emily.brown@customer.com', name: 'Emily Brown', password: 'Customer@123' },
    { email: 'michael.davis@customer.com', name: 'Michael Davis', password: 'Customer@123' },
    { email: 'sarah.johnson@customer.com', name: 'Sarah Johnson', password: 'Customer@123' },
    { email: 'david.miller@customer.com', name: 'David Miller', password: 'Customer@123' },
    { email: 'lisa.anderson@customer.com', name: 'Lisa Anderson', password: 'Customer@123' },
  ];

  const createdPortalUsers = [];
  for (const userData of portalUsers) {
    let user = await prisma.user.findUnique({ where: { email: userData.email } });
    if (!user) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          role: 'PORTAL',
          isActive: true
        }
      });
      console.log('✅ Created PORTAL user:', user.email);
    } else {
      console.log('ℹ️  PORTAL user already exists:', user.email);
    }
    createdPortalUsers.push(user);
  }

  // ========================================
  // 3. Seed Taxes
  // ========================================
  const taxes = [
    { name: 'GST 18%', type: 'SALES', percentage: 18.0, description: 'Goods and Services Tax at 18%', isActive: true },
    { name: 'GST 12%', type: 'SALES', percentage: 12.0, description: 'Goods and Services Tax at 12%', isActive: true },
    { name: 'GST 5%', type: 'SALES', percentage: 5.0, description: 'Goods and Services Tax at 5%', isActive: true },
    { name: 'Service Tax', type: 'BOTH', percentage: 15.0, description: 'Service Tax applicable', isActive: true },
    { name: 'Purchase Tax 10%', type: 'PURCHASE', percentage: 10.0, description: 'Purchase Tax at 10%', isActive: true },
  ];

  const createdTaxes = [];
  for (const taxData of taxes) {
    let tax = await prisma.tax.findFirst({ where: { name: taxData.name } });
    if (!tax) {
      tax = await prisma.tax.create({ data: taxData });
      console.log('✅ Created Tax:', tax.name);
    } else {
      console.log('ℹ️  Tax already exists:', tax.name);
    }
    createdTaxes.push(tax);
  }

  // ========================================
  // 4. Seed Discounts
  // ========================================
  const discounts = [
    { name: 'Early Bird 20%', type: 'PERCENTAGE', value: 20.0, startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'), minPurchase: 100.0, isActive: true },
    { name: 'Loyalty Discount 15%', type: 'PERCENTAGE', value: 15.0, startDate: new Date('2026-01-01'), endDate: null, minPurchase: 200.0, isActive: true },
    { name: 'New Customer 10%', type: 'PERCENTAGE', value: 10.0, startDate: new Date('2026-01-01'), endDate: new Date('2026-06-30'), minPurchase: 50.0, isActive: true },
    { name: 'Flat $100 Off', type: 'FIXED', value: 100.0, startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'), minPurchase: 500.0, usageLimit: 100, isActive: true },
    { name: 'VIP Discount 25%', type: 'PERCENTAGE', value: 25.0, startDate: new Date('2026-01-01'), endDate: null, minPurchase: 1000.0, isActive: true },
  ];

  const createdDiscounts = [];
  for (const discountData of discounts) {
    let discount = await prisma.discount.findFirst({ where: { name: discountData.name } });
    if (!discount) {
      discount = await prisma.discount.create({ data: discountData });
      console.log('✅ Created Discount:', discount.name);
    } else {
      console.log('ℹ️  Discount already exists:', discount.name);
    }
    createdDiscounts.push(discount);
  }

  // ========================================
  // 5. Seed Products (20 Products)
  // ========================================
  const products = [
    { name: 'Cloud Pro Suite', type: 'Software', salesPrice: 299.99, costPrice: 150.00 },
    { name: 'Enterprise CRM License', type: 'License', salesPrice: 499.99, costPrice: 250.00 },
    { name: 'Email Marketing Platform', type: 'Service', salesPrice: 149.99, costPrice: 75.00 },
    { name: 'Cloud Storage 500GB', type: 'Service', salesPrice: 49.99, costPrice: 25.00 },
    { name: 'Project Management Tool', type: 'Software', salesPrice: 199.99, costPrice: 100.00 },
    { name: 'Analytics Dashboard Pro', type: 'Software', salesPrice: 349.99, costPrice: 175.00 },
    { name: 'Video Conferencing Suite', type: 'Service', salesPrice: 89.99, costPrice: 45.00 },
    { name: 'Database Hosting Premium', type: 'Service', salesPrice: 399.99, costPrice: 200.00 },
    { name: 'API Gateway Enterprise', type: 'License', salesPrice: 599.99, costPrice: 300.00 },
    { name: 'Security Suite Advanced', type: 'Software', salesPrice: 449.99, costPrice: 225.00 },
    { name: 'Backup & Recovery System', type: 'Service', salesPrice: 129.99, costPrice: 65.00 },
    { name: 'Content Delivery Network', type: 'Service', salesPrice: 179.99, costPrice: 90.00 },
    { name: 'IoT Platform License', type: 'License', salesPrice: 699.99, costPrice: 350.00 },
    { name: 'Machine Learning API', type: 'Service', salesPrice: 549.99, costPrice: 275.00 },
    { name: 'DevOps Automation Suite', type: 'Software', salesPrice: 429.99, costPrice: 215.00 },
    { name: 'Customer Support Portal', type: 'Software', salesPrice: 249.99, costPrice: 125.00 },
    { name: 'HR Management System', type: 'Software', salesPrice: 329.99, costPrice: 165.00 },
    { name: 'Inventory Tracking Pro', type: 'Software', salesPrice: 279.99, costPrice: 140.00 },
    { name: 'E-Commerce Platform', type: 'License', salesPrice: 799.99, costPrice: 400.00 },
    { name: 'Mobile App Backend', type: 'Service', salesPrice: 379.99, costPrice: 190.00 },
  ];

  const createdProducts = [];
  for (const productData of products) {
    let product = await prisma.product.findFirst({ where: { name: productData.name } });
    if (!product) {
      product = await prisma.product.create({ data: productData });
      console.log('✅ Created Product:', product.name);
    } else {
      console.log('ℹ️  Product already exists:', product.name);
    }
    createdProducts.push(product);
  }

  // ========================================
  // 6. Seed Recurring Plans (15 Plans)
  // ========================================
  const plans = [
    { name: 'Basic Monthly', price: 29.99, billingPeriod: 'MONTHLY' },
    { name: 'Pro Monthly', price: 79.99, billingPeriod: 'MONTHLY' },
    { name: 'Enterprise Monthly', price: 199.99, billingPeriod: 'MONTHLY' },
    { name: 'Starter Yearly', price: 299.99, billingPeriod: 'YEARLY' },
    { name: 'Business Yearly', price: 899.99, billingPeriod: 'YEARLY' },
    { name: 'Premium Monthly', price: 199.99, billingPeriod: 'MONTHLY' },
    { name: 'Standard Monthly', price: 49.99, billingPeriod: 'MONTHLY' },
    { name: 'Advanced Monthly', price: 129.99, billingPeriod: 'MONTHLY' },
    { name: 'Ultra Yearly', price: 1499.99, billingPeriod: 'YEARLY' },
    { name: 'Team Monthly', price: 149.99, billingPeriod: 'MONTHLY' },
    { name: 'Corporate Yearly', price: 1999.99, billingPeriod: 'YEARLY' },
    { name: 'Startup Monthly', price: 39.99, billingPeriod: 'MONTHLY' },
    { name: 'Growth Weekly', price: 149.99, billingPeriod: 'WEEKLY' },
    { name: 'Scale Yearly', price: 2499.99, billingPeriod: 'YEARLY' },
    { name: 'Flex Monthly', price: 99.99, billingPeriod: 'MONTHLY' },
  ];

  const createdPlans = [];
  for (const planData of plans) {
    let plan = await prisma.recurringPlan.findFirst({ where: { name: planData.name } });
    if (!plan) {
      plan = await prisma.recurringPlan.create({
        data: {
          name: planData.name,
          price: planData.price,
          billingPeriod: planData.billingPeriod,
          minQuantity: 1,
          startDate: new Date('2026-01-01'),
          endDate: null,
          autoClose: false,
          closable: true,
          pausable: true,
          renewable: true,
          isActive: true
        }
      });
      console.log('✅ Created Recurring Plan:', plan.name);
    } else {
      console.log('ℹ️  Recurring Plan already exists:', plan.name);
    }
    createdPlans.push(plan);
  }

  // ========================================
  // 7. Seed Subscriptions (25 Subscriptions)
  // ========================================
  const subscriptions = [
    { customerId: createdPortalUsers[0]?.id, planId: createdPlans[0]?.id, productId: createdProducts[0]?.id, status: 'ACTIVE', quantity: 2 },
    { customerId: createdPortalUsers[0]?.id, planId: createdPlans[4]?.id, productId: createdProducts[4]?.id, status: 'ACTIVE', quantity: 1 },
    { customerId: createdPortalUsers[1]?.id, planId: createdPlans[1]?.id, productId: createdProducts[1]?.id, status: 'ACTIVE', quantity: 3 },
    { customerId: createdPortalUsers[1]?.id, planId: createdPlans[6]?.id, productId: createdProducts[6]?.id, status: 'CONFIRMED', quantity: 1 },
    { customerId: createdPortalUsers[2]?.id, planId: createdPlans[2]?.id, productId: createdProducts[2]?.id, status: 'ACTIVE', quantity: 1 },
    { customerId: createdPortalUsers[2]?.id, planId: createdPlans[11]?.id, productId: createdProducts[11]?.id, status: 'ACTIVE', quantity: 5 },
    { customerId: createdPortalUsers[3]?.id, planId: createdPlans[3]?.id, productId: createdProducts[3]?.id, status: 'CLOSED', quantity: 1 },
    { customerId: createdPortalUsers[3]?.id, planId: createdPlans[7]?.id, productId: createdProducts[7]?.id, status: 'ACTIVE', quantity: 2 },
    { customerId: createdPortalUsers[4]?.id, planId: createdPlans[5]?.id, productId: createdProducts[5]?.id, status: 'ACTIVE', quantity: 1 },
    { customerId: createdPortalUsers[4]?.id, planId: createdPlans[9]?.id, productId: createdProducts[9]?.id, status: 'ACTIVE', quantity: 4 },
    { customerId: createdPortalUsers[5]?.id, planId: createdPlans[8]?.id, productId: createdProducts[8]?.id, status: 'ACTIVE', quantity: 1 },
    { customerId: createdPortalUsers[5]?.id, planId: createdPlans[12]?.id, productId: createdProducts[12]?.id, status: 'CLOSED', quantity: 1 },
    { customerId: createdPortalUsers[6]?.id, planId: createdPlans[10]?.id, productId: createdProducts[10]?.id, status: 'ACTIVE', quantity: 2 },
    { customerId: createdPortalUsers[6]?.id, planId: createdPlans[13]?.id, productId: createdProducts[13]?.id, status: 'ACTIVE', quantity: 1 },
    { customerId: createdPortalUsers[7]?.id, planId: createdPlans[14]?.id, productId: createdProducts[14]?.id, status: 'ACTIVE', quantity: 3 },
    { customerId: createdPortalUsers[7]?.id, planId: createdPlans[0]?.id, productId: createdProducts[0]?.id, status: 'CONFIRMED', quantity: 1 },
    { customerId: createdPortalUsers[0]?.id, planId: createdPlans[8]?.id, productId: createdProducts[8]?.id, status: 'ACTIVE', quantity: 1 },
    { customerId: createdPortalUsers[1]?.id, planId: createdPlans[10]?.id, productId: createdProducts[10]?.id, status: 'ACTIVE', quantity: 2 },
    { customerId: createdPortalUsers[2]?.id, planId: createdPlans[5]?.id, productId: createdProducts[5]?.id, status: 'ACTIVE', quantity: 1 },
    { customerId: createdPortalUsers[3]?.id, planId: createdPlans[14]?.id, productId: createdProducts[14]?.id, status: 'CLOSED', quantity: 1 },
    { customerId: createdPortalUsers[4]?.id, planId: createdPlans[1]?.id, productId: createdProducts[1]?.id, status: 'ACTIVE', quantity: 2 },
    { customerId: createdPortalUsers[5]?.id, planId: createdPlans[3]?.id, productId: createdProducts[3]?.id, status: 'ACTIVE', quantity: 1 },
    { customerId: createdPortalUsers[6]?.id, planId: createdPlans[7]?.id, productId: createdProducts[7]?.id, status: 'ACTIVE', quantity: 3 },
    { customerId: createdPortalUsers[7]?.id, planId: createdPlans[9]?.id, productId: createdProducts[9]?.id, status: 'ACTIVE', quantity: 1 },
    { customerId: createdPortalUsers[0]?.id, planId: createdPlans[13]?.id, productId: createdProducts[13]?.id, status: 'ACTIVE', quantity: 1 },
  ];

  const createdSubscriptions = [];
  let subCounter = 1001;
  for (const subData of subscriptions) {
    if (subData.customerId && subData.planId && subData.productId) {
      const plan = await prisma.recurringPlan.findUnique({ where: { id: subData.planId } });
      const product = await prisma.product.findUnique({ where: { id: subData.productId } });
      
      const subscriptionNo = `SUB-2026-${String(subCounter++).padStart(4, '0')}`;
      const existingSub = await prisma.subscription.findFirst({
        where: { subscriptionNo: subscriptionNo }
      });

      if (!existingSub && plan && product) {
        const startDate = new Date('2026-01-15');
        const expirationDate = new Date('2027-01-15');
        
        const subscription = await prisma.subscription.create({
          data: {
            subscriptionNo: subscriptionNo,
            customerId: subData.customerId,
            planId: subData.planId,
            status: subData.status,
            startDate: startDate,
            expirationDate: expirationDate,
            paymentTerms: '30 days',
            lines: {
              create: {
                productId: subData.productId,
                quantity: subData.quantity,
                unitPrice: product.salesPrice
              }
            }
          }
        });
        console.log('✅ Created Subscription:', subscription.subscriptionNo);
        createdSubscriptions.push(subscription);
      } else {
        if (existingSub) {
          console.log('ℹ️  Subscription already exists');
          createdSubscriptions.push(existingSub);
        }
      }
    }
  }

  // ========================================
  // 8. Seed Invoices (30 Invoices)
  // ========================================
  for (let i = 0; i < Math.min(30, createdSubscriptions.length); i++) {
    const subscription = createdSubscriptions[i];
    if (subscription) {
      const invoiceNo = `INV-2026-${String(i + 1001).padStart(4, '0')}`;
      const existingInvoice = await prisma.invoice.findFirst({
        where: { invoiceNo: invoiceNo }
      });

      if (!existingInvoice) {
        const statuses = ['DRAFT', 'CONFIRMED', 'PAID', 'CANCELLED'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        const subtotal = 500.00 + (i * 50);
        const taxTotal = subtotal * 0.18;
        const discountTotal = 0;
        const totalAmount = subtotal + taxTotal - discountTotal;
        
        const invoice = await prisma.invoice.create({
          data: {
            invoiceNo: invoiceNo,
            subscriptionId: subscription.id,
            customerId: subscription.customerId,
            dueDate: new Date('2026-02-20'),
            status: status,
            subtotal: subtotal,
            taxTotal: taxTotal,
            discountTotal: discountTotal,
            totalAmount: totalAmount
          }
        });
        console.log('✅ Created Invoice:', invoice.invoiceNo);

        // Create payment for paid invoices
        if (status === 'PAID') {
          const paymentMethods = ['CARD', 'UPI', 'BANK_TRANSFER', 'CASH', 'OTHER'];
          const method = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
          await prisma.payment.create({
            data: {
              invoiceId: invoice.id,
              amount: invoice.totalAmount,
              method: method,
              paymentDate: new Date('2026-01-25'),
              reference: `TXN-${Date.now()}-${i}`
            }
          });
          console.log('✅ Created Payment for Invoice:', invoice.invoiceNo);
        }
      } else {
        console.log('ℹ️  Invoice already exists');
      }
    }
  }

  console.log('🎉 Seed completed successfully!');
  console.log(`📊 Summary:`);
  console.log(`   - ${createdPortalUsers.length} Portal Users`);
  console.log(`   - ${createdTaxes.length} Taxes`);
  console.log(`   - ${createdDiscounts.length} Discounts`);
  console.log(`   - ${createdProducts.length} Products`);
  console.log(`   - ${createdPlans.length} Recurring Plans`);
  console.log(`   - ${createdSubscriptions.length} Subscriptions`);
  console.log(`   - Invoices and Payments created`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

