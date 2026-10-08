import { GeoJSONSource, Map } from 'maplibre-gl';
import { AirportRunwayResponse } from '../../api/airports';

const RUNWAY_SOURCE_ID = 'airport-runways';
const RUNWAY_CASING_LAYER_ID = 'airport-runway-casing';
const RUNWAY_LAYER_ID = 'airport-runway-highlight';

const EMPTY_RUNWAY_COLLECTION = {
  type: 'FeatureCollection' as const,
  features: [],
};

export function ensureRunwayLayers(map: Map): void {
  if (!map.getSource(RUNWAY_SOURCE_ID)) {
    map.addSource(RUNWAY_SOURCE_ID, {
      type: 'geojson',
      data: EMPTY_RUNWAY_COLLECTION,
    });
  }

  if (!map.getLayer(RUNWAY_CASING_LAYER_ID)) {
    map.addLayer({
      id: RUNWAY_CASING_LAYER_ID,
      type: 'line',
      source: RUNWAY_SOURCE_ID,
      paint: {
        'line-color': '#06111b',
        'line-opacity': 0.85,
        'line-width': 8,
      },
    });
  }

  if (!map.getLayer(RUNWAY_LAYER_ID)) {
    map.addLayer({
      id: RUNWAY_LAYER_ID,
      type: 'line',
      source: RUNWAY_SOURCE_ID,
      paint: {
        'line-color': [
          'case',
          ['boolean', ['get', 'closed'], false],
          '#ef4444',
          '#facc15',
        ],
        'line-opacity': 0.92,
        'line-width': 4,
      },
    });
  }
}

export function updateRunwaySource(
  map: Map,
  runways: readonly AirportRunwayResponse[] | null,
): void {
  const source = map.getSource(RUNWAY_SOURCE_ID);

  if (source?.type !== 'geojson') {
    return;
  }

  (source as GeoJSONSource).setData({
    type: 'FeatureCollection',
    features: (runways ?? [])
      .filter(hasRunwayGeometry)
      .map((runway) => ({
        type: 'Feature' as const,
        id: runway.sourceRunwayId,
        geometry: {
          type: 'LineString' as const,
          coordinates: [
            [runway.leLongitudeDeg, runway.leLatitudeDeg],
            [runway.heLongitudeDeg, runway.heLatitudeDeg],
          ],
        },
        properties: {
          closed: runway.closed,
          ident: `${runway.leIdent ?? '?'} / ${runway.heIdent ?? '?'}`,
        },
      })),
  });
}

function hasRunwayGeometry(
  runway: AirportRunwayResponse,
): runway is AirportRunwayResponse & {
  leLatitudeDeg: number;
  leLongitudeDeg: number;
  heLatitudeDeg: number;
  heLongitudeDeg: number;
} {
  return (
    runway.leLatitudeDeg !== null &&
    runway.leLongitudeDeg !== null &&
    runway.heLatitudeDeg !== null &&
    runway.heLongitudeDeg !== null
  );
}
