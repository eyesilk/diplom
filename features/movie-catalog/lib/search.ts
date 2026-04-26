import { type TrailerItem } from "@/entities/movie";

export function normalizeSearchValue(value: string) {
  return value
    .toLowerCase()
    .replace(/ё/g, "е")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeSearchValue(value: string) {
  return normalizeSearchValue(value)
    .split(" ")
    .filter((token) => token.length > 0);
}

function getLevenshteinDistance(left: string, right: string) {
  if (left === right) {
    return 0;
  }

  if (!left.length) {
    return right.length;
  }

  if (!right.length) {
    return left.length;
  }

  const previousRow = Array.from(
    { length: right.length + 1 },
    (_, index) => index,
  );

  for (let i = 1; i <= left.length; i += 1) {
    let diagonal = i - 1;
    previousRow[0] = i;

    for (let j = 1; j <= right.length; j += 1) {
      const upper = previousRow[j];
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;

      previousRow[j] = Math.min(
        previousRow[j] + 1,
        previousRow[j - 1] + 1,
        diagonal + cost,
      );

      diagonal = upper;
    }
  }

  return previousRow[right.length];
}

function isFuzzyTokenMatch(queryToken: string, candidateToken: string) {
  if (queryToken === candidateToken) {
    return true;
  }

  const shortestLength = Math.min(queryToken.length, candidateToken.length);

  if (shortestLength < 3) {
    return false;
  }

  if (candidateToken.includes(queryToken)) {
    return true;
  }

  if (queryToken.length < 4 || candidateToken.length < 4) {
    return false;
  }

  if (queryToken[0] !== candidateToken[0]) {
    return false;
  }

  const maxDistance =
    queryToken.length >= 8 && candidateToken.length >= 8 ? 2 : 1;

  if (Math.abs(queryToken.length - candidateToken.length) > maxDistance) {
    return false;
  }

  return getLevenshteinDistance(queryToken, candidateToken) <= maxDistance;
}

export function matchesMovieSearchQuery(
  trailer: TrailerItem,
  normalizedQuery: string,
) {
  if (!normalizedQuery) {
    return true;
  }

  const normalizedTitle = normalizeSearchValue(trailer.title);
  const normalizedGenres = trailer.genres.map(normalizeSearchValue);
  const haystacks = [normalizedTitle, ...normalizedGenres];

  if (haystacks.some((value) => value.includes(normalizedQuery))) {
    return true;
  }

  const queryTokens = tokenizeSearchValue(normalizedQuery);
  const candidateTokens = haystacks.flatMap(tokenizeSearchValue);

  return queryTokens.every((queryToken) =>
    candidateTokens.some((candidateToken) =>
      isFuzzyTokenMatch(queryToken, candidateToken),
    ),
  );
}
