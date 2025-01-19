from django.urls import path
from .views import route
urlpatterns = [
  path('route/', route)
]