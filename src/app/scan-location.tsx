import { Text, View } from "react-native";

export default function ScanLocation() {
  return (
    <View className="flex flex-1 justify-center align-middle p-4">
      <Text className="font-bold text-2xl">Scan Location Screen</Text>
      <Text className="text-base text-gray-600 mt-3">
        This is a simple scan location page boilerplate.
      </Text>
    </View>
  );
}
