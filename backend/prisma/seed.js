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
  // 2. Seed Demo Products (Idempotent)
  // ========================================
  const products = [
    {
      name: 'Software License - Basic',
      type: 'License',
      salesPrice: 99.99,
      costPrice: 49.99
    },
    {
      name: 'Cloud Storage - 100GB',
      type: 'Service',
      salesPrice: 19.99,
      costPrice: 9.99
    }
  ];

  for (const productData of products) {
    const existingProduct = await prisma.product.findFirst({
      where: { name: productData.name }
    });

    if (!existingProduct) {
      await prisma.product.create({ data: productData });
      console.log('✅ Created Product:', productData.name);
    } else {
      console.log('ℹ️  Product already exists:', productData.name);
    }
  }

  // ========================================
  // 3. Seed Demo Recurring Plan (Idempotent)
  // ========================================
  const planName = 'Monthly Standard Plan';
  
  let plan = await prisma.recurringPlan.findFirst({
    where: { name: planName }
  });

  if (!plan) {
    plan = await prisma.recurringPlan.create({
      data: {
        name: planName,
        price: 99.99,
        billingPeriod: 'MONTHLY',
        minQuantity: 1,
        startDate: new Date('2026-01-01'),
        endDate: null,
        autoClose: false,
        closable: true,
        pausable: false,
        renewable: true,
        isActive: true
      }
    });
    console.log('✅ Created Recurring Plan:', plan.name);
  } else {
    console.log('ℹ️  Recurring Plan already exists:', plan.name);
  }

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

