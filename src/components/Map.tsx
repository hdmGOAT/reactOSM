import {
  MapContainer,
  TileLayer,
  Polyline,
  Tooltip,
  LayersControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.js";
import { useEffect, useState } from "react";

import JeepneyRouter from "./JeepneyRouter";

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

  const calculateNearestPointOnRoute = (
    startPoint: [number, number],
    route: [number, number][]
  ): [number, number] => {
    let minDistance = Infinity;
    let nearestPoint: [number, number] | null = null;

    for (let i = 0; i < route?.length - 1; i++) {
      const pointA = route[i];
      const pointB = route[i + 1];

      const closestPoint = calculateClosestPointOnSegment(
        startPoint,
        pointA,
        pointB
      );

      const distance = Math.sqrt(
        Math.pow(closestPoint[0] - startPoint[0], 2) +
          Math.pow(closestPoint[1] - startPoint[1], 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = closestPoint;
      }
    }

    return nearestPoint!;
  };
  const calculateClosestPointOnSegment = (
    point: [number, number],
    segmentStart: [number, number],
    segmentEnd: [number, number]
  ): [number, number] => {
    const [x1, y1] = segmentStart;
    const [x2, y2] = segmentEnd;
    const [px, py] = point;

    const dx = x2 - x1;
    const dy = y2 - y1;

    const t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy);

    const clampedT = Math.max(0, Math.min(1, t));

    return [x1 + clampedT * dx, y1 + clampedT * dy];
  };

  const nearestPoint = calculateNearestPointOnRoute(
    start,
    jeepneyRoutes[0]?.coordinates
  );

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

        <LayersControl.Overlay checked name="Jeepney Routes">
          <>
            {jeepneyRoutes?.map((route, index) => (
              <Polyline
                key={index}
                positions={route.coordinates}
                color={route.color}
                weight={4}
              >
                <Tooltip permanent>{route.name}</Tooltip>
              </Polyline>
            ))}
          </>
        </LayersControl.Overlay>

        {nearestPoint && (
          <LayersControl.Overlay checked name="Routing">
            <JeepneyRouter start={start} end={nearestPoint} />
          </LayersControl.Overlay>
        )}
      </LayersControl>
    </MapContainer>
  );
};

export default Map;
