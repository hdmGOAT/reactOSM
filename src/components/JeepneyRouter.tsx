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
      console.log("Transfer route before formatting:", transferRoute);

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

    // Combine startRoute, transferStop, and endRoute into a single coordinates array
    const coordinates = [
      ...route.startRoute.coordinates,
      ...[route.transferStop], // Ensure transferStop is added as an array
      ...route.endRoute.coordinates,
    ].map(([lat, lng]: [number, number]) => L.latLng(lat, lng)); // Convert to Leaflet LatLng

    return {
      name: `${route.startRoute.name} to ${route.endRoute.name}`, // Generate a dynamic name
      coordinates,
      summary: {
        totalDistance: coordinates.length * 100, // Dummy distance (replace with actual)
        totalTime: coordinates.length * 10, // Dummy time (replace with actual)
      },
      instructions: [
        {
          text: `Take ${route.startRoute.name}`,
          distance: 0, // Replace with actual distance if available
          time: 0, // Replace with actual time if available
        },
        {
          text: `Transfer at (${route.transferStop[0]}, ${route.transferStop[1]})`,
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

  useEffect(() => {
    if (!map || !routes || routes.length === 0) {
      console.warn("Map or routes not initialized properly.");
      return;
    }

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
      //router: new FlexibleJeepneyRouter(routes),
      routeWhileDragging: true,
    });

    console.log("Routing control initialized:", routingControl);

    try {
      routingControl.addTo(map);
    } catch (error) {
      console.error("Error adding routing control to map:", error);
    }

    return () => {
      if (map) {
        map.removeControl(routingControl);
      }
    };
  }, [map, start, end, routes]);

  return null;
};

export default JeepneyRouter;


