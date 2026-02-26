/**
 * Prisma Seed File
 * Populates database with initial data for development
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create default user (admin)
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@greenhouse.local' },
    update: {},
    create: {
      email: 'admin@greenhouse.local',
      password: hashedPassword,
      name: 'Administrator',
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // 2. Create greenhouse
  const greenhouse = await prisma.greenhouse.upsert({
    where: { id: 'default-gh' },
    update: {},
    create: {
      id: 'default-gh',
      name: 'Greenhouse Utama',
      location: 'Lahan Belakang',
      description: 'Greenhouse utama untuk selada bokor',
      isActive: true,
    },
  });

  console.log('✅ Created greenhouse:', greenhouse.name);

  // 3. Create 8 talangs
  const talangs = [];
  for (let i = 1; i <= 8; i++) {
    const talang = await prisma.talang.upsert({
      where: { id: `T${String(i).padStart(2, '0')}` },
      update: {},
      create: {
        id: `T${String(i).padStart(2, '0')}`,
        name: `Talang ${String(i).padStart(2, '0')}`,
        greenhouseId: greenhouse.id,
        position: i,
        totalSlots: 20,
        isActive: true,
      },
    });
    talangs.push(talang);
  }

  console.log(`✅ Created ${talangs.length} talangs`);

  // 4. Create parameter configs for each stage
  const stages = ['SEMAI', 'TRANSPLANT', 'VEGETATIF', 'PANEN'];

  const configs = [
    {
      stage: 'SEMAI',
      ppmMin: 400,
      ppmMax: 600,
      phMin: 5.5,
      phMax: 6.0,
      tempWaterMin: 18,
      tempWaterMax: 22,
      tempAirMin: 20,
      tempAirMax: 26,
      humidityMin: 65,
      humidityMax: 80,
      ecMin: 0.8,
      ecMax: 1.2,
    },
    {
      stage: 'TRANSPLANT',
      ppmMin: 600,
      ppmMax: 800,
      phMin: 5.8,
      phMax: 6.2,
      tempWaterMin: 18,
      tempWaterMax: 23,
      tempAirMin: 20,
      tempAirMax: 27,
      humidityMin: 65,
      humidityMax: 80,
      ecMin: 1.0,
      ecMax: 1.4,
    },
    {
      stage: 'VEGETATIF',
      ppmMin: 800,
      ppmMax: 1200,
      phMin: 5.8,
      phMax: 6.5,
      tempWaterMin: 18,
      tempWaterMax: 24,
      tempAirMin: 18,
      tempAirMax: 28,
      humidityMin: 60,
      humidityMax: 75,
      ecMin: 1.2,
      ecMax: 1.8,
    },
    {
      stage: 'PANEN',
      ppmMin: 800,
      ppmMax: 1200,
      phMin: 5.8,
      phMax: 6.5,
      tempWaterMin: 18,
      tempWaterMax: 24,
      tempAirMin: 18,
      tempAirMax: 28,
      humidityMin: 60,
      humidityMax: 75,
      ecMin: 1.2,
      ecMax: 1.8,
    },
  ];

  for (const config of configs) {
    await prisma.parameterConfig.upsert({
      where: { stage: config.stage },
      update: {},
      create: config,
    });
  }

  console.log('✅ Created parameter configs for all stages');

  // 5. Create sample IoT device
  const device = await prisma.iOTDevice.upsert({
    where: { name: 'ESP32-Greenhouse-01' },
    update: {},
    create: {
      name: 'ESP32-Greenhouse-01',
      type: 'ESP32',
      location: 'Greenhouse Utama - Center',
      isActive: true,
    },
  });

  console.log('✅ Created IoT device:', device.name);

  // 6. Create sample sensor readings (last 24 hours)
  const now = new Date();
  for (let i = 0; i < 48; i++) {
    const timestamp = new Date(now.getTime() - (i * 30 * 60 * 1000)); // 30 min intervals

    // Generate slightly varying values
    const ppm = 1000 + Math.random() * 100 - 50;
    const ph = 6.0 + Math.random() * 0.4 - 0.2;
    const tempWater = 22 + Math.random() * 2 - 1;
    const tempAir = 25 + Math.random() * 3 - 1.5;
    const humidity = 70 + Math.random() * 10 - 5;
    const ec = 1.5 + Math.random() * 0.2 - 0.1;

    await prisma.sensorReading.create({
      data: {
        ppm: Math.round(ppm),
        ph: Math.round(ph * 10) / 10,
        tempWater: Math.round(tempWater * 10) / 10,
        tempAir: Math.round(tempAir * 10) / 10,
        humidity: Math.round(humidity),
        ec: Math.round(ec * 100) / 100,
        ppmStatus: ppm < 800 || ppm > 1200 ? 'warning' : 'normal',
        phStatus: ph < 5.5 || ph > 6.5 ? 'warning' : 'normal',
        tempStatus: tempAir > 28 || tempWater > 24 ? 'warning' : 'normal',
        deviceId: device.id,
        recordedAt: timestamp,
      },
    });
  }

  console.log('✅ Created sample sensor readings (48 readings)');

  // 7. Create sample batch on Talang 01
  const plantDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000); // 14 days ago
  const estimatedHarvest = new Date(plantDate.getTime() + 28 * 24 * 60 * 60 * 1000);

  const batch = await prisma.batch.create({
    data: {
      talangId: talangs[0].id,
      batchNumber: 'B-2026-001',
      variety: 'Selada Bokor Hijau',
      plantDate,
      estimatedHarvestDate: estimatedHarvest,
      stage: 'VEGETATIF',
      daysSincePlant: 14,
      filledSlots: 18,
      health: 'BAIK',
      estimatedYield: 2160, // 18 heads * 120g
    },
  });

  console.log('✅ Created sample batch:', batch.batchNumber);

  // 8. Create stage log for the batch
  await prisma.batchStageLog.create({
    data: {
      batchId: batch.id,
      fromStage: 'SEMAI',
      toStage: 'TRANSPLANT',
      changedBy: admin.id,
      notes: 'Transplant ke talang',
      changedAt: new Date(plantDate.getTime() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.batchStageLog.create({
    data: {
      batchId: batch.id,
      fromStage: 'TRANSPLANT',
      toStage: 'VEGETATIF',
      changedBy: admin.id,
      notes: 'Masuk fase vegetatif',
      changedAt: new Date(plantDate.getTime() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Created batch stage logs');

  // 9. Create sample harvest (completed batch on Talang 02)
  const harvestPlantDate = new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000);
  const harvest = await prisma.harvest.create({
    data: {
      batchId: batch.id,
      harvestDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      totalWeight: 2100,
      headCount: 18,
      avgWeight: 116.7,
      gradeACount: 12,
      gradeAWeight: 1440,
      gradeBCount: 5,
      gradeBWeight: 550,
      gradeCCount: 1,
      gradeCWeight: 110,
      notes: 'Kualitas baik, daun segar',
      recordedBy: admin.id,
    },
  });

  console.log('✅ Created sample harvest:', harvest.id);

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📝 Default login credentials:');
  console.log('   Email: admin@greenhouse.local');
  console.log('   Password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
