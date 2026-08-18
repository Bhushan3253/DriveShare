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
    description: 'Flagship 7-seater SUV with panoramic skyroof, ADAS, 360-degree camera, and Sony 3D sound.',
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'
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
    description: 'Immaculate condition compact SUV with ventilated seats, Bose premium audio, and smooth DCT transmission.',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80'
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
    description: 'Eco-friendly electric vehicle with 450km range, zero emission, fast charging support, and silent ride.',
    imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80'
  },
  {
    brand: 'Honda',
    model: 'City ZX VTEC',
    year: 2023,
    type: 'Sedan',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seats: 5,
    pricePerDay: 2400,
    location: 'Koregaon Park, Pune',
    description: 'Ultra comfortable executive sedan with plush leather interiors, exceptional highway mileage, and sunroof.',
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80'
  },
  {
    brand: 'Mahindra',
    model: 'Thar 4x4 Hard Top',
    year: 2023,
    type: 'SUV',
    fuelType: 'Diesel',
    transmission: 'Manual',
    seats: 4,
    pricePerDay: 3800,
    location: 'Anjuna & Panjim, Goa',
    description: 'Iconic 4x4 convertible offroader perfect for coastal road trips and beach vacations.',
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80'
  },
  {
    brand: 'Toyota',
    model: 'Fortuner 4x4 Legender',
    year: 2024,
    type: 'SUV',
    fuelType: 'Diesel',
    transmission: 'Automatic',
    seats: 7,
    pricePerDay: 6500,
    location: 'Juhu, Mumbai',
    description: 'King of Indian roads. Massive road presence, powerful 2.8L diesel engine, 4WD capability, and supreme reliability.',
    imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80'
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
    description: 'German luxury executive limousine with extended rear legroom, Harman Kardon audio, and sporty driving dynamics.',
    imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80'
  },
  {
    brand: 'Kia',
    model: 'Seltos X-Line',
    year: 2024,
    type: 'SUV',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seats: 5,
    pricePerDay: 3400,
    location: 'Connaught Place, New Delhi',
    description: 'Matte graphite finish premium SUV with dual 10.25-inch displays, heads-up display, and wireless Apple CarPlay.',
    imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80'
  }
];

async function seedDatabase() {
  console.log('====================================================');
  console.log('🌱 POPULATING MARKETPLACE WITH SAMPLE FLEET VEHICLES');
  console.log('====================================================\n');

  try {
    // 1. Create Host Account
    const hostEmail = 'host_premium@driveshare.com';
    await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Siddharth Mehra (Superhost)',
        email: hostEmail,
        password: 'password123',
        phone: '9820098200'
      })
    });

    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: hostEmail, password: 'password123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;

    console.log(`✅ Host account ready: ${hostEmail} (ID: ${loginData.userId})`);

    // Date range for availability (Today to +90 days)
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 90);
    const startStr = today.toISOString().split('T')[0];
    const endStr = futureDate.toISOString().split('T')[0];

    // 2. Loop & Create each car
    for (const car of sampleCars) {
      const createRes = await fetch(`${BASE_URL}/api/cars`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(car)
      });
      const createdCar = await createRes.json();

      // Approve Car
      await fetch(`${BASE_URL}/api/cars/${createdCar.id}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Add 90-day Availability Window
      await fetch(`${BASE_URL}/api/availability/${createdCar.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          startDate: startStr,
          endDate: endStr
        })
      });

      console.log(`🚘 [SEEDED] ${car.brand} ${car.model} | ₹${car.pricePerDay}/day | ${car.location} | Active & Available`);
    }

    console.log('\n====================================================');
    console.log(`🎉 SUCCESS: 8 PREMIUM CARS SEEDED INTO MONGODB ATLAS!`);
    console.log('====================================================');
  } catch (err) {
    console.error('❌ Seeding error:', err);
  }
}

seedDatabase();
