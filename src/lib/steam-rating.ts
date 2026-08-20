const MIN_VOTES_FOR_RATING = 25;

export function getSteamWorkshopStarRating(
  positiveVotes: number,
  negativeVotes: number,
): number | undefined {
  const totalVotes = positiveVotes + negativeVotes;
  if (totalVotes < MIN_VOTES_FOR_RATING) return undefined;

  const score = (positiveVotes + 50) / (totalVotes + 100);

  if (score >= 0.8) return 5;
  if (score >= 0.6) return 4;
  if (score >= 0.4) return 3;
  if (score >= 0.2) return 2;
  return 1;
}
