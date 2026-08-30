import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || '',
  ssl: { rejectUnauthorized: false },
})

const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

async function main() {
  console.log('🌱 Starting database seed...')

  // Create platform settings
  const platformSettings = await prisma.platformSettings.upsert({
    where: { id: 'platform-settings' },
    update: {},
    create: {
      id: 'platform-settings',
      platformName: 'FITCORE',
      primaryColor: '#111827',
      accentColor: '#22C55E',
      supportEmail: 'support@fitcore.com',
      supportPhone: '+1-555-0000',
      defaultTrialDays: 14,
      defaultCurrency: 'USD',
      defaultTimezone: 'UTC',
    },
  })
  console.log('✅ Platform settings created')

  // Create subscription plans
  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for small gyms getting started',
      priceMonthly: 29,
      priceYearly: 290,
      currency: 'USD',
      features: {
        members: 500,
        staff: 5,
        trainers: 3,
        classes: false,
        advancedAnalytics: false,
        customBranding: true,
        apiAccess: false,
        multiBranch: false,
      },
      limits: { members: 500, staff: 5, trainers: 3 },
      isActive: true,
      isPopular: false,
      sortOrder: 1,
    },
    {
      name: 'Professional',
      description: 'For growing gyms with more features',
      priceMonthly: 79,
      priceYearly: 790,
      currency: 'USD',
      features: {
        members: -1,
        staff: 20,
        trainers: 10,
        classes: true,
        advancedAnalytics: true,
        customBranding: true,
        apiAccess: false,
        multiBranch: false,
      },
      limits: { members: -1, staff: 20, trainers: 10 },
      isActive: true,
      isPopular: true,
      sortOrder: 2,
    },
    {
      name: 'Business',
      description: 'For established gyms needing full features',
      priceMonthly: 149,
      priceYearly: 1490,
      currency: 'USD',
      features: {
        members: -1,
        staff: -1,
        trainers: -1,
        classes: true,
        advancedAnalytics: true,
        customBranding: true,
        apiAccess: true,
        multiBranch: true,
      },
      limits: { members: -1, staff: -1, trainers: -1 },
      isActive: true,
      isPopular: false,
      sortOrder: 3,
    },
    {
      name: 'Enterprise',
      description: 'Custom solutions for large organizations',
      priceMonthly: 299,
      priceYearly: 2990,
      currency: 'USD',
      features: {
        members: -1,
        staff: -1,
        trainers: -1,
        classes: true,
        advancedAnalytics: true,
        customBranding: true,
        apiAccess: true,
        multiBranch: true,
        dedicatedSupport: true,
        customIntegrations: true,
      },
      limits: { members: -1, staff: -1, trainers: -1 },
      isActive: true,
      isPopular: false,
      sortOrder: 4,
    },
  ]

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    })
  }
  console.log('✅ Subscription plans created')

  // Create Super Admin
  const superAdminPassword = await bcrypt.hash('superadmin123', 12)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@fitcore.com' },
    update: {},
    create: {
      email: 'admin@fitcore.com',
      passwordHash: superAdminPassword,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      isActive: true,
      emailVerified: new Date(),
    },
  })
  console.log('✅ Super Admin created (admin@fitcore.com / superadmin123)')

  // Create Demo Gym - Iron House Fitness
  const ironHouseGym = await prisma.gym.upsert({
    where: { slug: 'iron-house-fitness' },
    update: {},
    create: {
      name: 'Iron House Fitness',
      slug: 'iron-house-fitness',
      description: 'Premium strength training facility with state-of-the-art equipment and expert trainers.',
      phone: '+1-555-1000',
      email: 'info@ironhousefitness.com',
      address: '123 Strength Ave',
      city: 'New York',
      country: 'USA',
      timezone: 'America/New_York',
      currency: 'USD',
      isActive: true,
      openingHours: {
        monday: { open: '05:00', close: '23:00', closed: false },
        tuesday: { open: '05:00', close: '23:00', closed: false },
        wednesday: { open: '05:00', close: '23:00', closed: false },
        thursday: { open: '05:00', close: '23:00', closed: false },
        friday: { open: '05:00', close: '22:00', closed: false },
        saturday: { open: '07:00', close: '20:00', closed: false },
        sunday: { open: '08:00', close: '18:00', closed: false },
      },
    },
  })
  console.log('✅ Demo Gym created: Iron House Fitness')

  // Create branding for Iron House
  await prisma.gymBranding.upsert({
    where: { gymId: ironHouseGym.id },
    update: {},
    create: {
      gymId: ironHouseGym.id,
      primaryColor: '#111827',
      secondaryColor: '#1F2937',
      accentColor: '#EF4444',
      backgroundColor: '#030712',
      surfaceColor: '#111827',
      textColor: '#FFFFFF',
      sidebarColor: '#030712',
      buttonColor: '#EF4444',
      fontFamily: 'Inter',
    },
  })
  console.log('✅ Iron House branding created')

  // Create gym settings
  await prisma.gymSettings.upsert({
    where: { gymId: ironHouseGym.id },
    update: {},
    create: {
      gymId: ironHouseGym.id,
      membershipNumberFormat: 'IHF-{number:06d}',
      autoGenerateMemberId: true,
      requirePaymentForMembership: true,
      allowMemberPortal: true,
      allowPublicPage: true,
      publicPageSlug: 'iron-house-fitness',
      qrCodeEnabled: true,
      checkInRequiresActiveMembership: true,
      attendanceTimeoutMinutes: 60,
      freezeDaysAllowed: 14,
      gracePeriodDays: 3,
      invoicePrefix: 'IHF',
      invoiceNumberFormat: '{prefix}-{year}-{number:06d}',
      taxRate: 8.5,
      taxIncludedInPrice: false,
      defaultPaymentMethod: 'CARD',
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
    },
  })
  console.log('✅ Iron House settings created')

  // Create gym owner
  const ownerPassword = await bcrypt.hash('owner123', 12)
  const owner = await prisma.user.upsert({
    where: { email: 'owner@ironhousefitness.com' },
    update: {},
    create: {
      email: 'owner@ironhousefitness.com',
      passwordHash: ownerPassword,
      name: 'John Smith',
      role: 'GYM_OWNER',
      gymId: ironHouseGym.id,
      isActive: true,
      emailVerified: new Date(),
    },
  })
  console.log('✅ Gym Owner created (owner@ironhousefitness.com / owner123)')

  // Create staff members
  const staffData = [
    { email: 'manager@ironhousefitness.com', name: 'Sarah Johnson', role: 'MANAGER' },
    { email: 'reception@ironhousefitness.com', name: 'Mike Davis', role: 'RECEPTIONIST' },
    { email: 'trainer1@ironhousefitness.com', name: 'Alex Turner', role: 'TRAINER' },
    { email: 'trainer2@ironhousefitness.com', name: 'Maria Garcia', role: 'TRAINER' },
    { email: 'accountant@ironhousefitness.com', name: 'David Wilson', role: 'ACCOUNTANT' },
  ]

  for (const staff of staffData) {
    const password = await bcrypt.hash('staff123', 12)
    const user = await prisma.user.upsert({
      where: { email: staff.email },
      update: {},
      create: {
        email: staff.email,
        passwordHash: password,
        name: staff.name,
        role: staff.role as any,
        gymId: ironHouseGym.id,
        isActive: true,
        emailVerified: new Date(),
      },
    })

    await prisma.staff.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        gymId: ironHouseGym.id,
        employeeId: `EMP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        hireDate: new Date('2023-01-15'),
        isActive: true,
      },
    })
  }
  console.log('✅ Staff members created')

  // Create membership plans
  const membershipPlans = [
    { name: 'Monthly', description: 'Month-to-month access', price: 99, durationDays: 30, accessType: 'unlimited', classesIncluded: true, personalTrainingIncluded: false, freezeDaysAllowed: 7 },
    { name: 'Quarterly', description: '3-month commitment', price: 270, durationDays: 90, accessType: 'unlimited', classesIncluded: true, personalTrainingIncluded: false, freezeDaysAllowed: 14, discountPercent: 10 },
    { name: '6 Months', description: 'Half-year membership', price: 500, durationDays: 180, accessType: 'unlimited', classesIncluded: true, personalTrainingIncluded: true, freezeDaysAllowed: 21, discountPercent: 16 },
    { name: 'Annual', description: 'Best value - full year', price: 900, durationDays: 365, accessType: 'unlimited', classesIncluded: true, personalTrainingIncluded: true, freezeDaysAllowed: 30, discountPercent: 24 },
    { name: 'Student', description: 'Student discount', price: 59, durationDays: 30, accessType: 'unlimited', classesIncluded: false, personalTrainingIncluded: false, freezeDaysAllowed: 7 },
    { name: 'Trial', description: '14-day trial membership', price: 0, durationDays: 14, accessType: 'unlimited', classesIncluded: true, personalTrainingIncluded: false, freezeDaysAllowed: 0 },
  ]

  for (const plan of membershipPlans) {
    await prisma.membershipPlan.upsert({
      where: { id: `plan-${plan.name.toLowerCase()}-${ironHouseGym.id}` },
      update: {},
      create: {
        id: `plan-${plan.name.toLowerCase()}-${ironHouseGym.id}`,
        gymId: ironHouseGym.id,
        ...plan,
        currency: 'USD',
        isActive: true,
      },
    })
  }
  console.log('✅ Membership plans created')

  // Create expense categories
  const expenseCategories = ['Rent', 'Electricity', 'Water', 'Internet', 'Equipment', 'Maintenance', 'Salaries', 'Marketing', 'Cleaning', 'Supplies', 'Insurance', 'Software']
  for (const cat of expenseCategories) {
    await prisma.expenseCategory.upsert({
      where: { id: `cat-${cat.toLowerCase()}-${ironHouseGym.id}` },
      update: {},
      create: { id: `cat-${cat.toLowerCase()}-${ironHouseGym.id}`, gymId: ironHouseGym.id, name: cat, isActive: true },
    })
  }
  console.log('✅ Expense categories created')

  // Create trainers
  const trainerUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'trainer1@ironhousefitness.com' },
      update: {},
      create: { email: 'trainer1@ironhousefitness.com', passwordHash: await bcrypt.hash('trainer123', 12), name: 'Alex Turner', role: 'TRAINER', gymId: ironHouseGym.id, isActive: true },
    }),
    prisma.user.upsert({
      where: { email: 'trainer2@ironhousefitness.com' },
      update: {},
      create: { email: 'trainer2@ironhousefitness.com', passwordHash: await bcrypt.hash('trainer123', 12), name: 'Maria Garcia', role: 'TRAINER', gymId: ironHouseGym.id, isActive: true },
    }),
  ])

  const trainers = await Promise.all([
    prisma.trainer.upsert({
      where: { id: `trainer-alex-${ironHouseGym.id}` },
      update: {},
      create: {
        id: `trainer-alex-${ironHouseGym.id}`,
        gymId: ironHouseGym.id,
        userId: trainerUsers[0].id,
        firstName: 'Alex',
        lastName: 'Turner',
        email: 'trainer1@ironhousefitness.com',
        phone: '+1-555-1001',
        bio: 'Certified strength and conditioning specialist with 8+ years experience.',
        specialties: ['Strength Training', 'Powerlifting', 'Olympic Lifting'],
        certifications: ['NSCA CSCS', 'USAW Level 2'],
        hireDate: new Date('2023-01-15'),
        commissionRate: 15,
        isActive: true,
      },
    }),
    prisma.trainer.upsert({
      where: { id: `trainer-maria-${ironHouseGym.id}` },
      update: {},
      create: {
        id: `trainer-maria-${ironHouseGym.id}`,
        gymId: ironHouseGym.id,
        userId: trainerUsers[1].id,
        firstName: 'Maria',
        lastName: 'Garcia',
        email: 'trainer2@ironhousefitness.com',
        phone: '+1-555-1002',
        bio: 'Yoga and mobility specialist focusing on functional movement.',
        specialties: ['Yoga', 'Mobility', 'Functional Training'],
        certifications: ['RYT 500', 'FMS Certified'],
        hireDate: new Date('2023-03-01'),
        commissionRate: 12,
        isActive: true,
      },
    }),
  ])
  console.log('✅ Trainers created')

  // Create classes
  const classes = await Promise.all([
    prisma.class.upsert({
      where: { id: `class-crossfit-${ironHouseGym.id}` },
      update: {},
      create: {
        id: `class-crossfit-${ironHouseGym.id}`,
        gymId: ironHouseGym.id,
        trainerId: trainers[0].id,
        name: 'CrossFit WOD',
        description: 'High-intensity functional fitness workout',
        category: 'CrossFit',
        capacity: 20,
        durationMinutes: 60,
        price: 0,
        currency: 'USD',
        isActive: true,
        requiresBooking: true,
        allowWaitlist: true,
        color: '#EF4444',
      },
    }),
    prisma.class.upsert({
      where: { id: `class-yoga-${ironHouseGym.id}` },
      update: {},
      create: {
        id: `class-yoga-${ironHouseGym.id}`,
        gymId: ironHouseGym.id,
        trainerId: trainers[1].id,
        name: 'Morning Yoga Flow',
        description: 'Vinyasa flow for all levels',
        category: 'Yoga',
        capacity: 25,
        durationMinutes: 60,
        price: 0,
        currency: 'USD',
        isActive: true,
        requiresBooking: true,
        allowWaitlist: true,
        color: '#22C55E',
      },
    }),
    prisma.class.upsert({
      where: { id: `class-hiit-${ironHouseGym.id}` },
      update: {},
      create: {
        id: `class-hiit-${ironHouseGym.id}`,
        gymId: ironHouseGym.id,
        trainerId: trainers[0].id,
        name: 'HIIT Blast',
        description: '30-minute high-intensity interval training',
        category: 'HIIT',
        capacity: 15,
        durationMinutes: 30,
        price: 0,
        currency: 'USD',
        isActive: true,
        requiresBooking: true,
        allowWaitlist: true,
        color: '#F59E0B',
      },
    }),
  ])
  console.log('✅ Classes created')

  // Create class schedules
  const schedules = [
    { classId: classes[0].id, dayOfWeek: 1, startTime: '06:00', endTime: '07:00', room: 'Main Floor', trainerId: trainers[0].id },
    { classId: classes[0].id, dayOfWeek: 3, startTime: '06:00', endTime: '07:00', room: 'Main Floor', trainerId: trainers[0].id },
    { classId: classes[0].id, dayOfWeek: 5, startTime: '06:00', endTime: '07:00', room: 'Main Floor', trainerId: trainers[0].id },
    { classId: classes[1].id, dayOfWeek: 2, startTime: '07:00', endTime: '08:00', room: 'Studio A', trainerId: trainers[1].id },
    { classId: classes[1].id, dayOfWeek: 4, startTime: '07:00', endTime: '08:00', room: 'Studio A', trainerId: trainers[1].id },
    { classId: classes[1].id, dayOfWeek: 6, startTime: '08:00', endTime: '09:00', room: 'Studio A', trainerId: trainers[1].id },
    { classId: classes[2].id, dayOfWeek: 1, startTime: '12:00', endTime: '12:30', room: 'Main Floor', trainerId: trainers[0].id },
    { classId: classes[2].id, dayOfWeek: 3, startTime: '12:00', endTime: '12:30', room: 'Main Floor', trainerId: trainers[0].id },
    { classId: classes[2].id, dayOfWeek: 5, startTime: '12:00', endTime: '12:30', room: 'Main Floor', trainerId: trainers[0].id },
  ]

  for (const sched of schedules) {
    await prisma.classSchedule.upsert({
      where: { id: `sched-${sched.classId}-${sched.dayOfWeek}-${sched.startTime}` },
      update: {},
      create: {
        id: `sched-${sched.classId}-${sched.dayOfWeek}-${sched.startTime}`,
        gymId: ironHouseGym.id,
        ...sched,
        startDate: new Date('2024-01-01'),
        isActive: true,
      },
    })
  }
  console.log('✅ Class schedules created')

  // Create demo members
  const memberCount = 50
  const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra']
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson']

  for (let i = 0; i < memberCount; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const memberId = `IHF-${(i + 1).toString().padStart(6, '0')}`
    const joinDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
    const statuses = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'EXPIRED', 'FROZEN']
    const status = statuses[Math.floor(Math.random() * statuses.length)]

    const member = await prisma.member.upsert({
      where: { memberId },
      update: {},
      create: {
        gymId: ironHouseGym.id,
        memberId,
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
        phone: `+1-555-${Math.floor(1000 + Math.random() * 9000)}`,
        dateOfBirth: new Date(1970 + Math.random() * 50, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        gender: Math.random() > 0.5 ? 'male' : 'female',
        joinDate,
        status: status as any,
        qrCode: JSON.stringify({ memberId, gymId: ironHouseGym.id }),
        isActive: true,
      },
    })

    // Create active membership for most members
    if (status === 'ACTIVE') {
      const plan = membershipPlans[Math.floor(Math.random() * (membershipPlans.length - 1))]
      const planRecord = await prisma.membershipPlan.findFirst({ where: { gymId: ironHouseGym.id, name: plan.name } })
      if (planRecord) {
        const startDate = new Date(joinDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000)
        const endDate = new Date(startDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000)
        
        await prisma.membership.upsert({
          where: { id: `membership-${member.id}-${planRecord.id}` },
          update: {},
          create: {
            id: `membership-${member.id}-${planRecord.id}`,
            gymId: ironHouseGym.id,
            memberId: member.id,
            planId: planRecord.id,
            startDate,
            endDate,
            status: 'ACTIVE',
            pricePaid: plan.price,
            currency: 'USD',
            autoRenew: true,
          },
        })

        // Create payment
        await prisma.payment.upsert({
          where: { id: `payment-${member.id}-${planRecord.id}` },
          update: {},
          create: {
            id: `payment-${member.id}-${planRecord.id}`,
            gymId: ironHouseGym.id,
            memberId: member.id,
            amount: plan.price,
            discount: 0,
            tax: plan.price * 0.085,
            total: plan.price * 1.085,
            currency: 'USD',
            method: 'CARD',
            status: 'PAID',
            receiptNumber: `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            paidAt: startDate,
          },
        })
      }
    }

    // Create some attendance records
    const attendanceCount = Math.floor(Math.random() * 30)
    for (let j = 0; j < attendanceCount; j++) {
      const checkInDate = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000)
      checkInDate.setHours(6 + Math.floor(Math.random() * 14), Math.floor(Math.random() * 60))
      const checkOutDate = new Date(checkInDate.getTime() + (45 + Math.random() * 90) * 60 * 1000)
      
      await prisma.attendance.create({
        data: {
          gymId: ironHouseGym.id,
          memberId: member.id,
          checkInAt: checkInDate,
          checkOutAt: checkOutDate,
          status: 'CHECKED_OUT',
        },
      })
    }
  }
  console.log(`✅ ${memberCount} demo members created with memberships and attendance`)

  // Create expenses
  const expenseNames = [
    { category: 'Rent', amount: 8500, description: 'Monthly gym rent' },
    { category: 'Electricity', amount: 1200, description: 'Monthly electricity bill' },
    { category: 'Water', amount: 300, description: 'Monthly water bill' },
    { category: 'Internet', amount: 150, description: 'Business internet' },
    { category: 'Equipment', amount: 5000, description: 'New dumbbells and plates' },
    { category: 'Maintenance', amount: 800, description: 'Equipment maintenance' },
    { category: 'Salaries', amount: 15000, description: 'Staff salaries' },
    { category: 'Marketing', amount: 2000, description: 'Social media ads' },
    { category: 'Cleaning', amount: 1200, description: 'Daily cleaning service' },
    { category: 'Supplies', amount: 500, description: 'Cleaning supplies, towels' },
    { category: 'Insurance', amount: 1500, description: 'Liability insurance' },
    { category: 'Software', amount: 299, description: 'Gym management software' },
  ]

  for (const expense of expenseNames) {
    const cat = await prisma.expenseCategory.findFirst({ where: { gymId: ironHouseGym.id, name: expense.category } })
    if (cat) {
      await prisma.expense.create({
        data: {
          gymId: ironHouseGym.id,
          categoryId: cat.id,
          amount: expense.amount,
          currency: 'USD',
          description: expense.description,
          expenseDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          isRecurring: ['Rent', 'Internet', 'Salaries', 'Cleaning', 'Insurance', 'Software'].includes(expense.category),
        },
      })
    }
  }
  console.log('✅ Expenses created')

  // Create equipment
  const equipment = [
    { name: 'Treadmill Pro 5000', category: 'Cardio', brand: 'Life Fitness', model: 'Pro 5000', serialNumber: 'LF-TM-001', purchasePrice: 8500, condition: 'EXCELLENT', location: 'Cardio Zone' },
    { name: 'Treadmill Pro 5000', category: 'Cardio', brand: 'Life Fitness', model: 'Pro 5000', serialNumber: 'LF-TM-002', purchasePrice: 8500, condition: 'EXCELLENT', location: 'Cardio Zone' },
    { name: 'Rowing Machine', category: 'Cardio', brand: 'Concept2', model: 'Model D', serialNumber: 'C2-RM-001', purchasePrice: 1200, condition: 'GOOD', location: 'Cardio Zone' },
    { name: 'Assault Bike', category: 'Cardio', brand: 'Assault Fitness', model: 'AirBike', serialNumber: 'AF-AB-001', purchasePrice: 900, condition: 'GOOD', location: 'Cardio Zone' },
    { name: 'Power Rack', category: 'Strength', brand: 'Rogue', model: 'RM-6', serialNumber: 'RG-PR-001', purchasePrice: 3500, condition: 'EXCELLENT', location: 'Strength Area' },
    { name: 'Power Rack', category: 'Strength', brand: 'Rogue', model: 'RM-6', serialNumber: 'RG-PR-002', purchasePrice: 3500, condition: 'EXCELLENT', location: 'Strength Area' },
    { name: 'Bench Press', category: 'Strength', brand: 'Rogue', model: 'Flat Bench', serialNumber: 'RG-BP-001', purchasePrice: 800, condition: 'EXCELLENT', location: 'Strength Area' },
    { name: 'Incline Bench', category: 'Strength', brand: 'Rogue', model: 'Adjustable Bench', serialNumber: 'RG-IB-001', purchasePrice: 1000, condition: 'GOOD', location: 'Strength Area' },
    { name: 'Cable Machine', category: 'Strength', brand: 'Life Fitness', model: 'Signature Series', serialNumber: 'LF-CM-001', purchasePrice: 6500, condition: 'EXCELLENT', location: 'Strength Area' },
    { name: 'Leg Press', category: 'Strength', brand: 'Life Fitness', model: 'Signature Series', serialNumber: 'LF-LP-001', purchasePrice: 5500, condition: 'EXCELLENT', location: 'Strength Area' },
    { name: 'Dumbbell Set 5-100lb', category: 'Free Weights', brand: 'Rogue', model: 'Rubber Hex', serialNumber: 'RG-DB-001', purchasePrice: 4500, condition: 'GOOD', location: 'Free Weights' },
    { name: 'Kettlebell Set', category: 'Free Weights', brand: 'Rogue', model: 'E-Coat', serialNumber: 'RG-KB-001', purchasePrice: 1200, condition: 'EXCELLENT', location: 'Free Weights' },
    { name: 'Barbell Set', category: 'Free Weights', brand: 'Rogue', model: 'Ohio Bar', serialNumber: 'RG-BB-001', purchasePrice: 2800, condition: 'EXCELLENT', location: 'Free Weights' },
    { name: 'Plate Set 45lb', category: 'Free Weights', brand: 'Rogue', model: 'Calibrated', serialNumber: 'RG-PL-001', purchasePrice: 3200, condition: 'EXCELLENT', location: 'Free Weights' },
  ]

  for (const eq of equipment) {
    await prisma.equipment.upsert({
      where: { id: `eq-${eq.serialNumber}-${ironHouseGym.id}` },
      update: {},
      create: {
        id: `eq-${eq.serialNumber}-${ironHouseGym.id}`,
        gymId: ironHouseGym.id,
        ...eq,
        currency: 'USD',
        purchaseDate: new Date('2023-01-15'),
        status: 'AVAILABLE',
        isActive: true,
        nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    })
  }
  console.log('✅ Equipment created')

  // Create leads
  const leadSources = ['WALK_IN', 'PHONE', 'WEBSITE', 'SOCIAL_MEDIA', 'REFERRAL', 'ADVERTISEMENT', 'EVENT']
  const leadStatuses = ['NEW', 'CONTACTED', 'TRIAL', 'INTERESTED', 'CONVERTED', 'LOST']
  
  for (let i = 0; i < 20; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    
    await prisma.lead.create({
      data: {
        gymId: ironHouseGym.id,
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@lead.com`,
        phone: `+1-555-${Math.floor(1000 + Math.random() * 9000)}`,
        source: leadSources[Math.floor(Math.random() * leadSources.length)] as any,
        status: leadStatuses[Math.floor(Math.random() * leadStatuses.length)] as any,
        interestedPlan: membershipPlans[Math.floor(Math.random() * membershipPlans.length)].name,
        assignedToId: owner.id,
        lastContactAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000),
        nextFollowUpAt: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
      },
    })
  }
  console.log('✅ Leads created')

  // Create subscription for Iron House
  const proPlan = await prisma.subscriptionPlan.findFirst({ where: { name: 'Professional' } })
  if (proPlan) {
    await prisma.subscription.upsert({
      where: { gymId: ironHouseGym.id },
      update: {},
      create: {
        gymId: ironHouseGym.id,
        planId: proPlan.id,
        status: 'ACTIVE',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        billingCycle: 'monthly',
        price: proPlan.priceMonthly,
        currency: 'USD',
      },
    })
  }
  console.log('✅ Subscription created for Iron House')

  // Create public gym page
  await prisma.publicGymPage.upsert({
    where: { gymId: ironHouseGym.id },
    update: {},
    create: {
      gymId: ironHouseGym.id,
      slug: 'iron-house-fitness',
      heroTitle: 'Transform Your Body, Transform Your Life',
      heroSubtitle: 'Join the premier strength training facility in NYC. World-class equipment, expert coaching, and a community that pushes you to be your best.',
      heroImageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200',
      description: 'Iron House Fitness is a premium strength training facility located in the heart of New York City. We offer state-of-the-art equipment, expert personal training, and a supportive community atmosphere.',
      galleryImages: [
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
        'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800',
      ],
      showClasses: true,
      showTrainers: true,
      showPlans: true,
      ctaText: 'Start Your 14-Day Trial',
      ctaAction: 'trial',
      seoTitle: 'Iron House Fitness - Premier Strength Training Gym NYC',
      seoDescription: 'Join Iron House Fitness, NYC\'s premier strength training facility. World-class equipment, expert trainers, and a supportive community. Start your 14-day trial today.',
      isPublished: true,
    },
  })
  console.log('✅ Public gym page created')

  // Create Second Demo Gym - Zen Yoga Studio
  const zenYogaGym = await prisma.gym.upsert({
    where: { slug: 'zen-yoga-studio' },
    update: {},
    create: {
      name: 'Zen Yoga Studio',
      slug: 'zen-yoga-studio',
      description: 'Peaceful yoga studio offering classes for all levels in a serene environment.',
      phone: '+1-555-2000',
      email: 'hello@zenyogastudio.com',
      address: '456 Mindful Blvd',
      city: 'Los Angeles',
      country: 'USA',
      timezone: 'America/Los_Angeles',
      currency: 'USD',
      isActive: true,
    },
  })

  await prisma.gymBranding.upsert({
    where: { gymId: zenYogaGym.id },
    update: {},
    create: {
      gymId: zenYogaGym.id,
      primaryColor: '#7C3AED',
      secondaryColor: '#6D28D9',
      accentColor: '#F59E0B',
      backgroundColor: '#1E1B4B',
      surfaceColor: '#312E81',
      textColor: '#FFFFFF',
      sidebarColor: '#1E1B4B',
      buttonColor: '#F59E0B',
      fontFamily: 'Inter',
    },
  })

  const zenOwnerPassword = await bcrypt.hash('owner123', 12)
  await prisma.user.upsert({
    where: { email: 'owner@zenyogastudio.com' },
    update: {},
    create: {
      email: 'owner@zenyogastudio.com',
      passwordHash: zenOwnerPassword,
      name: 'Priya Patel',
      role: 'GYM_OWNER',
      gymId: zenYogaGym.id,
      isActive: true,
    },
  })

  console.log('✅ Second Demo Gym created: Zen Yoga Studio')

  console.log('🎉 Database seed completed successfully!')
  console.log('')
  console.log('📋 Demo Accounts:')
  console.log('  Super Admin: admin@fitcore.com / superadmin123')
  console.log('  Iron House Owner: owner@ironhousefitness.com / owner123')
  console.log('  Zen Yoga Owner: owner@zenyogastudio.com / owner123')
  console.log('  Staff: manager@ironhousefitness.com / staff123')
  console.log('')
  console.log('🌐 Demo Gyms:')
  console.log('  Iron House Fitness: http://localhost:3000/gym/iron-house-fitness')
  console.log('  Zen Yoga Studio: http://localhost:3000/gym/zen-yoga-studio')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })