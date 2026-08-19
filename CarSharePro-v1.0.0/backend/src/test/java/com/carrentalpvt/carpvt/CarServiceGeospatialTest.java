package com.carrentalpvt.carpvt;

import com.carrentalpvt.carpvt.dto.NearbyCarResponse;
import com.carrentalpvt.carpvt.model.Car;
import org.junit.jupiter.api.Test;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;

import static org.junit.jupiter.api.Assertions.*;

class CarServiceGeospatialTest {

    @Test
    void testCarCoordinatesSynchronization() {
        Car car = new Car();
        car.setLatitude(19.0596);
        car.setLongitude(72.8295);

        GeoJsonPoint point = car.getCoordinates();
        assertNotNull(point, "Coordinates should be auto-created from latitude/longitude");
        assertEquals(72.8295, point.getX(), 0.0001, "MongoDB GeoJSON X should be longitude");
        assertEquals(19.0596, point.getY(), 0.0001, "MongoDB GeoJSON Y should be latitude");
        assertEquals(19.0596, car.getLatitude(), 0.0001);
        assertEquals(72.8295, car.getLongitude(), 0.0001);
    }

    @Test
    void testCarCoordinatesFromGeoJsonPoint() {
        Car car = new Car();
        car.setCoordinates(new GeoJsonPoint(77.6408, 12.9784)); // [lon, lat]

        assertEquals(12.9784, car.getLatitude(), 0.0001, "Latitude getter should extract Y");
        assertEquals(77.6408, car.getLongitude(), 0.0001, "Longitude getter should extract X");
    }

    @Test
    void testNearbyCarResponseDto() {
        Car car = new Car();
        car.setId("car-123");
        car.setBrand("Mahindra");
        car.setModel("XUV 700");
        car.setYear(2024);
        car.setPricePerDay(4200.0);
        car.setLocation("Mumbai");
        car.setLocationName("Bandra West, Mumbai");
        car.setLatitude(19.0596);
        car.setLongitude(72.8295);
        car.setAverageRating(4.9);
        car.setReviewCount(14);
        car.setActive(true);

        NearbyCarResponse response = new NearbyCarResponse(car, 3.42);

        assertEquals("car-123", response.getId());
        assertEquals("Mahindra", response.getBrand());
        assertEquals("XUV 700", response.getModel());
        assertEquals(4200.0, response.getPricePerDay());
        assertEquals(3.42, response.getDistanceKm(), 0.01);
        assertEquals(19.0596, response.getLatitude(), 0.0001);
        assertEquals(72.8295, response.getLongitude(), 0.0001);
        assertEquals("Bandra West, Mumbai", response.getLocationName());
        assertTrue(response.isActive());
    }

    @Test
    void testHaversineDistanceAccuracy() {
        // Mumbai (Bandra: 19.0596, 72.8295) to Mumbai (Juhu: 19.1075, 72.8263)
        // Straight line distance is ~5.3 km
        double lat1 = 19.0596;
        double lon1 = 72.8295;
        double lat2 = 19.1075;
        double lon2 = 72.8263;

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distanceKm = 6371.0 * c;

        assertTrue(distanceKm > 4.5 && distanceKm < 6.0,
                "Distance between Bandra and Juhu should be around 5.3km, got: " + distanceKm);
    }
}
