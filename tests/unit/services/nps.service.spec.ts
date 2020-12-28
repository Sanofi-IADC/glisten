import {
  computeNPSScore,
  computeNPSScoreEvolution,
  cumulArrayValues,
  isDetractor,
  isNeutral,
  isPromoter,
} from '@/services/nps.service';

describe('isPromoter', () => {
  it('should returns true if the rating is stricly above 4', () => {
    expect(isPromoter(0)).toBe(false);
    expect(isPromoter(4)).toBe(false);
    expect(isPromoter(4.5)).toBe(true);
  });
});

describe('isDetractor', () => {
  it('should returns true if the rating is stricly below 3.5', () => {
    expect(isDetractor(0)).toBe(true);
    expect(isDetractor(3.5)).toBe(false);
    expect(isDetractor(3)).toBe(true);
  });
});

describe('isNeutral', () => {
  it('should returns true if the rating is between (inclusive) 3.5 and 4', () => {
    expect(isNeutral(0)).toBe(false);
    expect(isNeutral(3)).toBe(false);
    expect(isNeutral(3.5)).toBe(true);
    expect(isNeutral(4)).toBe(true);
    expect(isNeutral(4.5)).toBe(false);
  });
});

describe('computeNPSScore', () => {
  it('compute the NPS score given the promoters, detractors and neutrals', () => {
    expect(computeNPSScore(10, 10, 10)).toBe(0);
    expect(computeNPSScore(10, 20, 10)).toBe(0);
    expect(computeNPSScore(20, 0, 0)).toBe(100);
    expect(computeNPSScore(75, 0, 25)).toBe(50);
    expect(computeNPSScore(25, 0, 75)).toBe(-50);
  });

  it('should return NaN if there is no ratings', () => {
    expect(computeNPSScore(0, 0, 0)).toBeNaN();
  });
});

describe('cumulArrayValues', () => {
  it('should returns an empty array if the input is empty', () => {
    expect(cumulArrayValues([])).toEqual([]);
  });

  it('should returns an array the size of the input', () => {
    expect(cumulArrayValues([1, 2, 3]).length).toBe(3);
  });

  it('should returns an array containing the cumulative sum of the input array', () => {
    expect(cumulArrayValues([1, 2, 3])).toEqual([1, 3, 6]);
  });
});

describe('computeNPSScoreEvolution', () => {
  it('should compute the NPS score evolution', () => {
    const ratings = [[0, 1, 2], [5, 5, 4.5], [4.5, 4], [4]];

    expect(computeNPSScoreEvolution(ratings)).toEqual([
      ((0 - 3) / 3) * 100,
      ((3 - 3) / 6) * 100,
      ((4 - 3) / 8) * 100,
      ((4 - 3) / 9) * 100,
    ]);
  });
});
