import {
  AircraftPositionFeature,
  AircraftPositionFeatureCollection,
} from '../api/aircraft';

const MAX_TRAIL_POINTS_PER_AIRCRAFT = 20;

export interface AircraftTrailFeatureCollection {
  readonly type: 'FeatureCollection';
  readonly features: AircraftTrailFeature[];
}

export interface AircraftTrailFeature {
  readonly type: 'Feature';
  readonly id: string;
  readonly geometry: AircraftTrailGeometry;
  readonly properties: AircraftTrailProperties;
}

export interface AircraftTrailGeometry {
  readonly type: 'LineString';
  readonly coordinates: [longitude: number, latitude: number][];
}

export interface AircraftTrailProperties {
  readonly icao24: string;
}

export type AircraftTrailPointMap = Record<
  string,
  [longitude: number, latitude: number][]
>;

export function appendAircraftTrailPoints(
  previousTrailPoints: AircraftTrailPointMap,
  aircraftData: AircraftPositionFeatureCollection,
): AircraftTrailPointMap {
  const nextTrailPoints: AircraftTrailPointMap = { ...previousTrailPoints };

  aircraftData.features.forEach((feature) => {
    const existingPoints = nextTrailPoints[feature.id] ?? [];
    const nextPoints = appendDistinctPoint(existingPoints, feature);

    nextTrailPoints[feature.id] = nextPoints.slice(
      -MAX_TRAIL_POINTS_PER_AIRCRAFT,
    );
  });

  return nextTrailPoints;
}

export function toAircraftTrailFeatureCollection(
  trailPoints: AircraftTrailPointMap,
): AircraftTrailFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: Object.entries(trailPoints)
      .filter(([, coordinates]) => coordinates.length > 1)
      .map(([icao24, coordinates]) => ({
        type: 'Feature',
        id: icao24,
        geometry: {
          type: 'LineString',
          coordinates,
        },
        properties: {
          icao24,
        },
      })),
  };
}

function appendDistinctPoint(
  existingPoints: [longitude: number, latitude: number][],
  feature: AircraftPositionFeature,
): [longitude: number, latitude: number][] {
  const lastPoint = existingPoints.at(-1);
  const nextPoint = feature.geometry.coordinates;

  if (
    lastPoint &&
    lastPoint[0] === nextPoint[0] &&
    lastPoint[1] === nextPoint[1]
  ) {
    return existingPoints;
  }

  return [...existingPoints, nextPoint];
}
