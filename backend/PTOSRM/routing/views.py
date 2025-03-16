from django.shortcuts import render
from django.http import JsonResponse
# Create your views here.

def route(request):
  test_response = {
                    "code": 1, 
                    "routes": [
                      {
                        "geometry": 123,
                        "legs": [{
                          "steps": [
                            "turn to left"
                          ],
                          "summary": "aaaaaaaa",
                          "weight": 12,
                          "duration": 12,
                          "distance": 12,
                        }
                        ],
                        "weight_name": "price",
                        "weight": 12,
                        "duration":12,
                        "distance": 12,
                      }
                    ],
                    "waypoints": [
                      {
                        "hint": "yo",
                        "distance": 12,
                        "name": "asdfa",
                        "location": [12, 12],
                      },
                      {
                        "hint": "yo",
                        "distance": 12,
                        "name": "asdfa",
                        "location": [12, 12],
                      },
                    ]
                  }
  return JsonResponse(test_response)