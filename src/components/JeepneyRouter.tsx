import L from "leaflet";
import { useMap } from "react-leaflet";
import { useEffect } from "react";

export type JeepneyRoute = {
  name: string;
  color: string;
  coordinates: [number, number][];
};

class FlexibleJeepneyRouter implements L.Routing.IRouter {
  route(
    waypoints: L.Routing.Waypoint[],
    callback: (error?: L.Routing.IError, routes?: L.Routing.IRoute[]) => void,
    context?: any
  ) {
    try {
      const coordinates = waypoints.map((wp) => wp.latLng);

      // Create the route object
      const route: L.Routing.IRoute = {
        name: "Custom Route",
        summary: {
          totalDistance: 1000, // meters
          totalTime: 600, // seconds
        },
        coordinates: coordinates,
        instructions: coordinates.map((coord, index) => ({
          text: `Waypoint ${index + 1}`,
          distance: 1000 / coordinates.length, // meters
          time: 600 / coordinates.length, // seconds
        })),
      };

      console.log("Generated route:", route);

      // Pass the route to the callback
      callback.call(context, undefined, [route]);
    } catch (error) {
      console.error("Error in FlexibleJeepneyRouter.route:", error);
      callback.call(
        context,
        { message: "Routing error", status: 500 },
        undefined
      );
    }
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
    if (!map) {
      console.warn("Map is not initialized.");
      return;
    }

    if (!routes || routes.length === 0) {
      console.warn("Routes data is empty.");
      return;
    }

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
      routeWhileDragging: true,
      router: new FlexibleJeepneyRouter(),
    });

    try {
      routingControl.addTo(map);
      console.log("Routing control added to map.");
    } catch (error) {
      console.error("Error adding routing control to map:", error);
    }

    return () => {
      try {
        routingControl.remove();
        console.log("Routing control removed from map.");
      } catch (error) {
        console.error("Error removing routing control from map:", error);
      }
    };
  }, [map, start, end, routes]);

  return null;
};

export default JeepneyRouter;
