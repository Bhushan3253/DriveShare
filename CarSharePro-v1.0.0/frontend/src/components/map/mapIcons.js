import L from 'leaflet';

/**
 * Creates a custom animated DivIcon for the user's current location
 */
export const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'custom-user-marker',
    html: `
      <div class="user-marker-pulse-wrapper">
        <div class="user-marker-pulse"></div>
        <div class="user-marker-core">
          <div class="user-marker-dot"></div>
        </div>
        <div class="user-marker-label">YOU</div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

/**
 * Creates a custom car pin DivIcon with price pill
 * @param {object} car Car object
 * @param {boolean} isSelected Whether this car is currently selected/active
 */
export const createCarMarkerIcon = (car, isSelected = false) => {
  const priceText = `₹${Math.round(car.pricePerDay || 0)}`;
  const selectedClass = isSelected ? 'car-marker-selected' : '';

  return L.divIcon({
    className: `custom-car-marker ${selectedClass}`,
    html: `
      <div class="car-marker-container ${selectedClass}">
        <div class="car-marker-pill">
          <span class="car-marker-icon">🚗</span>
          <span class="car-marker-price">${priceText}</span>
        </div>
        <div class="car-marker-pointer"></div>
      </div>
    `,
    iconSize: [80, 40],
    iconAnchor: [40, 36],
    popupAnchor: [0, -36]
  });
};

/**
 * Creates a generic location / search pin DivIcon
 */
export const createSearchPinIcon = (label = 'Pickup') => {
  return L.divIcon({
    className: 'custom-search-pin',
    html: `
      <div class="search-pin-container">
        <div class="search-pin-badge">
          <span>📍</span>
          <span>${label}</span>
        </div>
        <div class="search-pin-pointer"></div>
      </div>
    `,
    iconSize: [70, 36],
    iconAnchor: [35, 34],
    popupAnchor: [0, -34]
  });
};
