import L from "leaflet";
import * as turf from "@turf/turf";
import nearestPointOnLine from "@turf/nearest-point-on-line";
import { useMap } from "react-leaflet";
import { useEffect } from "react";

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
        console.log("Direct route found:", directRoute);
        callback(undefined, [this.formatRoute(directRoute)]);
        return;
      }

      const transferRoute = this.findTransferRoute(startRoutes, endRoutes);
      if (transferRoute) {
        console.log("Transfer route found:", transferRoute);
        callback(undefined, [this.formatRoute(transferRoute)]);
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

  findRoutesNearPoint(point: L.LatLng, threshold = 8000) {
    console.log("Checking point:", point);

    return this.routes.filter((route) => {
      console.log("Route being checked:", route);

      const line = turf.lineString(route.coordinates);
      const nearestPoint = nearestPointOnLine(
        line,
        turf.point([point.lng, point.lat])
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
      if (endRoutes.includes(route)) {
        const line = turf.lineString(route.coordinates);
        const startNearest = nearestPointOnLine(
          line,
          turf.point([start.lng, start.lat])
        );
        const endNearest = nearestPointOnLine(
          line,
          turf.point([end.lng, end.lat])
        );

        if (startNearest.properties.index < endNearest.properties.index) {
          return { route, startNearest, endNearest };
        }
      }
    }
    return null;
  }

  findTransferRoute(startRoutes: any, endRoutes: any) {
    for (let startRoute of startRoutes) {
      for (let endRoute of endRoutes) {
        const transferStops = this.findOverlapPoints(startRoute, endRoute);
        if (transferStops.length > 0) {
          return { startRoute, endRoute, transferStop: transferStops[0] };
        }
      }
    }
    return null;
  }

  findOverlapPoints(routeA: any, routeB: any) {
    return routeA.coordinates.filter((coordA: [number, number]) =>
      routeB.coordinates.some((coordB: [number, number]) => {
        return (
          Math.abs(coordA[0] - coordB[0]) < 0.0005 &&
          Math.abs(coordA[1] - coordB[1]) < 0.0005
        );
      })
    );
  }

  formatRoute(route: any): L.Routing.IRoute {
    console.log("Formatting route:", route);

    // Handle combined route with transfer
    const coordinates = [
      ...route.startRoute.coordinates,
      route.transferStop,
      ...route.endRoute.coordinates,
    ].map(([lat, lng]: [number, number]) => L.latLng(lat, lng)); // Ensure Leaflet LatLng format

    return {
      name: `${route.startRoute.name} to ${route.endRoute.name}`, // Dynamic route name
      coordinates,
      summary: {
        totalDistance: coordinates.length, // Replace with actual distance if needed
        totalTime: 0, // Replace with actual time if available
      },
      instructions: [
        {
          text: `Take ${route.startRoute.name}`,
          distance: 0, // Replace with actual distance
          time: 0, // Replace with actual time
        },
        {
          text: `Transfer at ${route.transferStop}`,
          distance: 0,
          time: 0,
        },
        {
          text: `Take ${route.endRoute.name}`,
          distance: 0,
          time: 0,
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
  console.log("Map instance:", map);

  useEffect(() => {
    if (!routes || routes.length === 0) {
      console.warn("No routes to display.");
      return;
    }

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
      routeWhileDragging: true,
      router: new FlexibleJeepneyRouter(routes),
    }).addTo(map);

    return () => {
      map.removeControl(routingControl);
    };
  }, [map, start, end, routes]);

  return null;
};
export default JeepneyRouter;

