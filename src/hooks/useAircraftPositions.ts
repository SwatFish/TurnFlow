import { useEffect, useState } from 'react';
import {
  AircraftPositionFeatureCollection,
  fetchAircraftPositions,
} from '../api/aircraft';
import {
  AircraftTrailPointMap,
  AircraftTrailFeatureCollection,
  appendAircraftTrailPoints,
  toAircraftTrailFeatureCollection,
} from './aircraftTrails';

const AIRCRAFT_POLL_INTERVAL_MS = 10_000;
const EMPTY_TRAIL_COLLECTION: AircraftTrailFeatureCollection = {
  type: 'FeatureCollection',
  features: [],
};
const EMPTY_TRAIL_POINTS: AircraftTrailPointMap = {};

export type UseAircraftPositionsResult = {
  aircraftCount: number | null;
  aircraftData: AircraftPositionFeatureCollection | null;
  aircraftTrails: AircraftTrailFeatureCollection;
  errorMessage: string | null;
  isLoading: boolean;
  lastUpdatedAt: string | null;
};

export function useAircraftPositions(): UseAircraftPositionsResult {
  const [aircraftCount, setAircraftCount] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [aircraftData, setAircraftData] =
    useState<AircraftPositionFeatureCollection | null>(null);
  const [aircraftTrailPoints, setAircraftTrailPoints] =
    useState<AircraftTrailPointMap>(EMPTY_TRAIL_POINTS);
  const [aircraftTrails, setAircraftTrails] =
    useState<AircraftTrailFeatureCollection>(EMPTY_TRAIL_COLLECTION);

  useEffect(() => {
    let isMounted = true;

    async function loadAircraftPositions() {
      try {
        const featureCollection = await fetchAircraftPositions();
        if (!isMounted) {
          return;
        }

        setAircraftCount(featureCollection.features.length);
        setAircraftData(featureCollection);
        setAircraftTrailPoints((previousTrailPoints) => {
          const nextTrailPoints = appendAircraftTrailPoints(
            previousTrailPoints,
            featureCollection,
          );
          const nextTrails = toAircraftTrailFeatureCollection(nextTrailPoints);

          setAircraftTrails(nextTrails);

          return nextTrailPoints;
        });
        setErrorMessage(null);
        setIsLoading(false);
        setLastUpdatedAt(new Date().toISOString());
      } catch {
        if (!isMounted) {
          return;
        }

        setIsLoading(false);
        setErrorMessage('Could not load aircraft positions.');
      }
    }

    void loadAircraftPositions();
    const intervalId = window.setInterval(
      loadAircraftPositions,
      AIRCRAFT_POLL_INTERVAL_MS,
    );

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return {
    aircraftCount,
    aircraftData,
    aircraftTrails,
    errorMessage,
    isLoading,
    lastUpdatedAt,
  };
}
