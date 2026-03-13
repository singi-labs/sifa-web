import { describe, it, expect } from 'vitest';
import { restoreLineBreaks } from '@/lib/import/restore-line-breaks';

describe('restoreLineBreaks', () => {
  it('returns undefined for undefined input', () => {
    expect(restoreLineBreaks(undefined)).toBeUndefined();
  });

  it('returns empty string unchanged', () => {
    expect(restoreLineBreaks('')).toBe('');
  });

  it('skips text that already contains newlines', () => {
    const text = 'Line one.\nLine two.';
    expect(restoreLineBreaks(text)).toBe(text);
  });

  it('inserts newline before dash bullets', () => {
    expect(restoreLineBreaks('Overview. - First item - Second item')).toBe(
      'Overview.\n- First item\n- Second item',
    );
  });

  it('inserts newline before asterisk bullets', () => {
    expect(restoreLineBreaks('Overview. * First * Second')).toBe(
      'Overview.\n* First\n* Second',
    );
  });

  it('inserts newline before bullet character', () => {
    expect(restoreLineBreaks('Summary. \u2022 Alpha \u2022 Beta')).toBe(
      'Summary.\n\u2022 Alpha\n\u2022 Beta',
    );
  });

  it('inserts newline before numbered list items', () => {
    expect(restoreLineBreaks('Tasks: 1. Plan 2. Build 3. Ship')).toBe(
      'Tasks:\n1. Plan\n2. Build\n3. Ship',
    );
  });

  it('does not break mid-sentence dashes', () => {
    expect(restoreLineBreaks('This is a well-known fact.')).toBe(
      'This is a well-known fact.',
    );
  });

  it('does not break decimal numbers', () => {
    expect(restoreLineBreaks('Grew revenue by 2.5x in 2023.')).toBe(
      'Grew revenue by 2.5x in 2023.',
    );
  });

  it('replaces double-space after period with paragraph break', () => {
    expect(restoreLineBreaks('First paragraph.  Second paragraph.')).toBe(
      'First paragraph.\n\nSecond paragraph.',
    );
  });

  it('handles combination of heuristics', () => {
    const input =
      'Led engineering team.  Key achievements: - Shipped v2 - Reduced latency 40%';
    const expected =
      'Led engineering team.\n\nKey achievements:\n- Shipped v2\n- Reduced latency 40%';
    expect(restoreLineBreaks(input)).toBe(expected);
  });

  it('leaves normal prose unchanged', () => {
    const text = 'I managed a team of 5 engineers. We built a new platform.';
    expect(restoreLineBreaks(text)).toBe(text);
  });
});
