import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { supabase } from '../../lib/supabase';

export interface NativeMapViewerProps {
    latitude?: number;
    longitude?: number;
    gigId?: string;
}

export default function NativeMapViewer({ latitude: initialLat, longitude: initialLng, gigId }: NativeMapViewerProps) {
    const [lat, setLat] = useState(initialLat || 37.7749);
    const [lng, setLng] = useState(initialLng || -122.4194);

    useEffect(() => {
        if (!gigId) return;

        const fetchCoords = async () => {
            const { data, error } = await supabase
                .from('gigs')
                .select('current_lat, current_lng')
                .eq('id', gigId)
                .single();

            if (data?.current_lat && data?.current_lng) {
                setLat(data.current_lat);
                setLng(data.current_lng);
            }
        };

        fetchCoords();

        const channel = supabase
            .channel(`gig-location-native-${gigId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'gigs',
                    filter: `id=eq.${gigId}`,
                },
                (payload: any) => {
                    if (payload.new.current_lat && payload.new.current_lng) {
                        setLat(payload.new.current_lat);
                        setLng(payload.new.current_lng);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [gigId]);

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                region={{
                    latitude: lat,
                    longitude: lng,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
                mapType="none" // Bypass default Apple/Google Maps tiles
            >
                {/* 
                  CRITICAL: Using OpenStreetMap free tiles completely bypasses vendor billing
                  maximumZ={19} prevents blank tiles at high zoom levels where OSM has no data
                */}
                <UrlTile
                    urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maximumZ={19}
                    flipY={false}
                />

                <Marker
                    coordinate={{ latitude: lat, longitude: lng }}
                    title="Gig Location"
                />
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 300,
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
    },
    map: {
        flex: 1,
    }
});
