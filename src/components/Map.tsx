import { MapContainer, TileLayer, LayersControl, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.js";
import JeepneyRouter from "./JeepneyRouter";
import { JeepneyRoute } from "./JeepneyRouter";
import { useEffect, useState } from "react";

const Map = () => {
  const defaultCenter: [number, number] = [8.47543, 124.64212];

  const [jeepneyRoutes, setJeepneyRoutes] = useState<JeepneyRoute[]>([]);

  useEffect(() => {
    fetch("/data/Routes.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched routes:", data);

        // Ensure the data is in the expected format
        if (!data.jeepneyRoutes || !Array.isArray(data.jeepneyRoutes)) {
          throw new Error("Invalid data format");
        }

        // Log each route for inspection
        data.jeepneyRoutes.forEach((route: JeepneyRoute) =>
          console.log(`Route Name: ${route.name}, Color: ${route.color}`)
        );

        const validRoutes = data.jeepneyRoutes.map((route: any) => ({
          name: route.name,
          color: route.color,
          coordinates: route.coordinates.map(([lat, lng]: [number, number]) => [
            lat,
            lng,
          ]),
        }));
        setJeepneyRoutes(validRoutes);
      })
      .catch((error) => console.error("Error fetching JSON:", error));
  }, []);

  console.log("yo:", jeepneyRoutes);

  const start: [number, number] = [8.501678, 124.632554];
  const end: [number, number] = [8.484751, 124.63411];

  if (jeepneyRoutes.length === 0) {
    return <p>Loading routes...</p>;
  }

  return (
    <MapContainer
      center={defaultCenter}
      zoom={13}
      style={{ height: "500px", width: "100%" }}
    >
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Default OpenStreetMap">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer name="CartoDB Light">
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
          />
        </LayersControl.BaseLayer>

        <LayersControl.Overlay name="Start and Stop" checked>
          <Marker position={start} />
          <Marker position={end} />
        </LayersControl.Overlay>

        <LayersControl.Overlay name="Jeepney Route">
          <JeepneyRouter start={start} end={end} routes={jeepneyRoutes} />
        </LayersControl.Overlay>
      </LayersControl>
    </MapContainer>
  );
};

export default Map;
