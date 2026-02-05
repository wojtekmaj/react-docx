import { WidthType } from 'docx';

import { PIXELS_PER_POINT } from './constants.js';
import { resolveLength, toTwip } from './style.js';

import type { ITableWidthProperties } from 'docx';

type WidthTypeValue = (typeof WidthType)[keyof typeof WidthType];

export function toTwipFromPixels(value: number): number | undefined {
  return toTwip(value / PIXELS_PER_POINT);
}

export function resolveWidth(value: unknown): ITableWidthProperties | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === 'object') {
    if (value && 'size' in value && 'type' in value) {
      return value as { size: number; type: WidthTypeValue };
    }
    return undefined;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (trimmed.endsWith('%')) {
      const percentValue = Number.parseFloat(trimmed.slice(0, -1));

      if (!Number.isNaN(percentValue)) {
        return {
          size: percentValue,
          type: WidthType.PERCENTAGE,
        };
      }

      return undefined;
    }

    const resolvedLength = resolveLength(trimmed);

    if (resolvedLength !== undefined) {
      return {
        size: toTwip(resolvedLength) ?? resolvedLength,
        type: WidthType.DXA,
      };
    }

    const dxaValue = Number.parseFloat(trimmed);

    if (!Number.isNaN(dxaValue)) {
      return {
        size: toTwipFromPixels(dxaValue) ?? dxaValue,
        type: WidthType.DXA,
      };
    }

    return undefined;
  }

  if (typeof value === 'number') {
    if (Number.isNaN(value)) {
      return undefined;
    }

    return {
      size: toTwipFromPixels(value) ?? value,
      type: WidthType.DXA,
    };
  }

  return undefined;
}
