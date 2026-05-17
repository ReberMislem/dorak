import { PrismaClient, UserRole, AccountStatus, ShopCategory, QueueStatus, TicketStatus, SubscriptionPlan, SubscriptionStatus, BillingCycle, DiscountType, ShopStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Cleaning up database...')
  
  // Delete in correct order to avoid FK issues
  await prisma.auditLog.deleteMany({})
  await prisma.session.deleteMany({})
  await prisma.ticket.deleteMany({})
  await prisma.qrCode.deleteMany({})
  await prisma.queue.deleteMany({})
  await prisma.branch.deleteMany({})
  await prisma.shopMember.deleteMany({})
  await prisma.subscription.deleteMany({})
  await prisma.promotion.deleteMany({})
  await prisma.dailyAnalytics.deleteMany({})
  await prisma.plan.deleteMany({})
  await prisma.shop.deleteMany({})
  await prisma.user.deleteMany({})

  console.log('Database cleaned.')

  const hashedPassword = await bcrypt.hash('admin123', 10)
  const ownerPassword = await bcrypt.hash('owner123', 10)

  // 1. Create Super Admin
  await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@dorak.com',
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
      emailVerified: true,
      accountStatus: AccountStatus.ACTIVE,
      isApproved: true,
    },
  })

  // 2. Create Shop Owners
  const owner1 = await prisma.user.create({
    data: {
      name: 'Ahmed Barber',
      email: 'ahmed@barber.com',
      password: ownerPassword,
      role: UserRole.SHOP_OWNER,
      isActive: true,
      emailVerified: true,
      accountStatus: AccountStatus.ACTIVE,
      isApproved: true,
    },
  })

  const owner2 = await prisma.user.create({
    data: {
      name: 'Sara Clinic',
      email: 'sara@clinic.com',
      password: ownerPassword,
      role: UserRole.SHOP_OWNER,
      isActive: true,
      emailVerified: true,
      accountStatus: AccountStatus.ACTIVE,
      isApproved: true,
    },
  })

  const owner3 = await prisma.user.create({
    data: {
      name: 'Khalid Restaurant',
      email: 'khalid@burger.com',
      password: ownerPassword,
      role: UserRole.SHOP_OWNER,
      isActive: true,
      emailVerified: true,
      accountStatus: AccountStatus.ACTIVE,
      isApproved: true,
    },
  })

  const owner4 = await prisma.user.create({
    data: {
      name: 'Faisal CarWash',
      email: 'faisal@carwash.com',
      password: ownerPassword,
      role: UserRole.SHOP_OWNER,
      isActive: true,
      emailVerified: true,
      accountStatus: AccountStatus.ACTIVE,
      isApproved: true,
    },
  })

  const owner5 = await prisma.user.create({
    data: {
      name: 'Layan Beauty',
      email: 'layan@beauty.com',
      password: ownerPassword,
      role: UserRole.SHOP_OWNER,
      isActive: true,
      emailVerified: true,
      accountStatus: AccountStatus.ACTIVE,
      isApproved: true,
    },
  })

  // 3. Create Plans
  const freePlan = await prisma.plan.create({
    data: {
      slug: 'free',
      name: 'المجانية',
      price: 0,
      finalPrice: 0,
      billingCycle: BillingCycle.MONTHLY,
      isActive: true,
      isPopular: false,
    },
  })

  const proPlan = await prisma.plan.create({
    data: {
      slug: 'pro-yearly',
      name: 'الاحترافية',
      price: 1200,
      finalPrice: 999,
      billingCycle: BillingCycle.YEARLY,
      isActive: true,
      isPopular: true,
    },
  })

  // 4. Shop 1: Barbershop (Open & Active)
  const shop1 = await prisma.shop.create({
    data: {
      name: 'صالون الحلاقة المودرن',
      nameAr: 'صالون الحلاقة المودرن',
      slug: 'modern-barber',
      category: ShopCategory.BARBERSHOP,
      city: 'الرياض',
      isActive: true,
      isVerified: true,
      openTime: '09:00',
      closeTime: '23:00',
      registrationStartTime: '09:00',
      registrationEndTime: '22:30',
      dailyQueueLimit: 50,
      currentStatus: ShopStatus.OPEN,
    },
  })

  await prisma.shopMember.create({ data: { shopId: shop1.id, userId: owner1.id, role: UserRole.SHOP_OWNER } })
  await prisma.subscription.create({
    data: { shopId: shop1.id, plan: SubscriptionPlan.PROFESSIONAL, planId: proPlan.id, status: SubscriptionStatus.ACTIVE }
  })

  const branch1 = await prisma.branch.create({ data: { shopId: shop1.id, name: 'الفرع الرئيسي', city: 'الرياض' } })
  const queue1 = await prisma.queue.create({
    data: { 
      shopId: shop1.id, 
      branchId: branch1.id, 
      name: 'حلاقة شعر', 
      status: QueueStatus.OPEN,
      currentNumber: 5
    }
  })

  await prisma.qrCode.create({
    data: { shopId: shop1.id, queueId: queue1.id, code: 'TEST-123', url: '/q/TEST-123' }
  })

  // Add break for Shop 1
  await prisma.breakTime.create({
    data: {
      shopId: shop1.id,
      title: 'استراحة غداء',
      startTime: '13:00',
      endTime: '14:00',
      isActive: true
    }
  })

  // Add some tickets for Shop 1
  await prisma.ticket.createMany({
    data: [
      { shopId: shop1.id, queueId: queue1.id, ticketNumber: 1, customerName: 'خالد', status: TicketStatus.COMPLETED, customerToken: 'token-1' },
      { shopId: shop1.id, queueId: queue1.id, ticketNumber: 2, customerName: 'فهد', status: TicketStatus.SERVING, customerToken: 'token-2' },
      { shopId: shop1.id, queueId: queue1.id, ticketNumber: 3, customerName: 'محمد', status: TicketStatus.WAITING, position: 1, customerToken: 'token-3' },
      { shopId: shop1.id, queueId: queue1.id, ticketNumber: 4, customerName: 'عمر', status: TicketStatus.WAITING, position: 2, customerToken: 'token-4' },
      { shopId: shop1.id, queueId: queue1.id, ticketNumber: 5, customerName: 'سعد', status: TicketStatus.WAITING, position: 3, customerToken: 'token-5' },
    ]
  })

  // 5. Shop 2: Clinic (Closed for testing)
  const shop2 = await prisma.shop.create({
    data: {
      name: 'عيادة د. سارة',
      nameAr: 'عيادة د. سارة',
      slug: 'sara-clinic',
      category: ShopCategory.CLINIC,
      city: 'جدة',
      isActive: true,
      openTime: '10:00',
      closeTime: '18:00',
      currentStatus: ShopStatus.CLOSED,
    },
  })

  await prisma.shopMember.create({ data: { shopId: shop2.id, userId: owner2.id, role: UserRole.SHOP_OWNER } })
  await prisma.subscription.create({
    data: { shopId: shop2.id, plan: SubscriptionPlan.FREE, planId: freePlan.id, status: SubscriptionStatus.ACTIVE }
  })

  // 6. Shop 3: Burger Restaurant (New Shop for testing)
  const shop3 = await prisma.shop.create({
    data: {
      name: 'برجر لاين',
      nameAr: 'برجر لاين',
      slug: 'burger-line',
      category: ShopCategory.RESTAURANT,
      city: 'الدمام',
      isActive: true,
      isVerified: true,
      openTime: '12:00',
      closeTime: '02:00',
      currentStatus: ShopStatus.OPEN,
      dailyQueueLimit: 100,
    },
  })

  await prisma.shopMember.create({ data: { shopId: shop3.id, userId: owner3.id, role: UserRole.SHOP_OWNER } })
  await prisma.subscription.create({
    data: { shopId: shop3.id, plan: SubscriptionPlan.STARTER, planId: freePlan.id, status: SubscriptionStatus.ACTIVE }
  })

  const queue2 = await prisma.queue.create({
    data: { 
      shopId: shop3.id, 
      name: 'طلبات داخلية', 
      status: QueueStatus.OPEN,
      currentNumber: 10,
      avgServiceTime: 10
    }
  })

  const queue3 = await prisma.queue.create({
    data: { 
      shopId: shop3.id, 
      name: 'طلبات خارجية', 
      status: QueueStatus.OPEN,
      currentNumber: 0,
      avgServiceTime: 5
    }
  })

  await prisma.qrCode.createMany({
    data: [
      { shopId: shop3.id, queueId: queue2.id, code: 'BURGER-IN', url: '/q/BURGER-IN' },
      { shopId: shop3.id, queueId: queue3.id, code: 'BURGER-OUT', url: '/q/BURGER-OUT' }
    ]
  })

  // Add tickets for Shop 3
  await prisma.ticket.createMany({
    data: [
      { shopId: shop3.id, queueId: queue2.id, ticketNumber: 1, customerName: 'ياسر', status: TicketStatus.COMPLETED, customerToken: 'burger-1' },
      { shopId: shop3.id, queueId: queue2.id, ticketNumber: 2, customerName: 'بدر', status: TicketStatus.SERVING, customerToken: 'burger-2' },
      { shopId: shop3.id, queueId: queue2.id, ticketNumber: 3, customerName: 'سلمان', status: TicketStatus.WAITING, position: 1, customerToken: 'burger-3' },
      { shopId: shop3.id, queueId: queue3.id, ticketNumber: 1, customerName: 'نايف', status: TicketStatus.WAITING, position: 1, customerToken: 'burger-out-1' },
    ]
  })

  // 7. Shop 4: Car Wash (Testing multiple queues)
  const shop4 = await prisma.shop.create({
    data: {
      name: 'مغسلة دورك',
      nameAr: 'مغسلة دورك',
      slug: 'dorak-carwash',
      category: ShopCategory.CAR_WASH,
      city: 'الرياض',
      isActive: true,
      isVerified: true,
      openTime: '08:00',
      closeTime: '23:00',
      currentStatus: ShopStatus.OPEN,
      dailyQueueLimit: 200,
    },
  })

  await prisma.shopMember.create({ data: { shopId: shop4.id, userId: owner4.id, role: UserRole.SHOP_OWNER } })
  await prisma.subscription.create({
    data: { shopId: shop4.id, plan: SubscriptionPlan.PROFESSIONAL, planId: proPlan.id, status: SubscriptionStatus.ACTIVE }
  })

  const queue4 = await prisma.queue.create({
    data: { 
      shopId: shop4.id, 
      name: 'غسيل داخلي وخارجي', 
      status: QueueStatus.OPEN,
      currentNumber: 15,
      avgServiceTime: 30
    }
  })

  const queue5 = await prisma.queue.create({
    data: { 
      shopId: shop4.id, 
      name: 'تلميع ساطع', 
      status: QueueStatus.OPEN,
      currentNumber: 2,
      avgServiceTime: 60
    }
  })

  const queue6 = await prisma.queue.create({
    data: { 
      shopId: shop4.id, 
      name: 'غسيل سريع', 
      status: QueueStatus.OPEN,
      currentNumber: 45,
      avgServiceTime: 15
    }
  })

  await prisma.qrCode.createMany({
    data: [
      { shopId: shop4.id, queueId: queue4.id, code: 'WASH-FULL', url: '/q/WASH-FULL' },
      { shopId: shop4.id, queueId: queue5.id, code: 'WASH-POLISH', url: '/q/WASH-POLISH' },
      { shopId: shop4.id, queueId: queue6.id, code: 'WASH-QUICK', url: '/q/WASH-QUICK' }
    ]
  })

  await prisma.ticket.createMany({
    data: [
      { shopId: shop4.id, queueId: queue4.id, ticketNumber: 15, customerName: 'تركي', status: TicketStatus.SERVING, customerToken: 'wash-1' },
      { shopId: shop4.id, queueId: queue4.id, ticketNumber: 16, customerName: 'منصور', status: TicketStatus.WAITING, position: 1, customerToken: 'wash-2' },
      { shopId: shop4.id, queueId: queue6.id, ticketNumber: 45, customerName: 'عبدالله', status: TicketStatus.SERVING, customerToken: 'wash-3' },
    ]
  })

  // 8. Shop 5: Beauty Salon
  const shop5 = await prisma.shop.create({
    data: {
      name: 'مشغل ليان',
      nameAr: 'مشغل ليان',
      slug: 'layan-beauty',
      category: ShopCategory.BEAUTY_SALON,
      city: 'جدة',
      isActive: true,
      isVerified: true,
      openTime: '10:00',
      closeTime: '22:00',
      currentStatus: ShopStatus.OPEN,
      dailyQueueLimit: 40,
    },
  })

  await prisma.shopMember.create({ data: { shopId: shop5.id, userId: owner5.id, role: UserRole.SHOP_OWNER } })
  await prisma.subscription.create({
    data: { shopId: shop5.id, plan: SubscriptionPlan.STARTER, planId: freePlan.id, status: SubscriptionStatus.ACTIVE }
  })

  const queue7 = await prisma.queue.create({
    data: { 
      shopId: shop5.id, 
      name: 'خدمات شعر', 
      status: QueueStatus.OPEN,
      currentNumber: 8,
      avgServiceTime: 45
    }
  })

  const queue8 = await prisma.queue.create({
    data: { 
      shopId: shop5.id, 
      name: 'خدمات مكياج', 
      status: QueueStatus.OPEN,
      currentNumber: 3,
      avgServiceTime: 60
    }
  })

  await prisma.qrCode.createMany({
    data: [
      { shopId: shop5.id, queueId: queue7.id, code: 'BEAUTY-HAIR', url: '/q/BEAUTY-HAIR' },
      { shopId: shop5.id, queueId: queue8.id, code: 'BEAUTY-MAKEUP', url: '/q/BEAUTY-MAKEUP' }
    ]
  })

  console.log('---------------------------------')
  console.log('Diverse seed data created successfully!')
  console.log('Admin: admin@dorak.com / admin123')
  console.log('Barber Owner: ahmed@barber.com / owner123')
  console.log('Clinic Owner: sara@clinic.com / owner123')
  console.log('Burger Owner: khalid@burger.com / owner123')
  console.log('CarWash Owner: faisal@carwash.com / owner123')
  console.log('Beauty Owner: layan@beauty.com / owner123')
  console.log('Test QRs:')
  console.log('- Modern Barber: /q/TEST-123')
  console.log('- Burger Line (In): /q/BURGER-IN')
  console.log('- Burger Line (Out): /q/BURGER-OUT')
  console.log('- Dorak Car Wash (Full): /q/WASH-FULL')
  console.log('- Dorak Car Wash (Quick): /q/WASH-QUICK')
  console.log('- Layan Beauty (Hair): /q/BEAUTY-HAIR')
  console.log('---------------------------------')
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
