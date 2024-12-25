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
