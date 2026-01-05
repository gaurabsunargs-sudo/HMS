import { PrismaClient, UserRole, Gender, BedType } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  const hashedPassword = await bcrypt.hash("admin123", 10);

  // Robust function to "upsert" user based on email or username
  async function robustUpsertUser(data: any) {
    const { username, email, ...rest } = data;
    let existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      existing = await prisma.user.findUnique({ where: { username } });
    }

    if (existing) {
      return await prisma.user.update({
        where: { id: existing.id },
        data: { username, email, ...rest },
      });
    } else {
      return await prisma.user.create({
        data: { username, email, password: hashedPassword, ...rest },
      });
    }
  }

  // 1. Super Admin
  const superAdmin = await robustUpsertUser({
    username: "superadmin",
    email: "admin@hospital.com",
    firstName: "Super",
    lastName: "Admin",
    profile: "https://i.pravatar.cc/150?img=1",
    role: UserRole.ADMIN,
    isActive: true,
  });

  await prisma.adminProfile.upsert({
    where: { userId: superAdmin.id },
    update: { employeeId: "ADMIN001" },
    create: {
      userId: superAdmin.id,
      employeeId: "ADMIN001",
    },
  });
  console.log("✅ SuperAdmin Ready");

  // Cleanup: Ensure Dr. Robert Smith is removed if he existed
  const smith = await prisma.user.findUnique({ where: { email: "robert@hospital.com" } });
  if (smith) {
    // Delete associated doctor record first if needed (though onDelete: Cascade might handle it if defined, usually isn't by default in all relations)
    // Actually prisma.user.delete handles it if relation is set correctly or we delete it manually
    await prisma.doctor.deleteMany({ where: { userId: smith.id } });
    await prisma.user.delete({ where: { id: smith.id } });
    console.log("🗑️ Removed Dr. Robert Smith");
  }

  // 2. Doctors (5 total, Oham Shakya + 4 others)
  const doctors = [
    { first: "Dr. Sanduk", last: "Ruit", email: "sanduk@hospital.com", spec: "Ophthalmology", license: "NMC-1001" },
    { first: "Dr. Bhagawan", last: "Koirala", email: "bhagawan@hospital.com", spec: "Cardiology", license: "NMC-1002" },
    { first: "Dr. Aruna", last: "Uprety", email: "aruna@hospital.com", spec: "Nutritionist", license: "NMC-1003" },
    { first: "Dr. Govinda", last: "KC", email: "govinda@hospital.com", spec: "Orthopedics", license: "NMC-1004" },
    { first: "Oham", last: "Shakya", email: "oham@hospital.com", spec: "Hepatology", license: "NMC-1006" },
  ];

  for (let i = 0; i < doctors.length; i++) {
    const d = doctors[i];
    const username = `doc_${d.email.split("@")[0]}`;
    const user = await robustUpsertUser({
      username,
      email: d.email,
      firstName: d.first,
      lastName: d.last,
      role: UserRole.DOCTOR,
    });

    await prisma.doctor.upsert({
      where: { licenseNumber: d.license },
      update: { specialization: d.spec, userId: user.id },
      create: {
        userId: user.id,
        licenseNumber: d.license,
        specialization: d.spec,
        experience: 10 + i,
        consultationFee: 1000 + (i * 200),
        qualifications: ["MBBS", "MD"],
        isAvailable: true,
      },
    });
  }
  console.log("✅ 5 Doctors Ready");

  // 3. Patients (10 total)
  const patients = [
    { first: "Gaurab", last: "Sunar", email: "gaurab@gmail.com" },
    { first: "Alisha", last: "Thapa", email: "alisha@gmail.com" },
    { first: "Ram", last: "Bahadur", email: "ram@gmail.com" },
    { first: "Nirajan", last: "Thapa", email: "nirajan@gmail.com" },
    { first: "Sita", last: "Kumari", email: "sita@gmail.com" },
    { first: "Bishal", last: "Gurung", email: "bishal@gmail.com" },
    { first: "Priyanka", last: "Karki", email: "priyanka@gmail.com" },
    { first: "Anmol", last: "KC", email: "anmol@gmail.com" },
    { first: "Deepika", last: "Prasain", email: "deepika@gmail.com" },
    { first: "Sanjay", last: "Shrestha", email: "sanjay@gmail.com" },
  ];

  for (let i = 0; i < patients.length; i++) {
    const p = patients[i];
    const username = `pat_${p.email.split("@")[0]}`;
    const patientIdentifier = `PAT-${1000 + i}`;

    const user = await robustUpsertUser({
      username,
      email: p.email,
      firstName: p.first,
      lastName: p.last,
      role: UserRole.PATIENT,
    });

    await prisma.patient.upsert({
      where: { patientId: patientIdentifier },
      update: { userId: user.id },
      create: {
        userId: user.id,
        patientId: patientIdentifier,
        gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
        bloodGroup: ["A+", "B+", "O+", "AB+"][i % 4],
        address: "Kathmandu, Nepal",
      },
    });
  }
  console.log("✅ 10 Patients Ready");

  // 4. Beds (15 total)
  for (let i = 1; i <= 15; i++) {
    const bedNumber = `B-${i.toString().padStart(3, '0')}`;
    await prisma.bed.upsert({
      where: { bedNumber },
      update: { isOccupied: false },
      create: {
        bedNumber,
        bedType: BedType.GENERAL,
        ward: `Ward ${(i % 3) + 1}`,
        pricePerDay: 500,
        isOccupied: false,
      },
    });
  }
  console.log("✅ 15 Beds Ready");

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
