import * as Haptics from 'expo-haptics';

function optionalFeedback(action: () => Promise<void>) {
  try {
    void action().catch(() => undefined);
  } catch {
    // Tactile feedback is optional: device limitations must never block an action.
  }
}

export function lightImpact() {
  optionalFeedback(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

export function successFeedback() {
  optionalFeedback(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

export function selectionFeedback() {
  optionalFeedback(() => Haptics.selectionAsync());
}