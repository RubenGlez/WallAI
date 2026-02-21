import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getColorsForSeriesIds } from "@/lib/color";
import { getAllSeriesWithCount, getColorsBySeriesId } from "@/stores/useCatalogStore";
import type { Color } from "@/types";

export function useSeriesColorSelection() {
  const allSeries = useMemo(() => getAllSeriesWithCount(), []);
  const [selectedSeriesIds, setSelectedSeriesIds] = useState<Set<string>>(
    new Set()
  );
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (allSeries.length > 0 && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      setSelectedSeriesIds(new Set([allSeries[0].id]));
    }
  }, [allSeries]);

  const toggleSeriesSelection = useCallback((seriesId: string) => {
    setSelectedSeriesIds((prev) => {
      const next = new Set(prev);
      if (next.has(seriesId)) next.delete(seriesId);
      else next.add(seriesId);
      return next;
    });
  }, []);

  const allColors = useMemo(
    () => getColorsForSeriesIds([...selectedSeriesIds], getColorsBySeriesId),
    [selectedSeriesIds]
  );

  return {
    allSeries,
    selectedSeriesIds,
    setSelectedSeriesIds,
    toggleSeriesSelection,
    allColors,
  };
}
