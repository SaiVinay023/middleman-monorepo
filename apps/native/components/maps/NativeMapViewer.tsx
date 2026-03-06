import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface NativeMapViewerProps {
    latitude?: number;
    longitude?: number;
    gigId?: string;
}

export default function NativeMapViewer({ latitude, longitude, gigId }: NativeMapViewerProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Live Tracking (Native iOS/Android Only)</Text>
            <Text style={styles.subtext}>Open on mobile app to view Leaflet Map</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 300,
        width: '100%',
        borderRadius: 16,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        overflow: 'hidden',
    },
    text: {
        color: '#6b7280',
        fontWeight: 'bold',
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    subtext: {
        color: '#9ca3af',
        fontSize: 11,
        marginTop: 4,
    }
});
