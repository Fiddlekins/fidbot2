export function getRandomInt(maxExclusive: number): number {
  return Math.floor(Math.random() * maxExclusive);
}

export function getRandomIntInRange(minInclusive: number, maxInclusive: number): number {
  return minInclusive + getRandomInt(maxInclusive + 1 - minInclusive);
}

export function getRandomElement<Type>(elements: Type[]): Type {
  return elements[getRandomInt(elements.length)];
}
