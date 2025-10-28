/**
 * Converts a string to Title Case
 * @param str - The string to convert
 * @returns The string in Title Case
 */
export function toTitleCase(str: string | null | undefined): string {
  if (!str) return '';
  
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Formats a name to Title Case (handles first and last names)
 * @param firstName - First name
 * @param lastName - Last name
 * @returns Full name in Title Case
 */
export function formatName(firstName: string | null | undefined, lastName: string | null | undefined): string {
  const first = toTitleCase(firstName);
  const last = toTitleCase(lastName);
  return `${first} ${last}`.trim();
}