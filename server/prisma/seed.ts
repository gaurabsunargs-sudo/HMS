import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  const hashedPassword = await bcrypt.hash("admin123", 10);

  const superAdmin = await prisma.user.upsert({
    where: { username: "superadmin" },
    update: {
      email: "admin@hospital.com",
      password: hashedPassword,
      firstName: "Super",
      lastName: "Admin",
      profile: "https://i.pravatar.cc/150?img=1",
      role: "ADMIN",
      isActive: true,
    },
    create: {
      username: "superadmin",
      email: "admin@hospital.com",
      password: hashedPassword,
      firstName: "Super",
      lastName: "Admin",
      profile: "https://i.pravatar.cc/150?img=1",
      role: "ADMIN",
      isActive: true,
    },
  });

  await prisma.adminProfile.upsert({
    where: { userId: superAdmin.id },
    update: {
      employeeId: "ADMIN001",
    },
    create: {
      userId: superAdmin.id,
      employeeId: "ADMIN001",
    },
  });

  console.log("Created SuperAdmin user");
  console.log("Username: superadmin");
  console.log("Email: admin@hospital.com");
  console.log("Password: admin123");
  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
