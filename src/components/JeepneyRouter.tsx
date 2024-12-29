import L, { bind } from "leaflet";
import * as turf from "@turf/turf";
import nearestPointOnLine from "@turf/nearest-point-on-line";
import { useMap } from "react-leaflet";
import { useEffect } from "react";
import length from "@turf/length";
import { lineString } from "@turf/helpers";

export type JeepneyRoute = {
  name: string;
  color: string;
  coordinates: [number, number][];
};


class FlexibleJeepneyRouter {
  route(
    waypoints: L.Routing.Waypoint[], 
    callback: (L.Routing.IError | null,
     routes?: L.Routing.IRoute[]) => void, context?: any, options?) {

    const coordinates = waypoints.map((wp) => wp.latLng);
    const route = {
      name: "Custom Route",
      coordinates: coordinates,
      instructions: [], // Add instructions if needed
      summary: {
        totalDistance: 1000, // Example distance in meters
        totalTime: 600, // Example time in seconds
      },
    };

    // Invoke the callback with the route
    callback.call(context, null, [route]);
  }
}

const JeepneyRouter = ({
  start,
  end,
  routes,
}: {
  start: [number, number];
  end: [number, number];
  routes: JeepneyRoute[];
}) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !routes || routes.length === 0) {
      console.warn("Map or routes not initialized properly.");
      return;
    }

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
      routeWhileDragging: true,
      router: new FlexibleJeepneyRouter(routes, [
        L.Routing.waypoint(L.latLng(start[0], start[1])),
        L.Routing.waypoint(L.latLng(end[0], end[1])),
      ]),
    });

    console.log("Routing control initialized:", routingControl);
    try {
      routingControl.addTo(map);
    } catch (error) {
      console.error("Error adding routing control to map:", error);
    }

    return () => {
      if (map && routingControl) {
        try {
          map.removeControl(routingControl);
          console.log("Routing control removed from map.");
        } catch (error) {
          console.error("Error removing routing control:", error);
        }
      }
    };
  }, [map, start, end, routes]);

  return null;
};

export default JeepneyRouter;


