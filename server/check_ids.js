const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function check() {
    const p = await prisma.patient.findFirst({
        where: { user: { email: 'gaurab@gmail.com' } }
    });
    if (p) {
        console.log(`Patient ID: ${p.id}, userId in Patient Table: ${p.userId}`);
        const u = await prisma.user.findUnique({ where: { id: p.userId } });
        console.log(`Matching User Email: ${u ? u.email : 'NOT FOUND'}`);
    } else {
        console.log("Patient record for Gaurab not found");
    }
    await prisma.$disconnect();
}
check();
