document.addEventListener("DOMContentLoaded", () => {
  if (
    typeof window.coordinates === "undefined" ||
    !Array.isArray(window.coordinates) ||
    window.coordinates.length !== 2
  ) {
    console.warn("Map not initialized: invalid coordinates");
    return;
  }

  const mapDiv = document.getElementById("map");
  if (!mapDiv) {
    console.warn("Map container not found");
    return;
  }

  const lng = window.coordinates[0];
  const lat = window.coordinates[1];

  const map = L.map(mapDiv).setView([lat, lng], 13);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  const marker = L.marker([lat, lng]).addTo(map);
  marker.bindPopup("Actual Location will be provided after booking");

  // 🔥 REQUIRED when map is inside Bootstrap / EJS layouts
  setTimeout(() => {
    map.invalidateSize();
  }, 200);
});
