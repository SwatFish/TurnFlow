import { GeoJSONSource, Map } from 'maplibre-gl';

const SELECTED_LOCATION_SOURCE_ID = 'selected-location';
const SELECTED_LOCATION_RING_LAYER_ID = 'selected-location-ring';
const SELECTED_LOCATION_DOT_LAYER_ID = 'selected-location-dot';

export type SelectedMapLocation = {
  latitude: number;
  longitude: number;
  label: string;
};

const EMPTY_SELECTED_LOCATION_COLLECTION = {
  type: 'FeatureCollection' as const,
  features: [],
};

export function ensureSelectedLocationLayer(map: Map): void {
  if (!map.getSource(SELECTED_LOCATION_SOURCE_ID)) {
    map.addSource(SELECTED_LOCATION_SOURCE_ID, {
      type: 'geojson',
      data: EMPTY_SELECTED_LOCATION_COLLECTION,
    });
  }

  if (!map.getLayer(SELECTED_LOCATION_RING_LAYER_ID)) {
    map.addLayer({
      id: SELECTED_LOCATION_RING_LAYER_ID,
      type: 'circle',
      source: SELECTED_LOCATION_SOURCE_ID,
      paint: {
        'circle-color': '#38bdf8',
        'circle-opacity': 0.16,
        'circle-radius': 16,
        'circle-stroke-color': '#d8eef8',
        'circle-stroke-opacity': 0.75,
        'circle-stroke-width': 2,
      },
    });
  }

  if (!map.getLayer(SELECTED_LOCATION_DOT_LAYER_ID)) {
    map.addLayer({
      id: SELECTED_LOCATION_DOT_LAYER_ID,
      type: 'circle',
      source: SELECTED_LOCATION_SOURCE_ID,
      paint: {
        'circle-color': '#f2f7fa',
        'circle-radius': 4,
        'circle-stroke-color': '#0d1b27',
        'circle-stroke-width': 2,
      },
    });
  }
}

export function updateSelectedLocationSource(
  map: Map,
  selectedLocation: SelectedMapLocation,
): void {
  const source = map.getSource(SELECTED_LOCATION_SOURCE_ID);

  if (source?.type !== 'geojson') {
    return;
  }

  (source as GeoJSONSource).setData({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [selectedLocation.longitude, selectedLocation.latitude],
        },
        properties: {
          label: selectedLocation.label,
        },
      },
    ],
  });
}
