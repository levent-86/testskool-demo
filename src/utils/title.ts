// Capitalize the first letters
export function title(input: string | undefined): string {
  if (!input) return '';
  
  return input
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
};
