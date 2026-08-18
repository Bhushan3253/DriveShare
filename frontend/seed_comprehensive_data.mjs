import axios from 'axios';

const BASE_URL = 'http://localhost:8081';

const sampleCars = [
  {
    brand: 'Mahindra',
    model: 'XUV 700 AX7 Luxury',
    year: 2024,
    type: 'SUV',
    fuelType: 'Diesel',
    transmission: 'Automatic',
    seats: 7,
    pricePerDay: 4200,
    location: 'Bandra West, Mumbai',
    description: 'Flagship 7-seater SUV with panoramic skyroof, ADAS Level 2, 360-degree camera, wireless Apple CarPlay, and Sony 3D immersive sound system.',
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'
  },
  {
    brand: 'Mercedes-Benz',
    model: 'C-Class 300d AMG Line',
    year: 2024,
    type: 'Luxury',
    fuelType: 'Diesel',
    transmission: 'Automatic',
    seats: 5,
    pricePerDay: 9500,
    location: 'Worli & Nariman Point, Mumbai',
    description: 'Pinnacle of executive luxury. Burmester 3D surround sound, 64-color ambient lighting, ventilated leather seats, and bi-turbo punch.',
    imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80'
  },
  {
    brand: 'Hyundai',
    model: 'Creta SX(O) Turbo',
    year: 2024,
    type: 'SUV',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seats: 5,
    pricePerDay: 3200,
    location: 'Indiranagar, Bengaluru',
    description: 'Immaculate condition compact SUV with ventilated front seats, Bose premium audio, voice-enabled panoramic sunroof, and smooth 7-speed DCT.',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80'
  },
  {
    brand: 'BMW',
    model: '3 Series Gran Limousine',
    year: 2023,
    type: 'Luxury',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seats: 5,
    pricePerDay: 8500,
    location: 'Koramangala, Bengaluru',
    description: 'German luxury executive limousine with extended rear legroom, Harman Kardon audio, wireless charging, and sporty rear-wheel driving dynamics.',
    imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80'
  },
  {
    brand: 'Tata',
    model: 'Nexon EV Long Range',
    year: 2024,
    type: 'SUV',
    fuelType: 'Electric',
    transmission: 'Automatic',
    seats: 5,
    pricePerDay: 2800,
    location: 'Cyber City, Gurugram / Delhi NCR',
    description: 'Eco-friendly electric vehicle with 450km range, zero emission, CCS2 fast charging support, arcade games, and whisper-quiet city ride.',
    imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80'
  },
  {
    brand: 'Audi',
    model: 'A6 Technology 45 TFSI',
    year: 2023,
    type: 'Luxury',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seats: 5,
    pricePerDay: 8900,
    location: 'Aerocity, New Delhi',
    description: 'Prestige business sedan with dual MMI touch response screens, Bang & Olufsen premium 3D audio, matrix LED headlights, and quattro all-wheel drive.',
    imageUrl: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=80'
  },
  {
    brand: 'Mahindra',
    model: 'Thar Roxx 4x4 Soft Top',
    year: 2024,
    type: 'SUV',
    fuelType: 'Diesel',
    transmission: 'Manual',
    seats: 4,
    pricePerDay: 3900,
    location: 'Anjuna & Panjim, Goa',
    description: 'Iconic 4x4 convertible off-roader with removable roof panels, all-terrain tires, high ground clearance, and waterproof interior.',
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80'
  },
  {
    brand: 'Volkswagen',
    model: 'Virtus GT Plus 1.5 TSI',
    year: 2024,
    type: 'Sedan',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seats: 5,
    pricePerDay: 2900,
    location: 'Calangute & Candolim, Goa',
    description: '5-star GNCAP safety rated German performance sedan with 150HP turbo engine, paddle shifters, ventilated front seats, and large 521L boot.',
    imageUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80'
  },
  {
    brand: 'Toyota',
    model: 'Fortuner Legender 4x4',
    year: 2024,
    type: 'SUV',
    fuelType: 'Diesel',
    transmission: 'Automatic',
    seats: 7,
    pricePerDay: 6800,
    location: 'Koregaon Park, Pune',
    description: 'Unmatched road dominance and high seating position. 500Nm torque, robust ladder-frame chassis, dual-zone climate control, and supreme highway stability.',
    imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80'
  },
  {
    brand: 'Honda',
    model: 'City ZX e:HEV Hybrid',
    year: 2023,
    type: 'Sedan',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seats: 5,
    pricePerDay: 2600,
    location: 'Hinjawadi IT Park, Pune',
    description: 'Self-charging strong hybrid executive sedan delivering 27km/l fuel efficiency, lane-keep assist, electric sunroof, and supreme backseat comfort.',
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80'
  },
  {
    brand: 'Porsche',
    model: 'Macan GTS Sport',
    year: 2023,
    type: 'Luxury',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seats: 5,
    pricePerDay: 14500,
    location: 'Jubilee Hills, Hyderabad',
    description: 'Pure adrenaline sports SUV. 434HP twin-turbo V6, air suspension, sport exhaust system, Alcantara cockpit, and rapid 0-100 in 4.3s.',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80'
  },
  {
    brand: 'Hyundai',
    model: 'Ioniq 5 Long Range EV',
    year: 2024,
    type: 'Electric',
    fuelType: 'Electric',
    transmission: 'Automatic',
    seats: 5,
    pricePerDay: 4800,
    location: 'HITEC City & Gachibowli, Hyderabad',
    description: 'Futuristic World Car of the Year. 800V ultra-fast charging architecture, relaxation comfort seats, vision roof, and vehicle-to-load power outlet.',
    imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80'
  }
];

async function seedComprehensiveData() {
  console.log('================================================================');
  console.log('🌱 POPULATING DRIVESHARE MARKETPLACE WITH SAMPLE DATA');
  console.log('================================================================\n');

  try {
    // 1. Authenticate Admin
    console.log('1. Authenticating Admin (admin@driveshare.com)...');
    const adminLoginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@driveshare.com',
      password: 'admin123'
    });
    const adminToken = adminLoginRes.data.token;
    console.log('  ✓ Admin authenticated successfully!\n');

    // 2. Authenticate Host / Owner
    console.log('2. Authenticating Host / Owner (owner@driveshare.com)...');
    const ownerLoginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'owner@driveshare.com',
      password: 'password123'
    });
    const ownerToken = ownerLoginRes.data.token;
    const ownerId = ownerLoginRes.data.userId;
    console.log(`  ✓ Host authenticated: ${ownerLoginRes.data.name} (ID: ${ownerId})\n`);

    // Date range for availability (Today to +180 days)
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 180);
    const startStr = today.toISOString().split('T')[0];
    const endStr = futureDate.toISOString().split('T')[0];

    console.log(`3. Seeding ${sampleCars.length} Premium Vehicles with 6-month Availability Windows...`);

    for (const car of sampleCars) {
      // Step A: Create Car as Host
      const createRes = await axios.post(`${BASE_URL}/api/cars`, car, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      const createdCar = createRes.data;

      // Step B: Approve Car as Admin
      await axios.put(`${BASE_URL}/api/admin/cars/${createdCar.id}/approve`, {}, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      // Step C: Add 180-Day Availability Window
      await axios.post(`${BASE_URL}/api/availability/${createdCar.id}`, {
        startDate: startStr,
        endDate: endStr
      }, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });

      console.log(`  ✓ [SEEDED] ${car.brand} ${car.model} (${car.type}) | ₹${car.pricePerDay.toLocaleString('en-IN')}/day | ${car.location}`);
    }

    console.log('\n================================================================');
    console.log(`🎉 SUCCESS: ${sampleCars.length} VEHICLES SUCCESSFULLY CREATED, APPROVED & AVAILABLE!`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    if (err.response?.data) {
      console.error('Response Data:', err.response.data);
    }
  }
}

seedComprehensiveData();
