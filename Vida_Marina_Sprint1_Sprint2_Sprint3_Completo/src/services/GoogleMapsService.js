/**
 * ================================================================
 * SERVICIO: GoogleMapsService (RF05 - Integración de Mapas y Geolocalización)
 * ================================================================
 * Administra la carga de la API de Google Maps, geolocalización HTML5,
 * colocación de marcadores interactivos y geocodificación inversa.
 */
class GoogleMapsService {
  static isLoaded = false;
  static apiKey = '';

  /**
   * Carga de manera dinámica la API de Google Maps JavaScript.
   */
  static loadGoogleMaps(apiKey) {
    if (GoogleMapsService.isLoaded || (typeof window !== 'undefined' && window.google && window.google.maps)) {
      GoogleMapsService.isLoaded = true;
      return Promise.resolve(window.google.maps);
    }

    const key = apiKey || GoogleMapsService.apiKey || (typeof window !== 'undefined' ? window.GOOGLE_MAPS_API_KEY : '');
    if (!key) {
      return Promise.reject(new Error('No se ha suministrado una Google Maps API Key. Utilizando mapa interactivo integrado.'));
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        GoogleMapsService.isLoaded = true;
        resolve(window.google.maps);
      };
      script.onerror = (err) => reject(new Error('Error al cargar Google Maps API.'));
      document.head.appendChild(script);
    });
  }

  /**
   * Obtiene la ubicación GPS actual del dispositivo utilizando Geolocation API.
   */
  static getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('La geolocalización no está soportada por este navegador.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: Number(position.coords.latitude.toFixed(6)),
            longitude: Number(position.coords.longitude.toFixed(6)),
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          let msg = 'No fue posible obtener la ubicación del dispositivo.';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              msg = 'Permiso de geolocalización denegado por el usuario.';
              break;
            case error.POSITION_UNAVAILABLE:
              msg = 'La información de ubicación no se encuentra disponible.';
              break;
            case error.TIMEOUT:
              msg = 'Se agotó el tiempo de espera para obtener la ubicación.';
              break;
          }
          reject(new Error(msg));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  /**
   * Geocodificación inversa para obtener el nombre de la localidad costera.
   */
  static async reverseGeocode(lat, lng) {
    try {
      // Intento mediante OpenStreetMap Nominatim (libre y sin API Key restrictiva)
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`, {
        headers: { 'Accept-Language': 'es' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          const parts = data.display_name.split(',');
          return parts.slice(0, 3).join(',').trim();
        }
      }
    } catch (e) {
      // Ignorar y usar fallback
    }

    // Fallback basado en regiones marinas colombianas conocidas
    if (lat >= 12.0 && lat <= 13.5 && lng >= -82.0 && lng <= -81.0) return 'Archipiélago de San Andrés y Providencia';
    if (lat >= 10.3 && lat <= 10.6 && lng >= -75.7 && lng <= -75.3) return 'Bahía de Cartagena / Islas del Rosario, Bolívar';
    if (lat >= 11.1 && lat <= 11.4 && lng >= -74.3 && lng <= -74.1) return 'Bahía de Santa Marta / PNN Tayrona, Magdalena';
    if (lat >= 3.8 && lat <= 4.0 && lng >= -77.2 && lng <= -77.0) return 'Bahía de Buenaventura, Valle del Cauca';
    if (lat >= 1.7 && lat <= 1.9 && lng >= -78.9 && lng <= -78.7) return 'Bahía de Tumaco, Nariño';
    if (lat >= 11.4 && lat <= 12.5 && lng >= -73.0 && lng <= -71.0) return 'Costa de La Guajira, Mar Caribe';
    return `Coordenadas: Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`;
  }

  /**
   * Estilo de mapa oscuro con acentos oceánicos y marinos para Google Maps.
   */
  static getOceanMapStyle() {
    return [
      { elementType: 'geometry', stylers: [{ color: '#07192f' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#030d1a' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#90e0ef' }] },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#001e3d' }]
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#00f5d4' }]
      },
      {
        featureType: 'landscape.natural',
        elementType: 'geometry',
        stylers: [{ color: '#0b2545' }]
      },
      {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [{ color: '#13315c' }]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#134074' }]
      }
    ];
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GoogleMapsService };
}
