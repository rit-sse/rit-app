import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import { Asset } from "expo-asset";
import { File, Directory, Paths } from 'expo-file-system';
import { LatLng, LeafletView } from 'react-native-leaflet-view';

const DEFAULT_LOCATION = {
  latitude: 43.083,
  longitude: -77.676
}
const Map: React.FC = () => {
  const [webViewContent, setWebViewContent] = useState<string | null>(null);
  useEffect(() => {
    let isMounted = true;

    const loadHtml = async () => {
      try {
        const path = require("../../assets/leaflet.html");
        const asset = Asset.fromModule(path);
        await asset.downloadAsync();
        const htmlContent = await (new File(asset.localUri!)).text();//await File.readAsStringAsync(asset.localUri!);

        if (isMounted) {
          setWebViewContent(htmlContent);
        }
      } catch (error) {
        Alert.alert('Error loading HTML', JSON.stringify(error));
        console.error('Error loading HTML:', error);
      }
    };

    loadHtml();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!webViewContent) {
    return <ActivityIndicator size="large" />
  }
  return (
    <LeafletView
      source={{ html: webViewContent }}
      mapCenterPosition={{
        lat: DEFAULT_LOCATION.latitude,
        lng: DEFAULT_LOCATION.longitude,
      }}
    />
  );
}

export default Map;