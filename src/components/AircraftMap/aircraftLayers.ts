import { GeoJSONSource, Map, MapLayerMouseEvent } from 'maplibre-gl';
import { AircraftPositionFeatureCollection } from '../../api/aircraft';
import { AircraftTrailFeatureCollection } from '../../hooks/aircraftTrails';

const AIRCRAFT_SOURCE_ID = 'aircraft-positions';
const AIRCRAFT_TRAILS_SOURCE_ID = 'aircraft-trails';
const AIRCRAFT_TRAILS_GLOW_LAYER_ID = 'aircraft-trails-glow';
const AIRCRAFT_TRAILS_LAYER_ID = 'aircraft-trails';
const AIRCRAFT_LAYER_ID = 'aircraft-points';
const SELECTED_AIRCRAFT_LAYER_ID = 'selected-aircraft-point';
const AIRCRAFT_ICON_ID = 'aircraft-icon';
const AIRCRAFT_SELECTED_ICON_ID = 'aircraft-selected-icon';

function trailToken(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(`--trail-${name}`).trim();
}

const EMPTY_AIRCRAFT_COLLECTION: AircraftPositionFeatureCollection = {
  type: 'FeatureCollection',
  features: [],
};
const EMPTY_TRAIL_COLLECTION: AircraftTrailFeatureCollection = {
  type: 'FeatureCollection',
  features: [],
};

function trailGradient(): import('maplibre-gl').ExpressionSpecification {
  const [r, g, b] = hexToRgb(trailToken('color'));
  return [
    'interpolate',
    ['linear'],
    ['line-progress'],
    0,
    trailToken('transparent'),
    0.2,
    ['rgba', r, g, b, 0.15],
    0.6,
    ['rgba', r, g, b, 0.5],
    1,
    trailToken('color'),
  ] as import('maplibre-gl').ExpressionSpecification;
}

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace('#', '');
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

export function ensureAircraftLayers(
  map: Map,
  onSelectAircraft: (id: string) => void,
): void {
  ensureAircraftIcons(map);

  if (!map.getSource(AIRCRAFT_SOURCE_ID)) {
    map.addSource(AIRCRAFT_SOURCE_ID, {
      type: 'geojson',
      data: EMPTY_AIRCRAFT_COLLECTION,
    });
  }

  if (!map.getSource(AIRCRAFT_TRAILS_SOURCE_ID)) {
    map.addSource(AIRCRAFT_TRAILS_SOURCE_ID, {
      type: 'geojson',
      lineMetrics: true,
      data: EMPTY_TRAIL_COLLECTION,
    });
  }

  if (!map.getLayer(AIRCRAFT_TRAILS_GLOW_LAYER_ID)) {
    map.addLayer({
      id: AIRCRAFT_TRAILS_GLOW_LAYER_ID,
      type: 'line',
      source: AIRCRAFT_TRAILS_SOURCE_ID,
      paint: {
        'line-blur': 5,
        'line-color': trailToken('color'),
        'line-opacity': 0.18,
        'line-width': 8,
      },
    });
  }

  if (!map.getLayer(AIRCRAFT_TRAILS_LAYER_ID)) {
    map.addLayer({
      id: AIRCRAFT_TRAILS_LAYER_ID,
      type: 'line',
      source: AIRCRAFT_TRAILS_SOURCE_ID,
      layout: {
        'line-cap': 'round',
      },
      paint: {
        'line-gradient': trailGradient(),
        'line-width': 2.5,
      },
    });
  }

  if (!map.getLayer(AIRCRAFT_LAYER_ID)) {
    map.addLayer({
      id: AIRCRAFT_LAYER_ID,
      type: 'symbol',
      source: AIRCRAFT_SOURCE_ID,
      layout: {
        'icon-allow-overlap': true,
        'icon-image': AIRCRAFT_ICON_ID,
        'icon-ignore-placement': true,
        'icon-rotate': ['coalesce', ['get', 'headingDegrees'], 0],
        'icon-rotation-alignment': 'map',
        'icon-size': 0.8,
      },
    });
  }

  if (!map.getLayer(SELECTED_AIRCRAFT_LAYER_ID)) {
    map.addLayer({
      id: SELECTED_AIRCRAFT_LAYER_ID,
      type: 'symbol',
      source: AIRCRAFT_SOURCE_ID,
      filter: ['==', ['id'], ''],
      layout: {
        'icon-allow-overlap': true,
        'icon-image': AIRCRAFT_SELECTED_ICON_ID,
        'icon-ignore-placement': true,
        'icon-rotate': ['coalesce', ['get', 'headingDegrees'], 0],
        'icon-rotation-alignment': 'map',
        'icon-size': 1,
      },
    });
  }

  map.on('click', AIRCRAFT_LAYER_ID, (event: MapLayerMouseEvent) => {
    event.preventDefault();
    const feature = event.features?.[0];
    const id = feature?.id;

    if (typeof id === 'string') {
      onSelectAircraft(id);
    }
  });

  map.on('mouseenter', AIRCRAFT_LAYER_ID, () => {
    map.getCanvas().style.cursor = 'pointer';
  });

  map.on('mouseleave', AIRCRAFT_LAYER_ID, () => {
    map.getCanvas().style.cursor = '';
  });
}

function ensureAircraftIcons(map: Map): void {
  if (!map.hasImage(AIRCRAFT_ICON_ID)) {
    map.addImage(AIRCRAFT_ICON_ID, createAircraftIcon('#dc2626', '#ffffff'));
  }

  if (!map.hasImage(AIRCRAFT_SELECTED_ICON_ID)) {
    map.addImage(
      AIRCRAFT_SELECTED_ICON_ID,
      createAircraftIcon('#facc15', '#17202a'),
    );
  }
}

function createAircraftIcon(fillColor: string, strokeColor: string): ImageData {
  const size = 48;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  canvas.width = size;
  canvas.height = size;

  if (!context) {
    throw new Error('Could not create aircraft icon canvas context.');
  }

  context.translate(size / 2, size / 2);
  context.beginPath();
  context.moveTo(0, -20);
  context.lineTo(7, 3);
  context.lineTo(20, 9);
  context.lineTo(20, 15);
  context.lineTo(4, 11);
  context.lineTo(3, 20);
  context.lineTo(9, 24);
  context.lineTo(-9, 24);
  context.lineTo(-3, 20);
  context.lineTo(-4, 11);
  context.lineTo(-20, 15);
  context.lineTo(-20, 9);
  context.lineTo(-7, 3);
  context.closePath();

  context.fillStyle = fillColor;
  context.strokeStyle = strokeColor;
  context.lineWidth = 3;
  context.lineJoin = 'round';
  context.fill();
  context.stroke();

  return context.getImageData(0, 0, size, size);
}

export function updateAircraftTrailsSource(
  map: Map,
  aircraftTrails: AircraftTrailFeatureCollection,
): void {
  const source = map.getSource(AIRCRAFT_TRAILS_SOURCE_ID);

  if (source?.type !== 'geojson') {
    return;
  }

  (source as GeoJSONSource).setData(aircraftTrails);
}

export function updateAircraftSource(
  map: Map,
  aircraftData: AircraftPositionFeatureCollection,
): void {
  const source = map.getSource(AIRCRAFT_SOURCE_ID);

  if (source?.type !== 'geojson') {
    return;
  }

  (source as GeoJSONSource).setData(aircraftData);
}

export function updateSelectedAircraftLayer(
  map: Map,
  selectedAircraftId: string | null,
): void {
  if (!map.getLayer(SELECTED_AIRCRAFT_LAYER_ID)) {
    return;
  }

  map.setFilter(SELECTED_AIRCRAFT_LAYER_ID, [
    '==',
    ['id'],
    selectedAircraftId ?? '',
  ]);
}
