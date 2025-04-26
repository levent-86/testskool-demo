import { describe, it, expect } from 'vitest';
import { formatDate } from '../utils/formatDate';

describe('formatDate:', () => {
  it('Should format a valid date string with default locale (en-US).', () => {
    const input = '2025-03-01T00:00:00Z';
    const result = formatDate(input);
    expect(result).to.equal('March 1, 2025');
  });

  it('Should return an empty string for undefined date.', () => {
    const result = formatDate(undefined);
    expect(result).to.equal('');
  });

  it('Should return an empty string for empty string date.', () => {
    const result = formatDate('');
    expect(result).to.equal('');
  });

  it('Should handle invalid date strings gracefully.', () => {
    const result = formatDate('invalid-date');
    expect(result).to.equal('Invalid Date');
  });
});
