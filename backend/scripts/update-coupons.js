const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Updating discounts with coupon codes...\n');
  
  // Update existing discounts with coupon codes
  const updates = [
    { name: 'Early Bird 20%', couponCode: 'EARLY20' },
    { name: 'Loyalty Discount 15%', couponCode: 'LOYAL15' },
    { name: 'New Customer 10%', couponCode: 'NEWUSER10' },
    { name: 'Flat $100 Off', couponCode: 'FLAT100' },
    { name: 'VIP Discount 25%', couponCode: 'VIP25' },
  ];
  
  for (const upd of updates) {
    const result = await prisma.discount.updateMany({
      where: { name: upd.name, couponCode: null },
      data: { couponCode: upd.couponCode }
    });
    if (result.count > 0) {
      console.log('✅ Updated:', upd.name, '->', upd.couponCode);
    }
  }
  
  // Create WELCOME coupon if not exists
  const welcome = await prisma.discount.findFirst({ where: { couponCode: 'WELCOME' } });
  if (!welcome) {
    await prisma.discount.create({
      data: {
        name: 'Welcome Offer',
        couponCode: 'WELCOME',
        type: 'PERCENTAGE',
        value: 5.0,
        startDate: new Date('2026-01-01'),
        minPurchase: 0,
        isActive: true,
      }
    });
    console.log('✅ Created WELCOME coupon');
  }
  
  // List all coupons
  const all = await prisma.discount.findMany({ 
    select: { name: true, couponCode: true, value: true, type: true } 
  });
  console.log('\n📋 Available coupons:');
  all.forEach(d => {
    const code = d.couponCode || '(no code)';
    const value = d.type === 'PERCENTAGE' ? d.value + '%' : '₹' + d.value;
    console.log(`  - ${code.padEnd(12)} : ${d.name} (${value})`);
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
