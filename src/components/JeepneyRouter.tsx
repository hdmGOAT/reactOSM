import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

const JeepneyRouter = ({
  start,
  end,
}: {
  start: [number, number];
  end: [number, number];
}) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
      routeWhileDragging: false,
      showAlternatives: false,
      lineOptions: {
        styles: [{ color: "black", dashArray: "5,5", weight: 4 }],
        extendToWaypoints: true,
        missingRouteTolerance: 100,
      },
    }).addTo(map);

    routingControl.getWaypoints().forEach((waypoint, index) => {
      const latLng = waypoint.latLng;
      if (latLng) {
        const marker = L.marker(latLng, {
          draggable: index === 0,
        }).addTo(map);

        if (index === 0) {
          marker.bindPopup("Start Point").openPopup();
        } else if (index === 1) {
          marker.bindPopup("End Point").openPopup();
        }
      }
    });

    return () => {
      map.removeControl(routingControl);
    };
  }, [map, start, end]);

  return null;
};

export default JeepneyRouter;


/*
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




    ROUTE FETCHER
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

  */