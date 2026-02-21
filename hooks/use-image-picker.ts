import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";

export type ImagePickerLoading = "gallery" | "camera" | null;

export function useImagePicker() {
  const [loading, setLoading] = useState<ImagePickerLoading>(null);

  const pickFromGallery = useCallback(
    async (onImage: (uri: string) => void) => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") return;
      setLoading("gallery");
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: false,
          quality: 0.85,
        });
        if (!result.canceled && result.assets[0]) {
          onImage(result.assets[0].uri);
        }
      } finally {
        setLoading(null);
      }
    },
    []
  );

  const takePhoto = useCallback(
    async (onImage: (uri: string) => void) => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") return;
      setLoading("camera");
      try {
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: false,
          quality: 0.85,
        });
        if (!result.canceled && result.assets[0]) {
          onImage(result.assets[0].uri);
        }
      } finally {
        setLoading(null);
      }
    },
    []
  );

  return { pickFromGallery, takePhoto, loading };
}
