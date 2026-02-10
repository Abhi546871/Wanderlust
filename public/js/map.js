if (coordinates && coordinates.length === 2) {
  const lng = coordinates[0];
  const lat = coordinates[1];

  const map = L.map("map").setView([lat, lng], 13);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  const marker = L.marker([lat, lng]).addTo(map);

  marker.bindPopup("Actual Location will provided after booking");

  marker.on("mouseover", function () {
    this.openPopup();
  });

  marker.on("mouseout", function () {
    this.closePopup();
  });
}
