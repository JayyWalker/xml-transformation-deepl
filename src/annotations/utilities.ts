import GraphemeSplitter from 'grapheme-splitter';

export const splitter = new GraphemeSplitter();

export function splitStringAtPoints(text: string, points: number[]): string[] {
  const parts: string[] = [];

  const allPoints = [0, ...points, text.length];

  // Split the strings based on graphemes into characters
  const characters = splitter.splitGraphemes(text);

  // Convert the points into pairs of points
  const slicePoints = splitArrayIntoPairs(allPoints);

  // Take each sub array based on the points
  for (const [start, finish] of slicePoints) {
    const part = characters.slice(start, finish);

    // Join each sub array into strings
    parts.push(part.join(''));
  }

  return parts;
}

export function splitArrayIntoPairs<T>(array: T[]): T[][] {
  return array.reduce(
    (result, _value, index, sourceArray) =>
      index < sourceArray.length - 1 ? [...result, sourceArray.slice(index, index + 2)] : result,
    [] as T[][],
  );
}

export function interleaveArrays<T>(arr1: T[], arr2: T[]): T[] {
  const result: T[] = [];

  for (let i = 0; i < Math.max(arr1.length, arr2.length); i++) {
    if (i < arr1.length) {
      result.push(arr1[i]);
    }
    if (i < arr2.length) {
      result.push(arr2[i]);
    }
  }

  return result;
}
