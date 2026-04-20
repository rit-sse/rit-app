import { LocationSearchRecord } from "@/types/map";

export function normalizeSearchText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, " ")
    .replace(/\s+/g, " ");
}

export function getSearchScore(
  record: LocationSearchRecord,
  query: string,
): number {
  const normalizedQuery = normalizeSearchText(query);
  const normalizedName = normalizeSearchText(record.name);
  const normalizedAbbreviation = record.abbreviation
    ? normalizeSearchText(record.abbreviation)
    : null;
  const normalizedBuildingNumber = record.buildingNumber
    ? normalizeSearchText(record.buildingNumber)
    : null;

  if (
    normalizedAbbreviation === normalizedQuery ||
    normalizedBuildingNumber === normalizedQuery ||
    normalizedName === normalizedQuery
  ) {
    return 400;
  }

  if (
    normalizedAbbreviation?.startsWith(normalizedQuery) ||
    normalizedBuildingNumber?.startsWith(normalizedQuery) ||
    normalizedName.startsWith(normalizedQuery)
  ) {
    return 300;
  }

  if (record.searchTokens.some((token) => token === normalizedQuery)) {
    return 250;
  }

  if (record.searchTokens.some((token) => token.startsWith(normalizedQuery))) {
    return 200;
  }

  if (record.searchTokens.some((token) => token.includes(normalizedQuery))) {
    return 100;
  }

  return 0;
}

export function findSearchRecordForStop(
  stopName: string,
  searchRecords: LocationSearchRecord[],
): LocationSearchRecord | null {
  const normalizedStopName = normalizeSearchText(stopName);

  let bestMatch: { record: LocationSearchRecord; score: number } | null = null;

  for (const record of searchRecords) {
    const normalizedName = normalizeSearchText(record.name);
    const normalizedSecondaryLabel = record.secondaryLabel
      ? normalizeSearchText(record.secondaryLabel)
      : null;

    let score = 0;

    if (normalizedName === normalizedStopName) {
      score = 500;
    } else if (record.searchTokens.includes(normalizedStopName)) {
      score = 450;
    } else if (
      normalizedName.includes(normalizedStopName) ||
      normalizedStopName.includes(normalizedName)
    ) {
      score = 300;
    } else if (
      normalizedSecondaryLabel &&
      normalizedSecondaryLabel.includes(normalizedStopName)
    ) {
      score = 200;
    } else if (
      record.searchTokens.some(
        (token) =>
          token.includes(normalizedStopName) ||
          normalizedStopName.includes(token),
      )
    ) {
      score = 150;
    }

    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { record, score };
    }
  }

  return bestMatch && bestMatch.score > 0 ? bestMatch.record : null;
}
