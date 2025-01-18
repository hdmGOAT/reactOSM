import L, { LatLng, LatLngExpression } from "leaflet";
import "leaflet-routing-machine";

export class CustomRouter extends L.Class {
  /*
  TO DO:
    - Create backend api for routing
        -  Json file must contain
        {
        "code":  // Ok or Error
        "routes": [ // Array of possible routes
        {
            "geometry": // Encoded compressed polyline
            "legs":[ // Breaks down route into segments
                "steps": [], // Turn by turn instruction of each segment
                "summary": "", //Describes the leg. Streetnames and shit
                "weight":  // Cost of the route based on weighing metric (weight_name) used for route selection
                "duration": // Total travel time in seconds for the leg
                "distance" // Total distance in meters of the leg
            ],
            "weight_name": // Specifies weighing metric of the route
            "weight": // Total cost of the route
            "duration" // Total travel time in seconds for the route
            "distance" // Total distance in meters of the route
        }
        ],
        "waypoints": [
                {
                    "hint" // For the server to optimize subsequent reqs
                    "distance" // Distance from input location to snapped location on road network
                    "name" // Name of road or location near waypoint
                    "location" // array of two numbers, coordinates
                },
                {
                    "hint"
                    "distance"
                    "name"
                    "location"
                },
            ]
        }
    - 
    - 
    -
  
  */
}
