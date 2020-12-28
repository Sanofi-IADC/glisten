export const DETRACTOR_RATING = 3; // and below
export const PROMOTER_RATING = 4.5; // and above

export function isPromoter(rating: number): boolean {
  return rating >= PROMOTER_RATING;
}

export function isNeutral(rating: number): boolean {
  return rating > DETRACTOR_RATING && rating < PROMOTER_RATING;
}

export function isDetractor(rating: number): boolean {
  return rating <= DETRACTOR_RATING;
}

export function computeNPSScore(promoters: number, neutrals: number, detractors: number): number {
  return ((promoters - detractors) / (promoters + neutrals + detractors)) * 100;
}

/**
 * Compute the NPS score evolution over periods of time
 * @param ratings Ratings per period of time
 */
export function computeNPSScoreEvolution(ratings: number[][]): number[] {
  const promoters = cumulArrayValues(ratings.map((x) => x.filter(isPromoter).length));
  const neutrals = cumulArrayValues(ratings.map((x) => x.filter(isNeutral).length));
  const detractors = cumulArrayValues(ratings.map((x) => x.filter(isDetractor).length));

  return ratings.map((_, i) => computeNPSScore(promoters[i], neutrals[i], detractors[i]));
}

export function cumulArrayValues(array: number[]): number[] {
  return array.reduce<number[]>(
    (prev, current, i) => [...prev, (i === 0 ? 0 : prev[i - 1]) + current],
    [],
  );
}
