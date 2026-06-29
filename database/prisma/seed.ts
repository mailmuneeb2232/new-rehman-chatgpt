import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Super admin
  const hashedPassword = await bcrypt.hash('Admin@123456', 12);
  await prisma.user.upsert({
    where: { email: 'admin@electronicstore.com' },
    update: {},
    create: {
      email: 'admin@electronicstore.com',
      name: 'Super Admin',
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      emailVerified: true,
    },
  });

  // Categories
  const laptops = await prisma.category.upsert({
    where: { slug: 'laptops' },
    update: {},
    create: {
      name: 'Laptops',
      slug: 'laptops',
      description: 'Premium laptops for professionals and creatives',
      sortOrder: 1,
    },
  });

  await prisma.category.upsert({
    where: { slug: 'smartphones' },
    update: {},
    create: {
      name: 'Smartphones',
      slug: 'smartphones',
      description: 'Cutting-edge smartphones',
      sortOrder: 2,
    },
  });

  await prisma.category.upsert({
    where: { slug: 'audio' },
    update: {},
    create: {
      name: 'Audio',
      slug: 'audio',
      description: 'Immersive audio equipment',
      sortOrder: 3,
    },
  });

  // Sample product
  await prisma.product.upsert({
    where: { slug: 'pro-laptop-x1' },
    update: {},
    create: {
      name: 'Pro Laptop X1',
      slug: 'pro-laptop-x1',
      description: 'The ultimate professional laptop for creative work and development.',
      shortDescription: 'Professional laptop with M3 chip',
      price: 299900,
      sku: 'PLX1-001',
      stock: 50,
      categoryId: laptops.id,
      brand: 'TechPro',
      tags: ['laptop', 'professional', 'lightweight'],
      isFeatured: true,
      images: {
        create: [
          {
            url: 'https://res.cloudinary.com/demo/image/upload/laptop-placeholder.jpg',
            alt: 'Pro Laptop X1 front view',
            isPrimary: true,
            sortOrder: 0,
          },
        ],
      },
    },
  });

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
