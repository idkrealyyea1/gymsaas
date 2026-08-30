import { prisma } from './prisma'

const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000

function bucketByMonth<T>(rows: T[], getDate: (row: T) => Date, getValue: (row: T) => number, key: string) {
  const totals = new Map<string, number>()
  for (const row of rows) {
    const date = getDate(row)
    const bucketKey = `${date.getFullYear()}-${date.getMonth()}`
    totals.set(bucketKey, (totals.get(bucketKey) || 0) + getValue(row))
  }
  return [...totals.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([bucketKey, value]) => ({
      month: new Date(Number(bucketKey.split('-')[0]), Number(bucketKey.split('-')[1]), 1),
      [key]: value,
    }))
}

export async function getRevenueSeries(gymId?: string) {
  const since = new Date(Date.now() - SIX_MONTHS_MS)
  const rows = await prisma.payment.findMany({
    where: { status: 'PAID', paidAt: { gte: since }, ...(gymId ? { gymId } : {}) },
    select: { total: true, paidAt: true },
  })
  return bucketByMonth(rows, (row) => row.paidAt, (row) => Number(row.total), 'revenue')
}

export async function getGymGrowthSeries() {
  const since = new Date(Date.now() - SIX_MONTHS_MS)
  const rows = await prisma.gym.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
  })
  return bucketByMonth(rows, (row) => row.createdAt, () => 1, 'count')
}

export async function getMemberGrowthSeries(gymId?: string) {
  const since = new Date(Date.now() - SIX_MONTHS_MS)
  const rows = await prisma.member.findMany({
    where: { createdAt: { gte: since }, ...(gymId ? { gymId } : {}) },
    select: { createdAt: true },
  })
  return bucketByMonth(rows, (row) => row.createdAt, () => 1, 'count')
}

export async function getAttendanceByDowSeries(gymId: string) {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const rows = await prisma.attendance.findMany({
    where: { gymId, checkInAt: { gte: since } },
    select: { checkInAt: true },
  })
  const counts = new Map<number, number>()
  for (const row of rows) {
    const day = row.checkInAt.getDay()
    counts.set(day, (counts.get(day) || 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([day, count]) => ({ day, count }))
}