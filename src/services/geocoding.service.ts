import { logger } from '../utils/logger';

interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

export class GeocodingService {
  private baseUrl = 'https://nominatim.openstreetmap.org';

  async geocode(direccion: string): Promise<GeocodingResult | null> {
    try {
      const url = `${this.baseUrl}/search?q=${encodeURIComponent(direccion)}&format=json&limit=1&accept-language=es`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'MandaderoMVP/1.0 (Queretaro)',
        },
      });

      if (!response.ok) {
        logger.warn({ status: response.status }, 'Error en geocodificación');
        return null;
      }

      const data = (await response.json()) as NominatimResult[];

      if (!data || data.length === 0) {
        logger.warn({ direccion }, 'Dirección no encontrada por geocoder');
        return null;
      }

      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name,
      };
    } catch (error) {
      logger.error({ error, direccion }, 'Error al geocodificar dirección');
      return null;
    }
  }

  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
      const url = `${this.baseUrl}/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=es`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'MandaderoMVP/1.0 (Queretaro)',
        },
      });

      if (!response.ok) {
        logger.warn({ status: response.status }, 'Error en geocodificación inversa');
        return null;
      }

      const data = (await response.json()) as NominatimResult;

      if (!data || !data.display_name) {
        return null;
      }

      return data.display_name;
    } catch (error) {
      logger.error({ error, lat, lng }, 'Error al geocodificar inversamente');
      return null;
    }
  }
}

export const geocodingService = new GeocodingService();
