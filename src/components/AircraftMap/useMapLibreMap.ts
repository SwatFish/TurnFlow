import { RefObject, useEffect, useRef, useState } from 'react';
import { Map, StyleSpecification } from 'maplibre-gl';

export type MapStatus = 'loading' | 'ready' | 'error';

export type UseMapLibreMapOptions = {
  center: [longitude: number, latitude: number];
  onMapLoad?: (map: Map) => void;
  style: string | StyleSpecification;
  zoom: number;
};

export type UseMapLibreMapResult = {
  mapContainerRef: RefObject<HTMLDivElement | null>;
  mapRef: RefObject<Map | null>;
  mapStatus: MapStatus;
};

export function useMapLibreMap({
  center,
  onMapLoad,
  style,
  zoom,
}: UseMapLibreMapOptions): UseMapLibreMapResult {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const [mapStatus, setMapStatus] = useState<MapStatus>('loading');

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    const map = new Map({
      container: mapContainerRef.current,
      center,
      zoom,
      style,
    });

    mapRef.current = map;

    const resizeMap = () => {
      map.resize();
    };

    const handleMapLoad = () => {
      resizeMap();
      onMapLoad?.(map);
      setMapStatus('ready');
    };

    const handleMapError = () => {
      setMapStatus('error');
    };

    requestAnimationFrame(resizeMap);
    map.once('load', handleMapLoad);
    map.on('error', handleMapError);
    window.addEventListener('resize', resizeMap);

    return () => {
      window.removeEventListener('resize', resizeMap);
      map.off('error', handleMapError);
      map.remove();
      mapRef.current = null;
    };
  }, [center, onMapLoad, style, zoom]);

  return {
    mapContainerRef,
    mapRef,
    mapStatus,
  };
}
