import axios from 'axios';

const BASE_URL = process.env.API_URL || 'http://localhost:8081';

async function seedReviewsAndBookings() {
  console.log('================================================================');
  console.log('⭐ SEEDING RATINGS, REVIEWS & COMPLETED BOOKINGS');
  console.log('================================================================\n');

  try {
    // 1. Log in Renter
    const renterRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'renter@driveshare.com',
      password: 'password123'
    });
    const renterToken = renterRes.data.token;

    // 2. Log in Owner
    const ownerRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'owner@driveshare.com',
      password: 'password123'
    });
    const ownerToken = ownerRes.data.token;
    const ownerId = ownerRes.data.userId;

    // 3. Log in Admin
    const adminRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@driveshare.com',
      password: 'admin123'
    });
    const adminToken = adminRes.data.token;

    // 4. Fetch available cars
    const carsRes = await axios.get(`${BASE_URL}/api/cars`);
    const allCars = carsRes.data;

    // Filter cars owned by this owner
    const ownedCars = allCars.filter(c => c.ownerId === ownerId);
    console.log(`Found ${ownedCars.length} cars owned by Demo Host.\n`);

    const targetCars = ownedCars.slice(0, 4);

    for (let i = 0; i < targetCars.length; i++) {
      const car = targetCars[i];
      const today = new Date();
      const startDay = new Date(today);
      startDay.setDate(today.getDate() + (i * 6) + 35);
      const endDay = new Date(today);
      endDay.setDate(today.getDate() + (i * 6) + 38);

      const startStr = startDay.toISOString().split('T')[0];
      const endStr = endDay.toISOString().split('T')[0];

      try {
        // Step A: Create Booking
        const bookRes = await axios.post(`${BASE_URL}/api/bookings`, {
          carId: car.id,
          startDate: startStr,
          endDate: endStr
        }, {
          headers: { Authorization: `Bearer ${renterToken}` }
        });
        const booking = bookRes.data;

        // Step B: Create UPI Session
        const upiRes = await axios.post(`${BASE_URL}/api/upi/create?bookingId=${booking.id}`, {}, {
          headers: { Authorization: `Bearer ${renterToken}` }
        });
        const payment = upiRes.data;

        // Step C: Submit UTR
        const utrNumber = `UTR${Date.now().toString().substring(4)}${i}7`;
        await axios.post(`${BASE_URL}/api/upi/${payment.paymentId}/utr`, {
          utrNumber: utrNumber
        }, {
          headers: { Authorization: `Bearer ${renterToken}` }
        });

        // Step D: Admin Verify Payment
        await axios.put(`${BASE_URL}/api/upi/admin/${payment.paymentId}/verify`, {}, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });

        // Step E: Complete booking lifecycle (Check-in -> Start -> Return -> Complete)
        await axios.put(`${BASE_URL}/api/bookings/${booking.id}/check-in`, {}, {
          headers: { Authorization: `Bearer ${renterToken}` }
        });
        await axios.put(`${BASE_URL}/api/bookings/${booking.id}/start`, {}, {
          headers: { Authorization: `Bearer ${renterToken}` }
        });
        await axios.put(`${BASE_URL}/api/bookings/${booking.id}/return`, {}, {
          headers: { Authorization: `Bearer ${renterToken}` }
        });
        await axios.put(`${BASE_URL}/api/bookings/${booking.id}/complete`, {}, {
          headers: { Authorization: `Bearer ${ownerToken}` }
        });

        // Step F: Add Review
        const comments = [
          'Incredible experience! The car was delivered in spotless condition. Host communication was instant and friendly.',
          'Smooth pickup, luxurious drive, and superb highway stability. Highly recommend this host for weekend road trips!',
          'Top-tier vehicle condition with panoramic sunroof and great mileage. 5-star experience from booking to check-out.',
          'Very well maintained car with all safety features. Easy key handoff and pickup.'
        ];

        await axios.post(`${BASE_URL}/api/reviews`, {
          bookingId: booking.id,
          carRating: 5,
          ownerRating: 5,
          comment: comments[i % comments.length]
        }, {
          headers: { Authorization: `Bearer ${renterToken}` }
        });

        console.log(`  ✓ [REVIEWED & COMPLETED] ${car.brand} ${car.model} | 5★ Host & Vehicle Rating saved!`);
      } catch (innerErr) {
        console.warn(`  ⚠️ Skipped ${car.brand} ${car.model}:`, innerErr.response?.data?.message || innerErr.message);
      }
    }

    console.log('\n================================================================');
    console.log('🎉 RATINGS, REVIEWS & COMPLETED BOOKINGS SEEDED SUCCESSFULLY!');
    console.log('================================================================\n');
  } catch (err) {
    console.error('Seeding reviews error:', err.message);
  }
}

seedReviewsAndBookings();
