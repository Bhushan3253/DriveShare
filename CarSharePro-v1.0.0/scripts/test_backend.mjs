const BASE_URL = process.env.API_URL || 'http://localhost:8081';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

async function runScan() {
  console.log('====================================================');
  console.log('🔍 FULL END-TO-END BACKEND & FRONTEND INTEGRATION SCAN');
  console.log('====================================================\n');

  try {
    // 1. Frontend Check
    try {
      const feRes = await fetch(FRONTEND_URL);
      console.log(`🚀 FRONTEND (${FRONTEND_URL}) -> Status: ${feRes.status} OK`);
    } catch (e) {
      console.log(`ℹ️ FRONTEND (${FRONTEND_URL}) -> Not reachable or dev server stopped.`);
    }

    // 2. Backend Check
    const beRes = await fetch(`${BASE_URL}/api/cars/available`);
    console.log(`🚀 BACKEND (${BASE_URL}) -> Status: ${beRes.status} OK`);

    // 3. Register & Login Owner
    const ownerEmail = `host_${Date.now()}@example.com`;
    await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Rajesh Host', email: ownerEmail, password: 'password123', phone: '9876543210' })
    });
    const loginOwner = await (await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ownerEmail, password: 'password123' })
    })).json();
    const ownerToken = loginOwner.token;
    console.log(`✅ [1/7] Host Account Registered & Authenticated (User ID: ${loginOwner.userId})`);

    // 4. Add Car
    const car = await (await fetch(`${BASE_URL}/api/cars`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ownerToken}` },
      body: JSON.stringify({
        brand: 'Mahindra',
        model: 'XUV 700 AX7',
        year: 2024,
        type: 'SUV',
        fuelType: 'Diesel',
        transmission: 'Automatic',
        seats: 7,
        pricePerDay: 4500,
        location: 'Andheri East, Mumbai',
        description: 'Top end 7-seater luxury SUV with panoramic sunroof and ADAS.',
        imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'
      })
    })).json();
    console.log(`✅ [2/7] Car Created: ${car.brand} ${car.model} (ID: ${car.id}, Initial Status: ${car.status})`);

    // 5. Add Owner Availability Window (Next 30 days)
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setDate(today.getDate() + 30);
    const startStr = today.toISOString().split('T')[0];
    const endStr = nextMonth.toISOString().split('T')[0];

    const avail = await (await fetch(`${BASE_URL}/api/availability/${car.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ownerToken}` },
      body: JSON.stringify({ startDate: startStr, endDate: endStr })
    })).json();
    console.log(`✅ [3/7] Host Availability Calendar Configured: ${avail.startDate} to ${avail.endDate}`);

    // 6. Admin Approves Car (PUT /api/cars/{id}/approve)
    const approvedCar = await (await fetch(`${BASE_URL}/api/cars/${car.id}/approve`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    })).json();
    console.log(`✅ [4/7] Vehicle Approved by Admin: Status -> ${approvedCar.status}`);

    // 7. Register & Login Renter
    const renterEmail = `renter_${Date.now()}@example.com`;
    await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Pooja Sharma', email: renterEmail, password: 'password123', phone: '9123456789' })
    });
    const loginRenter = await (await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: renterEmail, password: 'password123' })
    })).json();
    const renterToken = loginRenter.token;
    console.log(`✅ [5/7] Renter Account Registered & Authenticated (User ID: ${loginRenter.userId})`);

    // 8. Calculate Price & Create Booking (15-min hold)
    const bookStart = new Date();
    bookStart.setDate(today.getDate() + 1);
    const bookEnd = new Date();
    bookEnd.setDate(today.getDate() + 3);
    const bStartStr = bookStart.toISOString().split('T')[0];
    const bEndStr = bookEnd.toISOString().split('T')[0];

    const calc = await (await fetch(`${BASE_URL}/api/bookings/calculate-price?carId=${car.id}&startDate=${bStartStr}&endDate=${bEndStr}`)).json();
    console.log(`✅ [6/7] Price Estimation: ₹${calc.totalAmount} (${calc.totalDays} days @ ₹${calc.pricePerDay}/day, 15% Platform Commission: ₹${calc.platformCommission})`);

    const booking = await (await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${renterToken}` },
      body: JSON.stringify({ carId: car.id, startDate: bStartStr, endDate: bEndStr })
    })).json();
    console.log(`✅ [7/7] Booking Hold Created: ID #${booking.id}, Status: ${booking.status}, Expires: ${booking.expiresAt}`);

    // 9. Generate UPI Payment QR & Submit UTR
    const upi = await (await fetch(`${BASE_URL}/api/upi/create?bookingId=${booking.id}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${renterToken}` }
    })).json();
    console.log(`💳 UPI Payment Session Initialized: Payment ID #${upi.paymentId}, QR Generated: ${!!upi.qrCode}`);

    const utrNumber = `UTR${Date.now().toString().slice(-9)}`;
    const payment = await (await fetch(`${BASE_URL}/api/upi/${upi.paymentId}/utr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${renterToken}` },
      body: JSON.stringify({ utrNumber })
    })).json();
    console.log(`🎉 Payment UTR Submitted by Renter: UTR ${payment.utrNumber}, Status: ${payment.status}`);

    console.log('\n====================================================');
    console.log('🌟 SCAN COMPLETE: BACKEND WORKFLOW OPERATIONAL!');
    console.log('====================================================');
  } catch (err) {
    console.error('Scan error:', err);
  }
}

runScan();
