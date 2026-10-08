import { GeoJSONSource, Map } from 'maplibre-gl';
import { AirportRunwayResponse } from '../../api/airports';

const RUNWAY_SOURCE_ID = 'airport-runways';
const RUNWAY_GLOW_LAYER_ID = 'airport-runway-glow';
const RUNWAY_CASING_LAYER_ID = 'airport-runway-casing';
const RUNWAY_LAYER_ID = 'airport-runway-highlight';
const RUNWAY_LABEL_LAYER_ID = 'airport-runway-label';
const RUNWAY_SWEEP_LAYER_ID = 'airport-runway-sweep';
export const RUNWAY_HIT_LAYER_ID = 'airport-runway-hit';

function runwayToken(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(`--runway-${name}`).trim();
}

const EMPTY_RUNWAY_COLLECTION = {
  type: 'FeatureCollection' as const,
  features: [],
};

export function ensureRunwayLayers(map: Map): void {
  if (!map.getSource(RUNWAY_SOURCE_ID)) {
    map.addSource(RUNWAY_SOURCE_ID, {
      type: 'geojson',
      lineMetrics: true,
      data: EMPTY_RUNWAY_COLLECTION,
    });
  }

  if (!map.getLayer(RUNWAY_GLOW_LAYER_ID)) {
    map.addLayer({
      id: RUNWAY_GLOW_LAYER_ID,
      type: 'line',
      source: RUNWAY_SOURCE_ID,
      paint: {
        'line-blur': 6,
        'line-color': [
          'case',
          ['boolean', ['get', 'closed'], false],
           runwayToken('closed'),
           runwayToken('glow'),
        ],
        'line-opacity': 0.45,
        'line-width': 14,
      },
    });
  }

  if (!map.getLayer(RUNWAY_CASING_LAYER_ID)) {
    map.addLayer({
      id: RUNWAY_CASING_LAYER_ID,
      type: 'line',
      source: RUNWAY_SOURCE_ID,
      paint: {
        'line-color': runwayToken('casing'),
        'line-opacity': 0.9,
        'line-width': 7,
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
           runwayToken('closed'),
           runwayToken('open'),
        ],
        'line-opacity': 0.95,
        'line-width': 3.5,
      },
    });
  }

  if (!map.getLayer(RUNWAY_SWEEP_LAYER_ID)) {
    map.addLayer({
      id: RUNWAY_SWEEP_LAYER_ID,
      type: 'line',
      source: RUNWAY_SOURCE_ID,
      filter: ['!=', ['get', 'closed'], true],
      paint: {
        'line-width': 7,
        'line-blur': 2,
        'line-gradient': sweepGradient(0, runwayToken('sweep'), runwayToken('transparent')),
      },
    });
  }

  if (!map.getLayer(RUNWAY_HIT_LAYER_ID)) {
    map.addLayer({
      id: RUNWAY_HIT_LAYER_ID,
      type: 'line',
      source: RUNWAY_SOURCE_ID,
      paint: { 'line-width': 22, 'line-opacity': 0 },
    });
  }

  if (!map.getLayer(RUNWAY_LABEL_LAYER_ID)) {
    map.addLayer({
      id: RUNWAY_LABEL_LAYER_ID,
      type: 'symbol',
      source: RUNWAY_SOURCE_ID,
      layout: {
        'symbol-placement': 'line',
        'text-field': ['get', 'ident'],
        'text-font': ['Noto Sans Bold'],
        'text-size': 11,
      },
      paint: {
        'text-color': runwayToken('sweep'),
        'text-halo-color': runwayToken('casing'),
        'text-halo-width': 1.5,
      },
    });
  }
}

function sweepGradient(progress: number, bright: string, transparent: string) {
  return [
    'interpolate', ['linear'], ['abs', ['-', ['line-progress'], progress]],
    0, bright, 0.04, bright, 0.18, transparent,
  ] as import('maplibre-gl').ExpressionSpecification;
}

export function startRunwaySweep(map: Map): () => void {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const bright = runwayToken('sweep');
  const transparent = runwayToken('transparent');
  let frame = 0;
  let lastPaint = 0;
  const animate = (time: number) => {
    if (time - lastPaint >= 50 && map.getLayer(RUNWAY_SWEEP_LAYER_ID)) {
      map.setPaintProperty(RUNWAY_SWEEP_LAYER_ID, 'line-gradient',
        sweepGradient(((time % 3600) / 3600) * 1.4 - 0.2, bright, transparent));
      lastPaint = time;
    }
    frame = requestAnimationFrame(animate);
  };
  const syncMotion = () => {
    cancelAnimationFrame(frame);
    if (map.getLayer(RUNWAY_SWEEP_LAYER_ID)) {
      map.setLayoutProperty(RUNWAY_SWEEP_LAYER_ID, 'visibility', reducedMotion.matches ? 'none' : 'visible');
    }
    if (!reducedMotion.matches) frame = requestAnimationFrame(animate);
  };
  syncMotion();
  reducedMotion.addEventListener('change', syncMotion);
  return () => {
    cancelAnimationFrame(frame);
    reducedMotion.removeEventListener('change', syncMotion);
  };
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
