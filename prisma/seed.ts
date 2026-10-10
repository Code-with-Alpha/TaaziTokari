// ==============================================================================
// ANTIGRAVITY: PRISMA SEED SCRIPT (LUCKNOW BASELINE)
// Seeds Lucknow residential societies, foundational SKUs with integer paise,
// role-based operational actors, and demo pre-orders.
// ==============================================================================

import { PrismaClient, Role, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Antigravity database seeding for Lucknow Pilot...');

  // 1. Clean existing seed data (idempotent seed run)
  await prisma.procurementItem.deleteMany({});
  await prisma.procurementSheet.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.society.deleteMany({});

  // 2. Seed Lucknow Societies
  const eldeco = await prisma.society.create({
    data: {
      name: 'Eldeco Elegance (#LKO-24)',
      pincode: '226010',
      city: 'Lucknow',
      cutOffTime: '00:00',
    },
  });

  const rohtas = await prisma.society.create({
    data: {
      name: 'Rohtas Presidential Towers',
      pincode: '226010',
      city: 'Lucknow',
      cutOffTime: '00:00',
    },
  });

  const omaxe = await prisma.society.create({
    data: {
      name: 'Omaxe Heights Gomti Nagar Extension',
      pincode: '226010',
      city: 'Lucknow',
      cutOffTime: '00:00',
    },
  });

  console.log('✅ Seeded 3 Lucknow Residential Societies.');

  // 3. Seed Product Categories
  const catVegetables = await prisma.category.create({ data: { name: 'Vegetables' } });
  const catLeafy = await prisma.category.create({ data: { name: 'Leafy Greens (Saag)' } });
  const catTubers = await prisma.category.create({ data: { name: 'Tubers & Roots' } });
  const catBundles = await prisma.category.create({ data: { name: 'Curated Bundles & Combos' } });

  console.log('✅ Seeded Product Categories.');

  // 4. Seed Products with Integer Paise & SKU-Specific Buffers
  const tamatar = await prisma.product.create({
    data: {
      name: 'Desi Tomato (Sitapur Belt)',
      hindiName: 'देसी टमाटर',
      categoryId: catVegetables.id,
      unit: 'kg',
      priceInPaise: 3800, // ₹38.00 = 3800 paise
      bufferPct: 0.15, // 15% buffer
      isActive: true,
    },
  });

  const aloo = await prisma.product.create({
    data: {
      name: 'Pahadi Aloo (Haldwani Route)',
      hindiName: 'पहाड़ी आलू',
      categoryId: catTubers.id,
      unit: 'kg',
      priceInPaise: 2800, // ₹28.00 = 2800 paise
      bufferPct: 0.10, // 10% buffer
      isActive: true,
    },
  });

  const onion = await prisma.product.create({
    data: {
      name: 'Red Onion (Direct Rail Lot)',
      hindiName: 'नासिक प्याज़',
      categoryId: catTubers.id,
      unit: 'kg',
      priceInPaise: 3200, // ₹32.00 = 3200 paise
      bufferPct: 0.08, // 8% buffer
      isActive: true,
    },
  });

  const palak = await prisma.product.create({
    data: {
      name: 'Desi Palak (Malihabad Peri - 4 AM Harvest)',
      hindiName: 'देसी पालक',
      categoryId: catLeafy.id,
      unit: 'bunch',
      priceInPaise: 2200, // ₹22.00 = 2200 paise
      bufferPct: 0.20, // 20% leafy buffer
      isActive: true,
    },
  });

  const kheera = await prisma.product.create({
    data: {
      name: 'Desi Kheera (Mohanlalganj Polyhouse)',
      hindiName: 'देसी खीरा',
      categoryId: catVegetables.id,
      unit: '500g',
      priceInPaise: 3500, // ₹35.00 = 3500 paise
      bufferPct: 0.12, // 12% buffer
      isActive: true,
    },
  });

  const bhindi = await prisma.product.create({
    data: {
      name: 'Bhindi / Okra (BKT Farms)',
      hindiName: 'हरी भिंडी',
      categoryId: catVegetables.id,
      unit: '500g',
      priceInPaise: 4500, // ₹45.00 = 4500 paise
      bufferPct: 0.12, // 12% buffer
      isActive: true,
    },
  });

  const combo = await prisma.product.create({
    data: {
      name: 'Dhaniya-Mirchi Duo Pack',
      hindiName: 'धनिया-मिर्ची पैक',
      categoryId: catBundles.id,
      unit: '150g pack',
      priceInPaise: 1500, // ₹15.00 = 1500 paise
      bufferPct: 0.10, // 10% buffer
      isActive: true,
    },
  });

  console.log('✅ Seeded 7 Lucknow Produce SKUs with Integer Paise & Buffer Percentages.');

  // 5. Seed Users Across All Roles
  const adminUser = await prisma.user.create({
    data: {
      phone: '+919450000001',
      name: 'Vikramaditya Verma (Founder / Ops Lead)',
      role: Role.ADMIN,
      societyId: eldeco.id,
    },
  });

  const procurementLead = await prisma.user.create({
    data: {
      phone: '+919450000002',
      name: 'Ramkishan Sahu (Dubagga Mandi Buyer)',
      role: Role.PROCUREMENT,
      societyId: eldeco.id,
    },
  });

  const qcOfficer = await prisma.user.create({
    data: {
      phone: '+919450000003',
      name: 'Anjali Srivastava (QC & Ozone Wash Lead)',
      role: Role.QC_OPERATIONS,
      societyId: eldeco.id,
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      phone: '+919839001122',
      name: 'Pooja Agarwal',
      role: Role.CUSTOMER,
      societyId: eldeco.id,
    },
  });

  const addr1 = await prisma.address.create({
    data: {
      userId: customer1.id,
      flatNumber: 'Flat 402',
      blockNumber: 'Tower B',
      landmark: 'Near Central Club House',
      isDefault: true,
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      phone: '+919839003344',
      name: 'Dr. Sameer Rizvi',
      role: Role.CUSTOMER,
      societyId: eldeco.id,
    },
  });

  const addr2 = await prisma.address.create({
    data: {
      userId: customer2.id,
      flatNumber: 'Flat 801',
      blockNumber: 'Tower B',
      landmark: 'Top Floor South Facing',
      isDefault: true,
    },
  });

  console.log('✅ Seeded Role-Based Users (Admin, Procurement, QC, Customers).');

  // 6. Seed Demo Confirmed Orders (Ready for Midnight Cutoff)
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-LKO-20261010-84920',
      userId: customer1.id,
      addressId: addr1.id,
      societyId: eldeco.id,
      status: OrderStatus.PLACED_PENDING_PAYMENT,
      totalInPaise: 11900, // ₹119.00
      savingsInPaise: 2400, // ₹24.00 savings
      paymentId: 'pay_rzp_mock_84920_captured',
      items: {
        create: [
          { productId: tamatar.id, quantity: 1, priceAtPurchase: 3800 },
          { productId: aloo.id, quantity: 2, priceAtPurchase: 2800 },
          { productId: kheera.id, quantity: 1, priceAtPurchase: 3500 },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-LKO-20261010-84921',
      userId: customer2.id,
      addressId: addr2.id,
      societyId: eldeco.id,
      status: OrderStatus.PLACED_PENDING_PAYMENT,
      totalInPaise: 8200, // ₹82.00
      savingsInPaise: 1800, // ₹18.00 savings
      paymentId: 'pay_rzp_mock_84921_captured',
      items: {
        create: [
          { productId: tamatar.id, quantity: 1, priceAtPurchase: 3800 },
          { productId: palak.id, quantity: 2, priceAtPurchase: 2200 },
        ],
      },
    },
  });

  console.log('✅ Seeded 2 Active Pre-Orders with integer paise line-items ready for BullMQ Midnight Cutoff.');
  console.log('🚀 Antigravity Lucknow Baseline Database Seed Complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
