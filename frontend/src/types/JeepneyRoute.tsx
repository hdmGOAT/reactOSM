import { LatLng } from "leaflet";

export interface JeepneyRoute {
  name: string;
  color: string;
  coordinates: LatLng[];
}
