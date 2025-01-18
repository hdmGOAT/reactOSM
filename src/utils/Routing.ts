import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import { LatLng } from "leaflet";

const Routing = ({ start, end }: { start: LatLng; end: LatLng }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(start.lat, start.lng), L.latLng(end.lat, end.lng)],
      routeWhileDragging: true,
    }).addTo(map);

    return () => {
      if (map) {
        map.removeControl(routingControl);
      }
    };
  }, [map, start, end]);

  return null;
};

export default Routing;
