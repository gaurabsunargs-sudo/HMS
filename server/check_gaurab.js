const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function check() {
    const u = await prisma.user.findUnique({
        where: { email: 'gaurab@gmail.com' },
        include: { patient: true }
    });
    if (u) {
        console.log(`User: ${u.email}, ID: ${u.id}, Role: ${u.role}, Patient: ${u.patient ? u.patient.id : 'NONE'}`);
    } else {
        console.log("Gaurab not found");
    }
    await prisma.$disconnect();
}
check();
