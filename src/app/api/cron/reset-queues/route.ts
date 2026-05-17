import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  // Simple check for development, should be replaced with a secure secret in production
  const cronSecret = process.env.CRON_SECRET || 'dev-secret';
  const authHeader = req.headers.get('authorization');
  
  if (authHeader !== `Bearer ${cronSecret}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Get all shops with auto-reset enabled
    const shops = await prisma.shop.findMany({
      where: { autoResetEnabled: true },
    });

    let processedCount = 0;

    for (const shop of shops) {
      // 2. Archive yesterday's data to QueueDay
      const stats = await prisma.ticket.aggregate({
        where: {
          shopId: shop.id,
          createdAt: {
            gte: yesterday,
            lt: today,
          },
        },
        _count: {
          id: true,
        },
      });

      const completedCount = await prisma.ticket.count({
        where: {
          shopId: shop.id,
          status: 'COMPLETED',
          createdAt: { gte: yesterday, lt: today },
        },
      });

      const cancelledCount = await prisma.ticket.count({
        where: {
          shopId: shop.id,
          status: 'CANCELLED',
          createdAt: { gte: yesterday, lt: today },
        },
      });

      await prisma.queueDay.upsert({
        where: {
          shopId_date: {
            shopId: shop.id,
            date: yesterday,
          },
        },
        update: {
          totalTickets: stats._count.id,
          completedTickets: completedCount,
          canceledTickets: cancelledCount,
        },
        create: {
          shopId: shop.id,
          date: yesterday,
          totalTickets: stats._count.id,
          completedTickets: completedCount,
          canceledTickets: cancelledCount,
          registrationOpen: false,
          status: 'COMPLETED',
        },
      });

      // 3. Reset Queues numbering for this shop
      await prisma.queue.updateMany({
        where: { shopId: shop.id },
        data: {
          currentNumber: 0,
          lastResetAt: new Date(),
        },
      });
      
      processedCount++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Reset completed for ${processedCount} shops`,
      date: yesterday.toISOString().split('T')[0]
    });
  } catch (error) {
    console.error('[CRON RESET ERROR]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
