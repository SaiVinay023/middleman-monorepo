import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

// Pure JavaScript math function to measure spherical distance across earth's surface
export function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // Earth radius in meters
    const toRadians = (deg: number) => deg * (Math.PI / 180);

    const phi1 = toRadians(lat1);
    const phi2 = toRadians(lat2);
    const deltaPhi = toRadians(lat2 - lat1);
    const deltaLambda = toRadians(lon2 - lon1);

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) *
        Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * useGeofence
 * 
 * Tracks the current user's location via Expo, constantly calculating distance 
 * to a target coordinate. Triggers isAtJobSite when within the radius.
 * 
 * @param targetLat Latitude of the job site.
 * @param targetLon Longitude of the job site.
 * @param radiusMeters Size of the geofence perimeter. Defaults to 100m.
 */
export function useGeofence(targetLat: number, targetLon: number, radiusMeters = 100) {
    const [isAtJobSite, setIsAtJobSite] = useState(false);
    const [currentDistance, setCurrentDistance] = useState<number | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        let subscription: Location.LocationSubscription | null = null;

        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            // Begin tracking position
            subscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 10000,
                    distanceInterval: 10,
                },
                (location: Location.LocationObject) => {
                    const { latitude, longitude } = location.coords;
                    const dist = getDistanceInMeters(latitude, longitude, targetLat, targetLon);

                    setCurrentDistance(dist);
                    setIsAtJobSite(dist <= radiusMeters);
                }
            );
        })();

        return () => {
            if (subscription) {
                subscription.remove();
            }
        };
    }, [targetLat, targetLon, radiusMeters]);

    return { isAtJobSite, currentDistance, errorMsg };
}
