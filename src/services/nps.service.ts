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
