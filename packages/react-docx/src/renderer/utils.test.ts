import { describe, expect, it } from 'vitest';
import { WidthType } from 'docx';

import { resolveWidth, toTwipFromPixels } from './utils.js';

describe('toTwipFromPixels()', () => {
  it('converts pixels to twips', () => {
    expect(toTwipFromPixels(96)).toBe(1440);
  });
});

describe('resolveWidth()', () => {
  it('parses percentage strings', () => {
    expect(resolveWidth('50%')).toEqual({
      size: 50,
      type: WidthType.PERCENTAGE,
    });
  });

  it('parses numeric strings as pixels', () => {
    expect(resolveWidth('96')).toEqual({
      size: 1440,
      type: WidthType.DXA,
    });
  });

  it('parses unit strings as points', () => {
    expect(resolveWidth('1in')).toEqual({
      size: 1440,
      type: WidthType.DXA,
    });
    expect(resolveWidth('12pt')).toEqual({
      size: 240,
      type: WidthType.DXA,
    });
  });

  it('parses numeric values as pixels', () => {
    expect(resolveWidth(96)).toEqual({
      size: 1440,
      type: WidthType.DXA,
    });
  });

  it('returns undefined for invalid input', () => {
    expect(resolveWidth('invalid')).toBeUndefined();
    expect(resolveWidth(undefined)).toBeUndefined();
  });
});
