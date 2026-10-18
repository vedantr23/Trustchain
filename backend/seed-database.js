import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
  try {
    console.log('Seeding database with initial data...');
    
    // Generate proper UUIDs
    const drive1Id = crypto.randomUUID();
    const drive2Id = crypto.randomUUID();
    const drive3Id = crypto.randomUUID();
    
    const ms1Id = crypto.randomUUID();
    const ms2Id = crypto.randomUUID();
    const ms3Id = crypto.randomUUID();
    const ms4Id = crypto.randomUUID();
    
    // Insert drives
    const { error: drivesError } = await supabase.from('drives').upsert([
      {
        id: drive1Id,
        title: 'Emergency Flood Relief 2026',
        description: 'Providing immediate disaster relief ration kits, drinking water, and dry shelters to families displaced by severe coastal flooding.',
        category: 'Disaster Relief',
        location: 'Nagpur & Coastal Regions',
        target_amount: 300000,
        raised_amount: 0,
        urgency_level: 'Critical',
        beneficiaries_count: 1200,
        blockchain_id: 1
      },
      {
        id: drive2Id,
        title: 'Rural Girls Solar STEM Lab',
        description: 'Establishing a solar-powered computer science laboratory with internet connectivity and digital robotics kits for underprivileged girls.',
        category: 'Education',
        location: 'Rural Rajasthan',
        target_amount: 250000,
        raised_amount: 0,
        urgency_level: 'High',
        beneficiaries_count: 450,
        blockchain_id: 2
      },
      {
        id: drive3Id,
        title: 'Clean Drinking Water Borewell Project',
        description: 'Installing solar-powered deep borewell water filtration stations for indigenous tribal hamlets with zero access to safe potable water.',
        category: 'Healthcare',
        location: 'Thane Tribal Belt',
        target_amount: 150000,
        raised_amount: 0,
        urgency_level: 'Medium',
        beneficiaries_count: 800,
        blockchain_id: 3
      }
    ], { onConflict: 'id' });
    
    console.log('Drives seeded:', drivesError ? 'Error' : 'Success');
    if (drivesError) console.error('Drives error:', drivesError.message);
    
    // Insert milestones
    const { error: milestonesError } = await supabase.from('milestones').upsert([
      {
        id: ms1Id,
        drive_id: drive1Id,
        title: 'Phase 1: 500 Emergency Food & Ration Kits',
        description: 'Procurement and field distribution of 500 family food packages containing flour, lentils, oil, and biscuits.',
        target_amount: 100000,
        status: 'approved',
        gps_required: true,
        photo_required: true,
        invoice_required: true
      },
      {
        id: ms2Id,
        drive_id: drive1Id,
        title: 'Phase 2: Water Filtration & Hygiene Supplies',
        description: 'Distribution of portable filtration systems, chlorine tablets, and antiseptic hygiene packs.',
        target_amount: 100000,
        status: 'pending',
        gps_required: true,
        photo_required: true,
        invoice_required: true
      },
      {
        id: ms3Id,
        drive_id: drive2Id,
        title: 'Procure 10 Refurbished Laptops & Solar Battery Bank',
        description: 'Procurement of 10 Linux-based educational laptops, solar panels, and 5kWh battery inverter.',
        target_amount: 120000,
        status: 'pending',
        gps_required: false,
        photo_required: true,
        invoice_required: true
      },
      {
        id: ms4Id,
        drive_id: drive3Id,
        title: 'Hydro-Geological Survey & Ground Drilling',
        description: 'Ground survey by certified geologists and heavy rig drilling down to 350 feet.',
        target_amount: 75000,
        status: 'pending',
        gps_required: true,
        photo_required: true,
        invoice_required: true
      }
    ], { onConflict: 'id' });
    
    console.log('Milestones seeded:', milestonesError ? 'Error' : 'Success');
    if (milestonesError) console.error('Milestones error:', milestonesError.message);
    
    // Verify data
    const { data: drives } = await supabase.from('drives').select('*');
    const { data: milestones } = await supabase.from('milestones').select('*');
    
    console.log('✅ Database seeded successfully!');
    console.log('Drives:', drives?.length);
    console.log('Milestones:', milestones?.length);
    
  } catch (e) {
    console.error('Seeding failed:', e);
  }
}

seedDatabase();