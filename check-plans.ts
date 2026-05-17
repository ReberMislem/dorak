import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function test() {
  try {
    console.log('Testing database connection...')
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    })
    console.log('Success! Plans found:', plans.length)
    console.log('Plans data:', JSON.stringify(plans, null, 2))
    process.exit(0)
  } catch (err) {
    console.error('DATABASE ERROR:', err)
    process.exit(1)
  }
}

test()
