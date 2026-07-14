import { useRef, useState } from "react";
import { Button, Dimensions, Text, Vibration, View } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useTheme } from "@/hooks/use-theme";

export default function ScanProductWithCamera() {
  const [permission, requestPermission] = useCameraPermissions();
  const { colors } = useTheme();

  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState("");

  const lastScannedTime = useRef(0);

  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  if (!permission.granted) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
          padding: 24,
        }}
      >
        <Text
          style={{ color: colors.text, textAlign: "center", marginBottom: 16 }}
        >
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
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
