import { PrismaService } from '../src/prisma/prisma.service';

export async function cleanDatabase(prisma: PrismaService) {
  const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != '_prisma_migrations';
  `;

  const tableList = tables.map(({ tablename }) => `"${tablename}"`).join(', ');

  if (tableList.length > 0) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableList} CASCADE;`);
  }
}
