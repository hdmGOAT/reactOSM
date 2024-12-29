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
  routes: JeepneyRoute[];

  constructor(routes: JeepneyRoute[]) {
    this.routes = routes;
  }

  route = (
    waypoints: L.Routing.Waypoint[],
    callback: (error?: L.Routing.IError, routes?: L.Routing.IRoute[]) => void
  ) => {
    // Calculate the route based on the waypoints and available routes
    const route = this.getRouteFromWaypoints(waypoints);
    callback(undefined, [route]);
  }

  // You need to implement a method that calculates a route based on the waypoints
  getRouteFromWaypoints(waypoints: L.Routing.Waypoint[]): L.Routing.IRoute {
    // You would use your existing logic to calculate the best route here.
    // For now, we're returning a predefined route:
    return {
      name: "Test Route",
      coordinates: [
        L.latLng(8.501678, 124.632554),
        L.latLng(8.484751, 124.63411),
      ],
      summary: {
        totalDistance: 2000,
        totalTime: 1200,
      },
      instructions: [
        {
          text: "Start at point 1",
          distance: 1000,
          time: 600,
        },
        {
          text: "Continue to point 2",
          distance: 1000,
          time: 600,
        },
      ],
    };
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

    const jeepneyRouter = new FlexibleJeepneyRouter(routes);

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
      router: jeepneyRouter,
      routeWhileDragging: true,
    });

    console.log("Routing control initialized:", routingControl);
    jeepneyRouter.route = jeepneyRouter.route.bind(jeepneyRouter);
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


