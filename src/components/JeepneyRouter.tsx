import L from "leaflet";
import * as turf from "@turf/turf";
import nearestPointOnLine from "@turf/nearest-point-on-line";
import { useEffect, useState } from "react";

type JeepneyRoute = {
  name: string;
  color: string;
  coordinates: [number, number][];
};

class FlexibleJeepneyRouter {
  routes: JeepneyRoute[];

  constructor(routes: JeepneyRoute[]) {
    this.routes = routes; // Predefined jeepney routes
  }

  route(
    waypoints: { latLng: L.LatLng }[],
    callback: (error: Error | null, routes: any[] | null) => void,
    context: any
  ) {
    const start = waypoints[0].latLng;
    const end = waypoints[1].latLng;

    const startRoutes = this.findRoutesNearPoint(start);
    const endRoutes = this.findRoutesNearPoint(end);

    const directRoute = this.findDirectRoute(
      startRoutes,
      endRoutes,
      start,
      end
    );
    if (directRoute) {
      return callback(null, [this.formatRoute(directRoute)]);
    }

    const transferRoute = this.findTransferRoute(
      startRoutes,
      endRoutes,
      start,
      end
    );
    if (transferRoute) {
      return callback(null, [this.formatRoute(transferRoute)]);
    }

    callback(new Error("No jeepney route found"), null);
  }

  findRoutesNearPoint(point: L.LatLng, threshold = 0.005) {
    return this.routes.filter((route) => {
      const line = turf.lineString(route.coordinates);
      const nearestPoint = nearestPointOnLine(
        line,
        turf.point([point.lng, point.lat])
      );
      return nearestPoint.properties.dist <= threshold;
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
        const line = turf.lineString(route.path);
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

  findTransferRoute(
    startRoutes: any,
    endRoutes: any,
    start: L.LatLng,
    end: L.LatLng
  ) {
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
    return routeA.path.filter((coordA: [number, number]) =>
      routeB.path.some((coordB: [number, number]) => {
        return (
          Math.abs(coordA[0] - coordB[0]) < 0.0005 &&
          Math.abs(coordA[1] - coordB[1]) < 0.0005
        );
      })
    );
  }

  formatRoute(route: any) {
    if (route.startRoute && route.endRoute) {
      return {
        name: `${route.startRoute.name} to ${route.endRoute.name} (via transfer)`,
        coordinates: [...route.startRoute.path, ...route.endRoute.path],
        instructions: [
          { text: `Take ${route.startRoute.name} to transfer point` },
          {
            text: `Transfer to ${route.endRoute.name} and proceed to destination`,
          },
        ],
      };
    } else {
      return {
        name: route.route.name,
        coordinates: route.route.path,
        instructions: [{ text: `Take ${route.route.name}` }],
      };
    }
  }
}

const JeepneyRouter = ({ start, end }: { start: [number, number]; end: [number, number] }) => {
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

const map = L.map("map").setView([14.599512, 120.984222], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

L.Routing.control({
  waypoints: [
    L.latLng(start[0], start[1]), 
    L.latLng(end[0], end[1]),
  ],
  router: new FlexibleJeepneyRouter(jeepneyRoutes),
  routeWhileDragging: true,
}).addTo(map);

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

    
};



    ROUTE FETCHER
     

  */
