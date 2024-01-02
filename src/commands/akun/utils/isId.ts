const oldIdStyleRegex = /^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/;
const newIdStyleRegex = /^[A-z0-9]{17}$/;

export function isId(potentialId: string): boolean {
  return oldIdStyleRegex.test(potentialId) || newIdStyleRegex.test(potentialId);
}
