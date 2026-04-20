import * as StoreReview from 'expo-store-review';
import { useProfileStore } from '@/stores/useProfileStore';

export function useReviewPrompt() {
  const hasRequestedReview = useProfileStore((s) => s.hasRequestedReview);
  const setHasRequestedReview = useProfileStore((s) => s.setHasRequestedReview);

  return async () => {
    if (hasRequestedReview) return;
    const isAvailable = await StoreReview.isAvailableAsync();
    if (!isAvailable) return;
    await StoreReview.requestReview();
    setHasRequestedReview(true);
  };
}
