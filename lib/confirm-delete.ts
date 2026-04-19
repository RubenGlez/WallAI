import { Alert } from "react-native";

/**
 * Shows a confirm-delete alert with a cancel and a destructive action button.
 * All label strings are caller-provided (pass `t(...)` results directly).
 */
export function confirmDelete({
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
}) {
  Alert.alert(title, message, [
    { text: cancelLabel, style: "cancel" },
    { text: confirmLabel, style: "destructive", onPress: onConfirm },
  ]);
}
