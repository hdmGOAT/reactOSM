import {
  MapContainer,
  Popup,
  TileLayer,
  Polyline,
  Tooltip,
  Marker,
  LayersControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.js";
import L, { Routing } from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

const Map = () => {
  const defaultCenter: [number, number] = [8.47543, 124.64212];

  const start: [number, number] = [8.501678, 124.632554];
  const end: [number, number] = [8.484751, 124.63411];

  const jeepneyRoutes = [
    {
      name: "RB",
      color: "red",
      coordinates: [
        [8.507543426121941, 124.63666155941615],
        [8.506126755571373, 124.6350203015561],
        [8.50506471878984, 124.63381310675595],
        [8.502057281599889, 124.63245594318141],
        [8.501874404651986, 124.6327563559426],
        [8.50029496859078, 124.6321542955103],
        [8.497817340638079, 124.63116958617474],
        [8.496951618041209, 124.63037183972415],
        [8.496762408949479, 124.6301995963874],
        [8.492993966193524, 124.63224742018758],
        [8.491661392514345, 124.6332412990123],
        [8.490490674987043, 124.63487397780716],
        [8.489313109617143, 124.6383809516268],
        [8.48776140685844, 124.64318520080388],
        [8.48659254669029, 124.64715469917024],
        [8.486108438729374, 124.6493297525596],
        [8.485732672382056, 124.65111470938723],
        [8.485242244362198, 124.6535003745933],
        [8.485008313555113, 124.6545987466925],
        [8.484928947491227, 124.65497990744694],
        [8.484580862554395, 124.65650082052605],
        [8.484497852396316, 124.65689017293857],
        [8.484061588894619, 124.65688331660687],
        [8.481869209501355, 124.65753701270535],
        [8.480913038960423, 124.65755986671707],
        [8.4799721877215, 124.65630417672992],
        [8.47912965437068, 124.65586935486311],
        [8.47830963326409, 124.65578004702024],
        [8.478660798306692, 124.6538080980352],
      ] as [number, number][],
    },
    {
      name: "C2",
      color: "blue",
      coordinates: [
        [8.49949861339978, 124.62336328967592],
        [8.497887399172598, 124.62421491364199],
        [8.495900944969918, 124.62529653261834],
        [8.49422316044074, 124.62617506374414],
        [8.493177575905491, 124.62675575373527],
        [8.491954691183821, 124.6274115303699],
        [8.490257522972456, 124.62836485199387],
        [8.489694317902448, 124.62865951811978],
        [8.488069422210799, 124.62950313391235],
        [8.487655467963776, 124.62972373779598],
        [8.487301169697261, 124.62997218170818],
        [8.487186879864353, 124.63011373696116],
        [8.487029732484274, 124.6303939591304],
        [8.48696315715739, 124.63277735818872],
        [8.486686004009485, 124.6334909122184],
        [8.48610883882479, 124.63475046734123],
        [8.485283093033473, 124.63687956368193],
        [8.484971238473477, 124.6378816481527],
        [8.484965213790971, 124.63788751532775],
        [8.484848490855725, 124.63822155674671],
        [8.48491971163429, 124.63837157534749],
        [8.485058196443077, 124.63855959866163],
        [8.48575457643939, 124.63871961850293],
        [8.486456100748015, 124.63889908305663],
        [8.487331842426443, 124.63910366113925],
        [8.488885541660707, 124.63966244772979],
        [8.488957632236406, 124.63968780046548],
        [8.48659346227872, 124.64713188017691],
        [8.486121621526635, 124.6493497378076],
        [8.485737986472415, 124.65115009689669],
        [8.485245775971379, 124.65347095382248],
        [8.484937975437148, 124.65489201973566],
        [8.484577178588793, 124.65651720154028],
        [8.484481806887814, 124.65696009656796],
        [8.48405956525275, 124.6568917903897],
        [8.483938925318029, 124.65689422905473],
        [8.483165108076392, 124.65742473079962],
        [8.482414721195383, 124.65749791575502],
        [8.481833935740369, 124.65753322279562],
        [8.480907409956515, 124.65757469440223],
        [8.480765052401111, 124.6575698147642],
        [8.480600979833156, 124.65741612586766],
        [8.479992455718431, 124.65633213037393],
        [8.47969326391069, 124.65610281677937],
        [8.47925603156159, 124.65591405286415],
        [8.47868177501293, 124.65583354915606],
        [8.478266765731021, 124.6557798797644],
        [8.478201619001325, 124.65577012196684],
        [8.478670527403239, 124.65379245240086],
        [8.478677450024904, 124.65373941000416],
        [8.476752159662922, 124.65351732058895],
        [8.477049354466104, 124.6510155318532],
        [8.477159186504338, 124.65058441321088],
        [8.477430536563745, 124.64954581203284],
      ] as [number, number][],
    },
  ];

  const calculateNearestPointOnRoute = (
    startPoint: [number, number],
    route: [number, number][]
  ): [number, number] => {
    let minDistance = Infinity;
    let nearestPoint: [number, number] | null = null;

    for (let i = 0; i < route.length - 1; i++) {
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
    jeepneyRoutes[0].coordinates
  );

  return (
    <MapContainer
      center={defaultCenter}
      zoom={13}
      style={{ height: "500px", width: "100%" }}
    >
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Default OpenStreetMap">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer name="CartoDB Light">
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
          />
        </LayersControl.BaseLayer>

        <LayersControl.Overlay checked name="Jeepney Routes">
          <>
            {jeepneyRoutes.map((route, index) => (
              <Polyline
                key={index}
                positions={route.coordinates}
                color={route.color}
                weight={4}
              >
                <Tooltip permanent>{route.name}</Tooltip>
              </Polyline>
            ))}
          </>
        </LayersControl.Overlay>

        {nearestPoint && (
          <LayersControl.Overlay checked name="Routing">
            <RoutingControl start={start} end={nearestPoint} />
          </LayersControl.Overlay>
        )}
      </LayersControl>
    </MapContainer>
  );
};

export default Map;

const RoutingControl = ({
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
