import { useCallback, useEffect, useState } from 'react';
import { Map, MapMouseEvent } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { AircraftPositionFeatureCollection } from '../../api/aircraft';
import { AirportRunwayResponse } from '../../api/airports';
import { AircraftTrailFeatureCollection } from '../../hooks/aircraftTrails';
import {
  ensureAircraftLayers,
  updateAircraftSource,
  updateAircraftTrailsSource,
  updateSelectedAircraftLayer,
} from './aircraftLayers';
import { focusMapOnSelectedAircraft } from './mapFocus';
import { configureMapLibreWorker } from './mapLibreWorker';
import { OPENFREEMAP_STYLE_URL } from './mapStyle';
import {
  ensureSelectedLocationLayer,
  SelectedMapLocation,
  updateSelectedLocationSource,
} from './selectedLocationLayer';
import { ensureRunwayLayers, updateRunwaySource, startRunwaySweep, RUNWAY_HIT_LAYER_ID } from './runwayLayers';
import { RunwayOverlay } from './RunwayOverlay';
import { useMapLibreMap } from './useMapLibreMap';
import './AircraftMap.css';

configureMapLibreWorker();

const EBBR_CENTER: [longitude: number, latitude: number] = [4.4844, 50.9014];

export type AircraftMapProps = {
  aircraftData: AircraftPositionFeatureCollection | null;
  aircraftTrails: AircraftTrailFeatureCollection;
  airportRunways: AirportRunwayResponse[] | null;
  selectedLocation: SelectedMapLocation;
  selectedAircraftId: string | null;
  onSelectAircraft: (id: string) => void;
  onSelectLocation: (location: SelectedMapLocation) => void;
};

export const AircraftMap = ({
  aircraftData,
  aircraftTrails,
  airportRunways,
  selectedLocation,
  selectedAircraftId,
  onSelectAircraft,
  onSelectLocation,
}: AircraftMapProps) => {
  const [selectedRunwayId, setSelectedRunwayId] = useState<string | null>(null);
  const selectedRunway = airportRunways?.find((runway) => runway.sourceRunwayId === selectedRunwayId);
  const closeRunway = useCallback(() => setSelectedRunwayId(null), []);
  const handleMapLoad = useCallback(
    (map: Map) => {
      ensureAircraftLayers(map, onSelectAircraft);
      ensureRunwayLayers(map);
      ensureSelectedLocationLayer(map);
    },
    [onSelectAircraft],
  );

  const { mapContainerRef, mapRef, mapStatus } = useMapLibreMap({
    center: EBBR_CENTER,
    onMapLoad: handleMapLoad,
    style: OPENFREEMAP_STYLE_URL,
    zoom: 9,
  });

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    const handleMapClick = (event: MapMouseEvent) => {
      if (event.defaultPrevented) {
        return;
      }

      const hits = map.getLayer(RUNWAY_HIT_LAYER_ID)
        ? map.queryRenderedFeatures(event.point, { layers: [RUNWAY_HIT_LAYER_ID] })
        : [];
      const runwayId = hits[0]?.id;
      if (runwayId != null) {
        setSelectedRunwayId(String(runwayId));
        return;
      }
      setSelectedRunwayId(null);
      onSelectLocation({
        latitude: event.lngLat.lat,
        longitude: event.lngLat.lng,
        label: 'Selected map point',
      });
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [mapStatus, onSelectLocation]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || mapStatus !== 'ready') return;
    const showPointer = () => { map.getCanvas().style.cursor = 'pointer'; };
    const hidePointer = () => { map.getCanvas().style.cursor = ''; };
    map.on('mouseenter', RUNWAY_HIT_LAYER_ID, showPointer);
    map.on('mouseleave', RUNWAY_HIT_LAYER_ID, hidePointer);
    const stopSweep = startRunwaySweep(map);
    return () => {
      stopSweep();
      map.off('mouseenter', RUNWAY_HIT_LAYER_ID, showPointer);
      map.off('mouseleave', RUNWAY_HIT_LAYER_ID, hidePointer);
    };
  }, [mapStatus]);

  useEffect(() => { setSelectedRunwayId(null); }, [selectedLocation]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    updateSelectedLocationSource(map, selectedLocation);
  }, [mapStatus, selectedLocation]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    updateRunwaySource(map, airportRunways);
  }, [airportRunways, mapStatus]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !aircraftData) {
      return;
    }

    updateAircraftSource(map, aircraftData);
  }, [aircraftData, mapStatus]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    updateAircraftTrailsSource(map, aircraftTrails);
  }, [aircraftTrails, mapStatus]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    updateSelectedAircraftLayer(map, selectedAircraftId);
  }, [selectedAircraftId, mapStatus]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !aircraftData || !selectedAircraftId) {
      return;
    }

    focusMapOnSelectedAircraft({
      features: aircraftData.features,
      map,
      selectedAircraftId,
    });
  }, [aircraftData, selectedAircraftId, mapStatus]);

  return (
    <div className="aircraft-map-shell">
      <div className="aircraft-map" ref={mapContainerRef} />
      {selectedRunway && <RunwayOverlay runway={selectedRunway} onClose={closeRunway} />}
      {mapStatus !== 'ready' && (
        <div
          className={`aircraft-map-status ${mapStatus === 'error' ? 'aircraft-map-status-error' : ''}`}
          role="status"
        >
          {mapStatus === 'loading' ? 'Loading map…' : 'Map could not load.'}
        </div>
      )}
    </div>
  );
};
