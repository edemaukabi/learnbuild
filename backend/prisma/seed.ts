import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: 'Web Development', slug: 'web-development', icon: 'code' },
    { name: 'Data Science', slug: 'data-science', icon: 'bar-chart' },
    { name: 'Mobile Development', slug: 'mobile-development', icon: 'smartphone' },
    { name: 'DevOps & Cloud', slug: 'devops-cloud', icon: 'server' },
    { name: 'UI/UX Design', slug: 'ui-ux-design', icon: 'pen-tool' },
    { name: 'Business', slug: 'business', icon: 'briefcase' },
    { name: 'Digital Marketing', slug: 'digital-marketing', icon: 'trending-up' },
    { name: 'Cybersecurity', slug: 'cybersecurity', icon: 'shield' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn('Skipping admin seed: ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
  } else {
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        password: await bcrypt.hash(adminPassword, 12),
        firstName: 'Admin',
        lastName: 'User',
        role: Role.ADMIN,
        isEmailVerified: true,
      },
    });
  }

  console.log('Seed complete');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
