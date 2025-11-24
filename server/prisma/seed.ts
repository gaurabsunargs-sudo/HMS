import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await prisma.chatMessage.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.billItem.deleteMany();
    await prisma.bill.deleteMany();
    await prisma.medicine.deleteMany();
    await prisma.prescription.deleteMany();
    await prisma.medicalRecord.deleteMany();
    await prisma.admission.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.bed.deleteMany();
    await prisma.patient.deleteMany();
    await prisma.doctor.deleteMany();
    await prisma.adminProfile.deleteMany();
    await prisma.user.deleteMany();

    console.log('✅ Cleared existing data');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create Users (10 total: 2 admins, 4 doctors, 4 patients)
    const users = await Promise.all([
        // Admins
        prisma.user.create({
            data: {
                username: 'admin1',
                email: 'admin1@hospital.com',
                password: hashedPassword,
                firstName: 'Sarah',
                middleName: 'Jane',
                lastName: 'Anderson',
                profile: 'https://i.pravatar.cc/150?img=1',
                role: 'ADMIN',
                isActive: true,
            },
        }),
        prisma.user.create({
            data: {
                username: 'admin2',
                email: 'admin2@hospital.com',
                password: hashedPassword,
                firstName: 'Michael',
                lastName: 'Thompson',
                profile: 'https://i.pravatar.cc/150?img=2',
                role: 'ADMIN',
                isActive: true,
            },
        }),
        // Doctors
        prisma.user.create({
            data: {
                username: 'dr.sharma',
                email: 'dr.sharma@hospital.com',
                password: hashedPassword,
                firstName: 'Rajesh',
                middleName: 'Kumar',
                lastName: 'Sharma',
                profile: 'https://i.pravatar.cc/150?img=11',
                role: 'DOCTOR',
                isActive: true,
            },
        }),
        prisma.user.create({
            data: {
                username: 'dr.patel',
                email: 'dr.patel@hospital.com',
                password: hashedPassword,
                firstName: 'Priya',
                lastName: 'Patel',
                profile: 'https://i.pravatar.cc/150?img=12',
                role: 'DOCTOR',
                isActive: true,
            },
        }),
        prisma.user.create({
            data: {
                username: 'dr.thapa',
                email: 'dr.thapa@hospital.com',
                password: hashedPassword,
                firstName: 'Bikram',
                middleName: 'Bahadur',
                lastName: 'Thapa',
                profile: 'https://i.pravatar.cc/150?img=13',
                role: 'DOCTOR',
                isActive: true,
            },
        }),
        prisma.user.create({
            data: {
                username: 'dr.gurung',
                email: 'dr.gurung@hospital.com',
                password: hashedPassword,
                firstName: 'Sita',
                lastName: 'Gurung',
                profile: 'https://i.pravatar.cc/150?img=14',
                role: 'DOCTOR',
                isActive: true,
            },
        }),
        // Patients
        prisma.user.create({
            data: {
                username: 'patient1',
                email: 'patient1@email.com',
                password: hashedPassword,
                firstName: 'Ram',
                middleName: 'Prasad',
                lastName: 'Adhikari',
                profile: 'https://i.pravatar.cc/150?img=21',
                role: 'PATIENT',
                isActive: true,
            },
        }),
        prisma.user.create({
            data: {
                username: 'patient2',
                email: 'patient2@email.com',
                password: hashedPassword,
                firstName: 'Sita',
                lastName: 'Rai',
                profile: 'https://i.pravatar.cc/150?img=22',
                role: 'PATIENT',
                isActive: true,
            },
        }),
        prisma.user.create({
            data: {
                username: 'patient3',
                email: 'patient3@email.com',
                password: hashedPassword,
                firstName: 'Hari',
                middleName: 'Bahadur',
                lastName: 'Magar',
                profile: 'https://i.pravatar.cc/150?img=23',
                role: 'PATIENT',
                isActive: true,
            },
        }),
        prisma.user.create({
            data: {
                username: 'patient4',
                email: 'patient4@email.com',
                password: hashedPassword,
                firstName: 'Gita',
                lastName: 'Shrestha',
                profile: 'https://i.pravatar.cc/150?img=24',
                role: 'PATIENT',
                isActive: true,
            },
        }),
    ]);

    console.log('✅ Created 10 users');

    // Create Admin Profiles
    const adminProfiles = await Promise.all([
        prisma.adminProfile.create({
            data: {
                userId: users[0].id,
                employeeId: 'EMP001',
            },
        }),
        prisma.adminProfile.create({
            data: {
                userId: users[1].id,
                employeeId: 'EMP002',
            },
        }),
    ]);

    console.log('✅ Created 2 admin profiles');

    // Create Doctor Profiles
    const doctors = await Promise.all([
        prisma.doctor.create({
            data: {
                userId: users[2].id,
                licenseNumber: 'NMC-12345',
                specialization: 'Cardiology',
                experience: 15,
                qualifications: ['MBBS', 'MD Cardiology', 'FACC'],
                consultationFee: 1500,
                isAvailable: true,
            },
        }),
        prisma.doctor.create({
            data: {
                userId: users[3].id,
                licenseNumber: 'NMC-12346',
                specialization: 'Pediatrics',
                experience: 10,
                qualifications: ['MBBS', 'MD Pediatrics'],
                consultationFee: 1200,
                isAvailable: true,
            },
        }),
        prisma.doctor.create({
            data: {
                userId: users[4].id,
                licenseNumber: 'NMC-12347',
                specialization: 'Orthopedics',
                experience: 12,
                qualifications: ['MBBS', 'MS Orthopedics'],
                consultationFee: 1300,
                isAvailable: true,
            },
        }),
        prisma.doctor.create({
            data: {
                userId: users[5].id,
                licenseNumber: 'NMC-12348',
                specialization: 'Gynecology',
                experience: 8,
                qualifications: ['MBBS', 'MD Gynecology'],
                consultationFee: 1100,
                isAvailable: true,
            },
        }),
    ]);

    console.log('✅ Created 4 doctors');

    // Create Patient Profiles
    const patients = await Promise.all([
        prisma.patient.create({
            data: {
                userId: users[6].id,
                patientId: 'PAT-2024-001',
                dateOfBirth: new Date('1985-05-15'),
                gender: 'MALE',
                bloodGroup: 'O+',
                contactNumber: '+977-9841234567',
                emergencyContact: '+977-9841234568',
                address: 'Kathmandu, Nepal',
            },
        }),
        prisma.patient.create({
            data: {
                userId: users[7].id,
                patientId: 'PAT-2024-002',
                dateOfBirth: new Date('1990-08-22'),
                gender: 'FEMALE',
                bloodGroup: 'A+',
                contactNumber: '+977-9851234567',
                emergencyContact: '+977-9851234568',
                address: 'Lalitpur, Nepal',
            },
        }),
        prisma.patient.create({
            data: {
                userId: users[8].id,
                patientId: 'PAT-2024-003',
                dateOfBirth: new Date('1978-12-10'),
                gender: 'MALE',
                bloodGroup: 'B+',
                contactNumber: '+977-9861234567',
                emergencyContact: '+977-9861234568',
                address: 'Bhaktapur, Nepal',
            },
        }),
        prisma.patient.create({
            data: {
                userId: users[9].id,
                patientId: 'PAT-2024-004',
                dateOfBirth: new Date('1995-03-18'),
                gender: 'FEMALE',
                bloodGroup: 'AB+',
                contactNumber: '+977-9871234567',
                emergencyContact: '+977-9871234568',
                address: 'Pokhara, Nepal',
            },
        }),
    ]);

    console.log('✅ Created 4 patients');

    // Create Beds (10 beds)
    const beds = await Promise.all([
        prisma.bed.create({ data: { bedNumber: 'G-101', bedType: 'GENERAL', ward: 'General Ward A', isOccupied: false, pricePerDay: 500 } }),
        prisma.bed.create({ data: { bedNumber: 'G-102', bedType: 'GENERAL', ward: 'General Ward A', isOccupied: true, pricePerDay: 500 } }),
        prisma.bed.create({ data: { bedNumber: 'ICU-201', bedType: 'ICU', ward: 'ICU Ward', isOccupied: true, pricePerDay: 3000 } }),
        prisma.bed.create({ data: { bedNumber: 'ICU-202', bedType: 'ICU', ward: 'ICU Ward', isOccupied: false, pricePerDay: 3000 } }),
        prisma.bed.create({ data: { bedNumber: 'VIP-301', bedType: 'VIP', ward: 'VIP Ward', isOccupied: false, pricePerDay: 5000 } }),
        prisma.bed.create({ data: { bedNumber: 'VIP-302', bedType: 'VIP', ward: 'VIP Ward', isOccupied: false, pricePerDay: 5000 } }),
        prisma.bed.create({ data: { bedNumber: 'EM-401', bedType: 'EMERGENCY', ward: 'Emergency Ward', isOccupied: false, pricePerDay: 2000 } }),
        prisma.bed.create({ data: { bedNumber: 'MAT-501', bedType: 'MATERNITY', ward: 'Maternity Ward', isOccupied: false, pricePerDay: 1500 } }),
        prisma.bed.create({ data: { bedNumber: 'G-103', bedType: 'GENERAL', ward: 'General Ward B', isOccupied: false, pricePerDay: 500 } }),
        prisma.bed.create({ data: { bedNumber: 'G-104', bedType: 'GENERAL', ward: 'General Ward B', isOccupied: false, pricePerDay: 500 } }),
    ]);

    console.log('✅ Created 10 beds');

    console.log('🎉 Database seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
