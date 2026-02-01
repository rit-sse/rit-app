import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import { Asset } from "expo-asset";
import { File, Directory, Paths } from 'expo-file-system';
import { LatLng, LeafletView, WebviewLeafletMessage } from 'react-native-leaflet-view';

//MAJOR NOTES:
//this was setup using:
//    https://www.npmjs.com/package/react-native-leaflet-view
//    https://docs.expo.dev/versions/latest/sdk/filesystem/#file

//everything from the first link was used as-is, except changing
// the line with `const htmlContent = await...` to use expo-file-system's
// new file usage, as described in the second link


const DEFAULT_LOCATION = {
  latitude: 43.083,
  longitude: -77.676
}
function Map({onMapMessage=(message:WebviewLeafletMessage)=>{}}) {
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
      onMessageReceived={onMapMessage}
      doDebug={false}
    />
  );
}

export default Map;