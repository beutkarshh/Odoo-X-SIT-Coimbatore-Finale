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
    { name: 'Early Bird 20%', couponCode: 'EARLY20', type: 'PERCENTAGE', value: 20.0, startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'), minPurchase: 100.0, isActive: true },
    { name: 'Loyalty Discount 15%', couponCode: 'LOYAL15', type: 'PERCENTAGE', value: 15.0, startDate: new Date('2026-01-01'), endDate: null, minPurchase: 200.0, isActive: true },
    { name: 'New Customer 10%', couponCode: 'NEWUSER10', type: 'PERCENTAGE', value: 10.0, startDate: new Date('2026-01-01'), endDate: new Date('2026-06-30'), minPurchase: 50.0, isActive: true },
    { name: 'Flat ₹100 Off', couponCode: 'FLAT100', type: 'FIXED', value: 100.0, startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'), minPurchase: 500.0, usageLimit: 100, isActive: true },
    { name: 'VIP Discount 25%', couponCode: 'VIP25', type: 'PERCENTAGE', value: 25.0, startDate: new Date('2026-01-01'), endDate: null, minPurchase: 1000.0, isActive: true },
    { name: 'Welcome Offer', couponCode: 'WELCOME', type: 'PERCENTAGE', value: 5.0, startDate: new Date('2026-01-01'), endDate: null, minPurchase: 0, isActive: true },
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
  // 5. Seed Products (OTT & Subscription Platforms)
  // ========================================
  const products = [
    { name: 'Netflix', type: 'SERVICE', salesPrice: 649.00, costPrice: 400.00 },
    { name: 'Disney+ Hotstar', type: 'SERVICE', salesPrice: 1499.00, costPrice: 900.00 },
    { name: 'Amazon Prime Video', type: 'SERVICE', salesPrice: 1499.00, costPrice: 900.00 },
    { name: 'Spotify Premium', type: 'SERVICE', salesPrice: 119.00, costPrice: 70.00 },
    { name: 'YouTube Premium', type: 'SERVICE', salesPrice: 129.00, costPrice: 80.00 },
    { name: 'Apple Music', type: 'SERVICE', salesPrice: 99.00, costPrice: 60.00 },
    { name: 'Zee5', type: 'SERVICE', salesPrice: 999.00, costPrice: 600.00 },
    { name: 'SonyLIV', type: 'SERVICE', salesPrice: 999.00, costPrice: 600.00 },
    { name: 'Adobe Creative Cloud', type: 'SAAS', salesPrice: 3499.00, costPrice: 2000.00 },
    { name: 'Microsoft 365', type: 'SAAS', salesPrice: 4899.00, costPrice: 3000.00 },
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
  // 6. Seed Recurring Plans (Multiple plans per product)
  // ========================================
  const plans = [
    // Netflix Plans (product index 0)
    { name: 'Netflix Mobile', price: 149.00, billingPeriod: 'MONTHLY', productIdx: 0 },
    { name: 'Netflix Basic', price: 199.00, billingPeriod: 'MONTHLY', productIdx: 0 },
    { name: 'Netflix Standard', price: 499.00, billingPeriod: 'MONTHLY', productIdx: 0 },
    { name: 'Netflix Premium', price: 649.00, billingPeriod: 'MONTHLY', productIdx: 0 },
    
    // Disney+ Hotstar Plans (product index 1)
    { name: 'Disney+ Hotstar Mobile', price: 499.00, billingPeriod: 'YEARLY', productIdx: 1 },
    { name: 'Disney+ Hotstar Super', price: 899.00, billingPeriod: 'YEARLY', productIdx: 1 },
    { name: 'Disney+ Hotstar Premium', price: 1499.00, billingPeriod: 'YEARLY', productIdx: 1 },
    
    // Amazon Prime Video Plans (product index 2)
    { name: 'Prime Video Monthly', price: 299.00, billingPeriod: 'MONTHLY', productIdx: 2 },
    { name: 'Prime Video Yearly', price: 1499.00, billingPeriod: 'YEARLY', productIdx: 2 },
    
    // Spotify Premium Plans (product index 3)
    { name: 'Spotify Individual', price: 119.00, billingPeriod: 'MONTHLY', productIdx: 3 },
    { name: 'Spotify Duo', price: 149.00, billingPeriod: 'MONTHLY', productIdx: 3 },
    { name: 'Spotify Family', price: 179.00, billingPeriod: 'MONTHLY', productIdx: 3 },
    
    // YouTube Premium Plans (product index 4)
    { name: 'YouTube Premium Individual', price: 129.00, billingPeriod: 'MONTHLY', productIdx: 4 },
    { name: 'YouTube Premium Family', price: 189.00, billingPeriod: 'MONTHLY', productIdx: 4 },
    
    // Apple Music Plans (product index 5)
    { name: 'Apple Music Individual', price: 99.00, billingPeriod: 'MONTHLY', productIdx: 5 },
    { name: 'Apple Music Family', price: 149.00, billingPeriod: 'MONTHLY', productIdx: 5 },
    
    // Zee5 Plans (product index 6)
    { name: 'Zee5 Mobile', price: 699.00, billingPeriod: 'YEARLY', productIdx: 6 },
    { name: 'Zee5 Premium', price: 999.00, billingPeriod: 'YEARLY', productIdx: 6 },
    
    // SonyLIV Plans (product index 7)
    { name: 'SonyLIV Mobile', price: 699.00, billingPeriod: 'YEARLY', productIdx: 7 },
    { name: 'SonyLIV Premium', price: 999.00, billingPeriod: 'YEARLY', productIdx: 7 },
    
    // Adobe Creative Cloud Plans (product index 8)
    { name: 'Adobe Photography', price: 999.00, billingPeriod: 'MONTHLY', productIdx: 8 },
    { name: 'Adobe Single App', price: 1999.00, billingPeriod: 'MONTHLY', productIdx: 8 },
    { name: 'Adobe All Apps', price: 3499.00, billingPeriod: 'MONTHLY', productIdx: 8 },
    
    // Microsoft 365 Plans (product index 9)
    { name: 'Microsoft 365 Personal', price: 4899.00, billingPeriod: 'YEARLY', productIdx: 9 },
    { name: 'Microsoft 365 Family', price: 5299.00, billingPeriod: 'YEARLY', productIdx: 9 },
  ];

  const createdPlans = [];
  for (const planData of plans) {
    let plan = await prisma.recurringPlan.findFirst({ 
      where: { 
        name: planData.name
      } 
    });
    if (!plan) {
      plan = await prisma.recurringPlan.create({
        data: {
          name: planData.name,
          price: planData.price,
          billingPeriod: planData.billingPeriod,
          productId: createdProducts[planData.productIdx]?.id || null,
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
      console.log('✅ Created Recurring Plan:', plan.name, '→ Product:', createdProducts[planData.productIdx]?.name);
    } else {
      // Update existing plan to link productId if missing
      if (!plan.productId && createdProducts[planData.productIdx]?.id) {
        await prisma.recurringPlan.update({
          where: { id: plan.id },
          data: { productId: createdProducts[planData.productIdx].id }
        });
        console.log('🔗 Linked plan to product:', plan.name, '→', createdProducts[planData.productIdx].name);
      } else {
        console.log('ℹ️  Recurring Plan already exists:', plan.name);
      }
    }
    createdPlans.push(plan);
  }

  // ========================================
  // 7. Seed Subscriptions (Users subscribe to various platforms)
  // ========================================
  const subscriptions = [
    // John Doe subscriptions
    { customerId: createdPortalUsers[0]?.id, planId: createdPlans[3]?.id, productId: createdProducts[0]?.id, status: 'ACTIVE', quantity: 1 }, // Netflix Premium
    { customerId: createdPortalUsers[0]?.id, planId: createdPlans[9]?.id, productId: createdProducts[3]?.id, status: 'ACTIVE', quantity: 1 }, // Spotify Individual
    
    // Jane Smith subscriptions
    { customerId: createdPortalUsers[1]?.id, planId: createdPlans[6]?.id, productId: createdProducts[1]?.id, status: 'ACTIVE', quantity: 1 }, // Disney+ Hotstar Premium
    { customerId: createdPortalUsers[1]?.id, planId: createdPlans[13]?.id, productId: createdProducts[4]?.id, status: 'CONFIRMED', quantity: 1 }, // YouTube Premium Family
    
    // Robert Wilson subscriptions
    { customerId: createdPortalUsers[2]?.id, planId: createdPlans[8]?.id, productId: createdProducts[2]?.id, status: 'ACTIVE', quantity: 1 }, // Prime Video Yearly
    { customerId: createdPortalUsers[2]?.id, planId: createdPlans[22]?.id, productId: createdProducts[8]?.id, status: 'ACTIVE', quantity: 1 }, // Adobe All Apps
    
    // Emily Brown subscriptions
    { customerId: createdPortalUsers[3]?.id, planId: createdPlans[11]?.id, productId: createdProducts[3]?.id, status: 'ACTIVE', quantity: 1 }, // Spotify Family
    { customerId: createdPortalUsers[3]?.id, planId: createdPlans[17]?.id, productId: createdProducts[6]?.id, status: 'CLOSED', quantity: 1 }, // Zee5 Premium
    
    // Michael Davis subscriptions
    { customerId: createdPortalUsers[4]?.id, planId: createdPlans[2]?.id, productId: createdProducts[0]?.id, status: 'ACTIVE', quantity: 1 }, // Netflix Standard
    { customerId: createdPortalUsers[4]?.id, planId: createdPlans[14]?.id, productId: createdProducts[5]?.id, status: 'ACTIVE', quantity: 1 }, // Apple Music Individual
    
    // Sarah Johnson subscriptions
    { customerId: createdPortalUsers[5]?.id, planId: createdPlans[19]?.id, productId: createdProducts[7]?.id, status: 'ACTIVE', quantity: 1 }, // SonyLIV Premium
    { customerId: createdPortalUsers[5]?.id, planId: createdPlans[24]?.id, productId: createdProducts[9]?.id, status: 'ACTIVE', quantity: 1 }, // Microsoft 365 Family
    
    // David Miller subscriptions
    { customerId: createdPortalUsers[6]?.id, planId: createdPlans[5]?.id, productId: createdProducts[1]?.id, status: 'ACTIVE', quantity: 1 }, // Disney+ Hotstar Super
    { customerId: createdPortalUsers[6]?.id, planId: createdPlans[12]?.id, productId: createdProducts[4]?.id, status: 'CONFIRMED', quantity: 1 }, // YouTube Premium Individual
    
    // Lisa Anderson subscriptions
    { customerId: createdPortalUsers[7]?.id, planId: createdPlans[7]?.id, productId: createdProducts[2]?.id, status: 'ACTIVE', quantity: 1 }, // Prime Video Monthly
    { customerId: createdPortalUsers[7]?.id, planId: createdPlans[20]?.id, productId: createdProducts[8]?.id, status: 'ACTIVE', quantity: 1 }, // Adobe Photography
    
    // Additional subscriptions for variety
    { customerId: createdPortalUsers[0]?.id, planId: createdPlans[15]?.id, productId: createdProducts[5]?.id, status: 'ACTIVE', quantity: 1 }, // Apple Music Family
    { customerId: createdPortalUsers[1]?.id, planId: createdPlans[1]?.id, productId: createdProducts[0]?.id, status: 'ACTIVE', quantity: 1 }, // Netflix Basic
    { customerId: createdPortalUsers[2]?.id, planId: createdPlans[10]?.id, productId: createdProducts[3]?.id, status: 'ACTIVE', quantity: 1 }, // Spotify Duo
    { customerId: createdPortalUsers[3]?.id, planId: createdPlans[16]?.id, productId: createdProducts[6]?.id, status: 'ACTIVE', quantity: 1 }, // Zee5 Mobile
    { customerId: createdPortalUsers[4]?.id, planId: createdPlans[18]?.id, productId: createdProducts[7]?.id, status: 'ACTIVE', quantity: 1 }, // SonyLIV Mobile
    { customerId: createdPortalUsers[5]?.id, planId: createdPlans[21]?.id, productId: createdProducts[8]?.id, status: 'CLOSED', quantity: 1 }, // Adobe Single App
    { customerId: createdPortalUsers[6]?.id, planId: createdPlans[23]?.id, productId: createdProducts[9]?.id, status: 'ACTIVE', quantity: 1 }, // Microsoft 365 Personal
    { customerId: createdPortalUsers[7]?.id, planId: createdPlans[4]?.id, productId: createdProducts[1]?.id, status: 'ACTIVE', quantity: 1 }, // Disney+ Hotstar Mobile
    { customerId: createdPortalUsers[0]?.id, planId: createdPlans[0]?.id, productId: createdProducts[0]?.id, status: 'QUOTATION', quantity: 1 }, // Netflix Mobile
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
  console.log(`   - ${createdProducts.length} OTT & Subscription Products`);
  console.log(`   - ${createdPlans.length} Subscription Plans`);
  console.log(`   - ${createdSubscriptions.length} User Subscriptions`);
  console.log(`   - Invoices and Payments created`);
  console.log(`\n🎬 Products: Netflix, Disney+, Prime Video, Spotify, YouTube Premium, Apple Music, Zee5, SonyLIV, Adobe CC, Microsoft 365`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

