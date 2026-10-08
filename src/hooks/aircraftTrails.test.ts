import { describe, expect, it } from 'vitest';
import { AircraftPositionFeatureCollection } from '../api/aircraft';
import {
  AircraftTrailPointMap,
  appendAircraftTrailPoints,
  toAircraftTrailFeatureCollection,
} from './aircraftTrails';

function aircraftCollection(
  coordinates: [longitude: number, latitude: number],
): AircraftPositionFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        id: 'abc123',
        geometry: {
          type: 'Point',
          coordinates,
        },
        properties: {
          icao24: 'abc123',
          callsign: 'TEST123',
          altitudeMeters: null,
          groundSpeedMetersPerSecond: null,
          headingDegrees: null,
          lastContactAt: null,
          isStale: false,
          source: 'simulated',
        },
      },
    ],
  };
}

describe('aircraftTrails', () => {
  it('stores the first point without emitting a LineString trail yet', () => {
    const trailPoints = appendAircraftTrailPoints(
      {},
      aircraftCollection([4.1, 50.1]),
    );
    const trailCollection = toAircraftTrailFeatureCollection(trailPoints);

    expect(trailPoints.abc123).toEqual([[4.1, 50.1]]);
    expect(trailCollection.features).toEqual([]);
  });

  it('emits a LineString trail after a second distinct point', () => {
    const firstTrailPoints = appendAircraftTrailPoints(
      {},
      aircraftCollection([4.1, 50.1]),
    );
    const secondTrailPoints = appendAircraftTrailPoints(
      firstTrailPoints,
      aircraftCollection([4.2, 50.2]),
    );
    const trailCollection = toAircraftTrailFeatureCollection(secondTrailPoints);

    expect(trailCollection.features).toHaveLength(1);
    expect(trailCollection.features[0].geometry).toEqual({
      type: 'LineString',
      coordinates: [
        [4.1, 50.1],
        [4.2, 50.2],
      ],
    });
  });

  it('does not append the same coordinate twice in a row', () => {
    const firstTrailPoints = appendAircraftTrailPoints(
      {},
      aircraftCollection([4.1, 50.1]),
    );
    const secondTrailPoints = appendAircraftTrailPoints(
      firstTrailPoints,
      aircraftCollection([4.1, 50.1]),
    );

    expect(secondTrailPoints.abc123).toEqual([[4.1, 50.1]]);
  });

  it('keeps only the most recent 20 points per aircraft', () => {
    const trailPoints = Array.from({ length: 25 }).reduce<AircraftTrailPointMap>(
      (currentTrailPoints, _, index) =>
        appendAircraftTrailPoints(
          currentTrailPoints,
          aircraftCollection([4 + index / 10, 50 + index / 10]),
        ),
      {},
    );

    expect(trailPoints.abc123).toHaveLength(20);
    expect(trailPoints.abc123[0]).toEqual([4.5, 50.5]);
    expect(trailPoints.abc123.at(-1)).toEqual([6.4, 52.4]);
  });
});
