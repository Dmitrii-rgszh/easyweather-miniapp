export async function getCityByCoords(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ru`;
  const res = await fetch(url);
  const data = await res.json();
  // Берём либо city, либо town, либо village, либо state
  return (
    data.address.city ||
    data.address.town ||
    data.address.village ||
    data.address.state ||
    'Город не найден'
  );
}
