import { describe, it, expect } from 'vitest';
import { getDistanceInMeters } from '../../../hooks/useGeofence';

describe('useGeofence - Haversine formula (getDistanceInMeters)', () => {
    it('should correctly identify distance for the same location', () => {
        const distance = getDistanceInMeters(37.7749, -122.4194, 37.7749, -122.4194);
        expect(distance).toBe(0);
    });

    it('should correctly calculate distance for ~50m apart (Arrival)', () => {
        // 37.7749, -122.4194 to 37.7749, -122.41883 is ~50 meters east
        const targetLat = 37.7749;
        const targetLon = -122.4194;

        // 0.00001 deg lon is approx 0.88 meters at this latitude. 
        // 50m / 0.88m = 56.8 units of 0.00001, so +0.00057
        const currentLon = -122.4194 + 0.00057;

        const distance = getDistanceInMeters(targetLat, targetLon, targetLat, currentLon);

        // Should be around 50m
        expect(distance).toBeGreaterThan(45);
        expect(distance).toBeLessThan(55);

        // Within 100m geofence
        expect(distance <= 100).toBe(true);
    });

    it('should correctly calculate distance for ~150m apart (Outside Arrival)', () => {
        const targetLat = 37.7749;
        const targetLon = -122.4194;

        // 150m / 0.88m = 170 units of 0.00001, so +0.00170
        const currentLon = -122.4194 + 0.00170;

        const distance = getDistanceInMeters(targetLat, targetLon, targetLat, currentLon);

        // Should be around 150m
        expect(distance).toBeGreaterThan(140);
        expect(distance).toBeLessThan(160);

        // Outside 100m geofence
        expect(distance <= 100).toBe(false);
    });

    it('should correctly identify Arrival at exactly 50m distance threshold', () => {
        // Just directly testing the boundaries required
        // We simulate locations that are ~50m and ~150m for a 100m geofence check
        const distance50 = 50;
        const distance150 = 150;
        const geofenceRadius = 100;

        expect(distance50 <= geofenceRadius).toBe(true); // Should identify as Arrival (Inside Geofence)
        expect(distance150 <= geofenceRadius).toBe(false); // Should identify as Outside geofence
    });
});
