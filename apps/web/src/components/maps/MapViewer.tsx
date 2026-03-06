'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase } from '@/lib/supabase';
import { GigService } from '@/services/gigService';

// Required hack to fix Leaflet's default icon paths in Next.js/Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface MapViewerProps {
    latitude?: number;
    longitude?: number;
    gigId?: string;
}

function MapViewportSync({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap();

    useEffect(() => {
        map.setView([lat, lng], map.getZoom(), { animate: true });
    }, [lat, lng, map]);

    return null;
}

export const MapViewer = ({ latitude: initialLat, longitude: initialLng, gigId }: MapViewerProps) => {
    const fallbackLat = initialLat ?? 37.7749;
    const fallbackLng = initialLng ?? -122.4194;

    const [lat, setLat] = useState(fallbackLat);
    const [lng, setLng] = useState(fallbackLng);
    const center = useMemo(() => [lat, lng] as [number, number], [lat, lng]);

    useEffect(() => {
        setLat(fallbackLat);
        setLng(fallbackLng);
    }, [fallbackLat, fallbackLng]);

    useEffect(() => {
        if (!gigId) return;

        const fetchCoords = async () => {
            try {
                const data = await GigService.getGigCoordinates(gigId);
                if (data?.current_lat && data?.current_lng) {
                    setLat((prev) => (data.current_lat !== prev ? data.current_lat : prev));
                    setLng((prev) => (data.current_lng !== prev ? data.current_lng : prev));
                }
            } catch {
                // Keep map usable with the last known coordinates.
            }
        };

        fetchCoords();

        const channel = supabase
            .channel(`gig-location-${gigId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'gigs',
                    filter: `id=eq.${gigId}`,
                },
                (payload) => {
                    const newLat = payload.new.current_lat;
                    const newLng = payload.new.current_lng;
                    if (newLat && newLng) {
                        setLat((prev) => (newLat !== prev ? newLat : prev));
                        setLng((prev) => (newLng !== prev ? newLng : prev));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [gigId]);

    return (
        <MapContainer
            center={center}
            zoom={14}
            style={{ height: '300px', width: '100%', borderRadius: '1rem', zIndex: 0 }}
            zoomControl={false}
            preferCanvas
        >
            <MapViewportSync lat={lat} lng={lng} />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
            />
            <Marker position={[lat, lng]}>
                <Popup>Job Site</Popup>
            </Marker>
        </MapContainer>
    );
};

export default MapViewer;
