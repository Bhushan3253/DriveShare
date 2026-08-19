/**
 * Calculate straight-line distance between two geographic coordinates (Haversine Formula)
 * @param {number} lat1 Latitude of point 1
 * @param {number} lon1 Longitude of point 1
 * @param {number} lat2 Latitude of point 2
 * @param {number} lon2 Longitude of point 2
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return null;
  }
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) {
    return null;
  }

  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10;
};

/**
 * Format distance in a human-friendly string
 * @param {number} km Distance in kilometers
 * @returns {string} Formatted distance (e.g. "2.4 km away", "500 m away")
 */
export const formatDistance = (km) => {
  if (km === undefined || km === null || isNaN(km)) return '';
  if (km < 1) {
    const meters = Math.round(km * 1000);
    return `${meters} m away`;
  }
  return `${km.toFixed(1)} km away`;
};

/**
 * Promise-based helper to get current user geolocation
 * @param {object} options Geolocation options (timeout, highAccuracy)
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export const getUserCurrentPosition = (options = {}) => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        let msg = 'Unable to retrieve your location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission denied. Please search for a pickup location manually.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location information is currently unavailable.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out. Please try again or search manually.';
        }
        const err = new Error(msg);
        err.code = error.code;
        reject(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
        ...options
      }
    );
  });
};
