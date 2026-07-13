import { useRef, useState } from "react";
import { Button, Dimensions, Text, Vibration, View } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";

export default function ScanProductWithCamera() {
  const [permission, requestPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState("");

  const lastScannedTime = useRef(0);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View>
        <Text>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  return (
    <View className="flex flex-1 items-center bg-black">
      <CameraView
        autofocus="on"
        barcodeScannerSettings={{ barcodeTypes: ["ean13"] }}
        facing="back"
        style={{
          width: Dimensions.get("screen").width * 0.5,
          height: Dimensions.get("screen").height * 0.1,
          marginTop: Dimensions.get("screen").height * 0.1,
        }}
        onBarcodeScanned={(barcode) => {
          const now = Date.now();

          // Ignore scans that happen too close together (e.g., within 2 seconds of the last one)
          if (scanned || now - lastScannedTime.current < 2000) {
            return;
          }

          lastScannedTime.current = now;
          setScanned(true);
          setScannedData(barcode.data);
          Vibration.vibrate(100);

          console.log(
            `Bar code with type ${barcode.type} and data ${barcode.data} has been scanned!`,
          );
          // TODO: Trigger your API call, navigate, or show a modal here
          console.log(barcode.data);
        }}
      />
    </View>
  );
}
