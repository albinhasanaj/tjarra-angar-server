const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const seedAssignees = async () => {
  const assignees = [
    { name: 'Albin' },
    { name: 'Marcus' },
    { name: 'Simon' },
    { name: 'Elias' },
    { name: 'Jim' },
    { name: 'Oscar' },
    { name: 'Leo' },
    { name: 'Axel' },
    { name: "Hörnell" },
  ];

  for (const assignee of assignees) {
    await prisma.assignee.upsert({
      where: { name: assignee.name },
      update: {},
      create: assignee,
    });
  }
};

const clearDatabase = async () => {
  await prisma.task.deleteMany();
  await prisma.assignee.deleteMany();
};

const main = async () => {
  await clearDatabase();
  await seedAssignees();

  console.log('Database seeded');
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

