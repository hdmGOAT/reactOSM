import L from "leaflet";
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

  route(
    waypoints: L.Routing.Waypoint[],
    callback: (
      error?: L.Routing.IError | undefined,
      routes?: L.Routing.IRoute[] | undefined
    ) => void
  ) {
    try {
      console.log("Waypoints passed to router:", waypoints);

      const start = waypoints[0].latLng;
      const end = waypoints[1].latLng;

      console.log("Start:", start, "End:", end);

      const startRoutes = this.findRoutesNearPoint(start);
      const endRoutes = this.findRoutesNearPoint(end);

      console.log("Start routes:", startRoutes);
      console.log("End routes:", endRoutes);

      const directRoute = this.findDirectRoute(
        startRoutes,
        endRoutes,
        start,
        end
      );
      if (directRoute) {
        const formattedRoute = this.formatDirectRoute(directRoute);

        console.log("Direct route found:", directRoute);
        console.log("Formatted direct route:", formattedRoute);
        try {
          console.log("Invoking callback with formatted route...");
          try {
            console.log("Invoking callback with test route...");
            if (
              !this.testRoute.coordinates ||
              this.testRoute.coordinates.length === 0
            ) {
              throw new Error("Test route has invalid or missing coordinates.");
            }

            callback(undefined, [this.testRoute]);
            console.log("Callback invoked successfully with test route.");
          } catch (callbackError) {
            console.error(
              "Error invoking callback with test route:",
              callbackError
            );
            throw callbackError;
          }

          console.log("Callback invoked successfully.");
        } catch (callbackError) {
          console.error("Error invoking callback:", callbackError);
          throw callbackError;
        }

        return;
      }

      callback({ status: 404, message: "No route found" }, undefined);
    } catch (error) {
      console.error("Error in FlexibleJeepneyRouter.route:", error);
      callback(
        { status: 500, message: "Internal error in routing" },
        undefined
      );
    }
  }

  findRoutesNearPoint(point: L.LatLng, threshold = 0.5) {
    console.log("Checking point:", point);

    return this.routes.filter((route) => {
      console.log("Route being checked:", route);

      const line = turf.lineString(route.coordinates);
      const nearestPoint = nearestPointOnLine(
        line,
        turf.point([point.lat, point.lng]),
        { units: "kilometers" }
      );

      if (nearestPoint.properties && nearestPoint.properties.dist) {
        console.log("Distance to nearest point:", nearestPoint.properties.dist);
        return nearestPoint.properties.dist <= threshold;
      } else {
        console.warn("Nearest point has no distance property");
        return false;
      }
    });
  }

  findDirectRoute(
    startRoutes: any,
    endRoutes: any,
    start: L.LatLng,
    end: L.LatLng
  ) {
    for (let route of startRoutes) {
      console.log("route:", route);
      if (endRoutes.includes(route)) {
        const line = turf.lineString(route.coordinates);
        const startNearest = nearestPointOnLine(
          line,
          turf.point([start.lat, start.lng])
        );
        const endNearest = nearestPointOnLine(
          line,
          turf.point([end.lat, end.lng])
        );

        console.log("startNearest: ", startNearest, "endNearest: ", endNearest);

        console.log(
          "aaaaaaa",
          startNearest.properties.index,
          "bbbbb",
          endNearest.properties.index
        );

        return { route, startNearest, endNearest };
      }
    }
    return null;
  }

  formatDirectRoute(route: any): L.Routing.IRoute {
    console.log("Formatting direct route:", route);

    // Validate and map coordinates
    const coordinates = route.route.coordinates.map(
      ([lat, lng]: [number, number]) => {
        if (typeof lat !== "number" || typeof lng !== "number") {
          throw new Error("Invalid coordinate format in route.coordinates");
        }
        return L.latLng(lat, lng);
      }
    );

    if (coordinates.length === 0) {
      throw new Error("Route has no valid coordinates.");
    }

    // Create a LineString and calculate total distance and time
    const line = lineString(route.route.coordinates);
    const totalDistance = length(line, { units: "kilometers" }) * 1000; // Convert to meters
    const totalTime = (totalDistance / 50) * 60; // Assume 50 km/h average speed

    // Generate detailed instructions
    const instructions = coordinates.map((_: any, index: number) => ({
      text: `Continue to point ${index + 1}`,
      distance: totalDistance / coordinates.length,
      time: totalTime / coordinates.length,
    }));

    // Return the formatted route
    return {
      name: route.route.name || "Direct Route",
      coordinates,
      summary: {
        totalDistance,
        totalTime,
      },
      instructions,
    };
  }

  testRoute: L.Routing.IRoute = {
    name: "Test Route",
    coordinates: [
      L.latLng(8.501678, 124.632554),
      L.latLng(8.484751, 124.63411),
    ],
    summary: {
      totalDistance: 2000, // Total distance in meters
      totalTime: 1200, // Total time in seconds
    },
    instructions: [
      {
        text: "Start at point 1",
        distance: 1000, // Distance for this instruction in meters
        time: 600, // Time for this instruction in seconds
      },
      {
        text: "Continue to point 2",
        distance: 1000,
        time: 600,
      },
    ],
  };
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
      router: new FlexibleJeepneyRouter(routes),
      routeWhileDragging: true,
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


