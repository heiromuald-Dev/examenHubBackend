import { describe, expect, it } from 'vitest';
import { calculatePercentage } from '../src/utils/scoreUtils';

describe('result scoring', () => {
  it('keeps the raw earned points distinct from the percentage', () => {
    const earnedPoints = 7;
    const maximumPoints = 10;
    expect(earnedPoints).toBe(7);
    expect(calculatePercentage(earnedPoints, maximumPoints)).toBe(70);
  });

  it('rounds the percentage to two decimals', () => {
    expect(calculatePercentage(1, 3)).toBe(33.33);
  });

  it('returns zero when the maximum is not positive', () => {
    expect(calculatePercentage(2, 0)).toBe(0);
  });
});
