import React, { useRef, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { Camera, CameraType, BarCodeScanningResult } from 'expo-camera';

export default function ScanScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const cameraRef = useRef<Camera>(null);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = (result: BarCodeScanningResult) => {
    setScanned(true);
    // handle scanned result
    alert(`Code: ${result.data}`);
  };

  if (hasPermission === null) {
    return <Text>Demande de permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text>Pas d'accès à la caméra</Text>;
  }

  return (
    <View className="flex-1">
      <Camera
        ref={cameraRef}
        style={{ flex: 1 }}
        type={CameraType.back}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        barCodeScannerSettings={{ barCodeTypes: ['qr', 'ean13', 'code128'] }}
      />
      {scanned && <Button title="Scanner à nouveau" onPress={() => setScanned(false)} />}
    </View>
  );
}
