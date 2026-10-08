import { Map } from 'maplibre-gl';
import { AircraftPositionFeature } from '../../api/aircraft';

export type FocusMapOnSelectedAircraftOptions = {
  features: AircraftPositionFeature[];
  map: Map;
  selectedAircraftId: string | null;
};

export function focusMapOnSelectedAircraft({
  features,
  map,
  selectedAircraftId,
}: FocusMapOnSelectedAircraftOptions): void {
  if (!selectedAircraftId) {
    return;
  }

  const selectedFeature = features.find(
    (feature) => feature.id === selectedAircraftId,
  );

  if (!selectedFeature) {
    return;
  }

  map.easeTo({
    center: selectedFeature.geometry.coordinates,
    duration: 500,
    zoom: 10,
  });
}
