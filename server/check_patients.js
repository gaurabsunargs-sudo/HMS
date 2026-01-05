const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function check() {
    const users = await prisma.user.findMany({
        include: { patient: true, doctor: true }
    });
    console.log(`Total Users: ${users.length}`);
    for (const u of users) {
        if (u.role === "PATIENT" || u.patient) {
            console.log(`User: ${u.email}, Role: ${u.role}, Patient ID: ${u.patient?.id || 'NONE'}`);
        }
    }
    const patientsCount = await prisma.patient.count();
    console.log(`Total Patient Records: ${patientsCount}`);
    await prisma.$disconnect();
}
check();
