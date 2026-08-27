export const calculatePercentage = (earnedPoints: number, maximumPoints: number): number => {
  if (!Number.isFinite(earnedPoints) || !Number.isFinite(maximumPoints) || maximumPoints <= 0) return 0;
  return Number(((earnedPoints / maximumPoints) * 100).toFixed(2));
};
