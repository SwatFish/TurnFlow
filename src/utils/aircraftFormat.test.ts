import { describe, expect, it } from 'vitest';
import {
  formatCoordinate,
  formatHeading,
  formatMeters,
  formatSpeed,
  formatTimestamp,
} from './aircraftFormat';

describe('aircraftFormat', () => {
  it('formats known aircraft values', () => {
    expect(formatCoordinate(4.4844123)).toBe('4.4844');
    expect(formatHeading(250)).toBe('250 deg');
    expect(formatMeters(1200)).toBe('1200 m');
    expect(formatSpeed(95)).toBe('95 m/s');
  });

  it('formats missing aircraft values as unknown', () => {
    expect(formatHeading(null)).toBe('Unknown');
    expect(formatMeters(null)).toBe('Unknown');
    expect(formatSpeed(null)).toBe('Unknown');
    expect(formatTimestamp(null)).toBe('Unknown');
  });
});
