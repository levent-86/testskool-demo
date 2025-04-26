import { describe, expect, it } from 'vitest';
import { title } from '../utils/title';


describe('Title utility:', () => {
  it('Capitalizes first letter of each word', () => {
    expect(title('test-user')).toBe('Test-user');
    expect(title('foo bar')).toBe('Foo Bar');
  });

  it('Handles empty or undefined input', () => {
    expect(title('')).toBe('');
    expect(title(undefined)).toBe('');
  });

  it('Handles multiple spaces and mixed case', () => {
    expect(title('hello world')).toBe('Hello World');
    expect(title('HeLLo  WoRLD')).toBe('Hello  World');
  });
});
