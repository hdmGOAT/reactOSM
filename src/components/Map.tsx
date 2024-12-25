import { MapContainer, TileLayer, LayersControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.js";
import { useEffect, useState } from "react";

type JeepneyRoute = {
  name: string;
  color: string;
  coordinates: [number, number][];
};

const Map = () => {
  const defaultCenter: [number, number] = [8.47543, 124.64212];

  const start: [number, number] = [8.501678, 124.632554];
  const end: [number, number] = [8.484751, 124.63411];
  const [jeepneyRoutes, setJeepneyRoutes] = useState<JeepneyRoute[]>([]);

  useEffect(() => {
    fetch("/data/Routes.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setJeepneyRoutes(data.jeepneyRoutes))
      .catch((error) => console.error("Error fetching JSON:", error));
  }, []);

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
      </LayersControl>
    </MapContainer>
  );
};

export default Map;
