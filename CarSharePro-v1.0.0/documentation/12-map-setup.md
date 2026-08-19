# 12 - Geospatial Maps & Location Search Setup

## Map Technologies

CarSharePro uses **Leaflet** with **OpenStreetMap (OSM)** and **Nominatim Reverse Geocoding**. This architecture offers substantial benefits:
- **Zero API Key Required**: No expensive Google Maps billing setup or recurring API limits.
- **2dsphere MongoDB Spatial Indexing**: Native geospatial indexing and querying with Haversine distance computations in kilometers.
- **GPS "Near Me" Discovery**: Renter can click the "Near Me" GPS button to locate all available vehicles within a 5km, 15km, or 50km radius.

---

## Components

- `src/components/map/CarMap.jsx`: Interactive map with custom vehicle marker pins, price bubbles, interactive popups, and click-to-view preview cards.
- `src/components/map/LocationPicker.jsx`: Interactive map pin selector used by hosts when listing a car. Dragging or clicking automatically populates Latitude, Longitude, and reverse-geocoded address.
- `src/components/map/LocationSearch.jsx`: Autocomplete city and neighborhood search powered by OpenStreetMap Nominatim.
- `src/utils/distance.js`: Haversine formula calculation computing straight-line and driving proximity distances between user coordinates and listed vehicle coordinates.
