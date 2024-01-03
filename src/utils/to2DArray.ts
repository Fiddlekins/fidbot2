export function to2DArray<Type>(array: Type[], subArrayLength: number): Type[][] {
  const output: Type[][] = [];
  for (let i = 0; i < array.length; i += subArrayLength) {
    output.push(array.slice(i, i + subArrayLength));
  }
  return output;
}
