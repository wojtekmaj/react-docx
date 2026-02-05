import {
  AlignmentType,
  BorderStyle,
  HorizontalPositionAlign,
  HorizontalPositionRelativeFrom,
  UnderlineType,
  VerticalPositionRelativeFrom,
} from 'docx';

import {
  EMU_PER_POINT,
  HALF_POINTS_PER_POINT,
  PIXELS_PER_POINT,
  TWIPS_PER_POINT,
} from './constants.js';

import type {
  IBorderOptions,
  IBordersOptions,
  IFloating,
  ILevelParagraphStylePropertiesOptions,
  IRunOptions,
  ITableBordersOptions,
  ITableCellBorders,
} from 'docx';
import type { Length, Style, StyleInput } from './types.js';

const POINTS_PER_INCH = 72;
const POINTS_PER_PICA = 12;
const MILLIMETERS_PER_INCH = 25.4;
const CENTIMETERS_PER_INCH = 2.54;
const LENGTH_PATTERN = /^\s*(-?\d+(?:\.\d+)?)\s*(pt|px|in|cm|mm|pc|pi)\s*$/i;

type AlignmentTypeValue = NonNullable<ILevelParagraphStylePropertiesOptions['alignment']>;
type BorderStyleValue = IBorderOptions['style'];
type DocxBorders = IBordersOptions & ITableCellBorders & ITableBordersOptions;

function toTwip(points?: number): number | undefined {
  if (points === undefined) {
    return undefined;
  }

  return Math.round(points * TWIPS_PER_POINT);
}

function toHalfPoints(points?: number): number | undefined {
  if (points === undefined) {
    return undefined;
  }

  return Math.round(points * HALF_POINTS_PER_POINT);
}

function toEmu(points?: number): number | undefined {
  if (points === undefined) {
    return undefined;
  }

  return Math.round(points * EMU_PER_POINT);
}

function toPixels(points?: number): number | undefined {
  if (points === undefined) {
    return undefined;
  }

  return Math.round(points * PIXELS_PER_POINT);
}

function resolveLength(value?: Length | string | number): number | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === 'number') {
    return Number.isNaN(value) ? undefined : value;
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  const match = LENGTH_PATTERN.exec(value);

  if (!match) {
    return undefined;
  }

  const numericPart = match[1];
  const unitPart = match[2];

  if (!numericPart || !unitPart) {
    return undefined;
  }

  const numeric = Number.parseFloat(numericPart);

  if (Number.isNaN(numeric)) {
    return undefined;
  }

  const unit = unitPart.toLowerCase();

  if (unit === 'pt') {
    return numeric;
  }

  if (unit === 'px') {
    return numeric / PIXELS_PER_POINT;
  }

  if (unit === 'in') {
    return numeric * POINTS_PER_INCH;
  }

  if (unit === 'cm') {
    return (numeric / CENTIMETERS_PER_INCH) * POINTS_PER_INCH;
  }

  if (unit === 'mm') {
    return (numeric / MILLIMETERS_PER_INCH) * POINTS_PER_INCH;
  }

  if (unit === 'pc' || unit === 'pi') {
    return numeric * POINTS_PER_PICA;
  }

  return undefined;
}

function resolveStyle(input?: StyleInput): Style | undefined {
  if (!input) {
    return undefined;
  }

  if (!Array.isArray(input)) {
    return input;
  }

  const resolved = input.filter(Boolean) as Style[];

  if (resolved.length === 0) {
    return undefined;
  }

  return resolved.reduce<Style>((acc, item) => Object.assign(acc, item), {});
}

function getStyleValue<K extends keyof Style>(
  style: StyleInput | undefined,
  key: K,
): Style[K] | undefined {
  const resolvedStyle = resolveStyle(style);

  if (!resolvedStyle) {
    return undefined;
  }

  return resolvedStyle[key];
}

function normalizeColor(color?: string): string | undefined {
  if (!color) {
    return undefined;
  }

  if (color.startsWith('#')) {
    return color.slice(1);
  }

  return color;
}

function normalizeBorderStyle(style: unknown): BorderStyleValue | undefined {
  if (style === 'none') {
    return BorderStyle.NONE;
  }

  return style as (typeof BorderStyle)[keyof typeof BorderStyle] | undefined;
}

function normalizeBorderColor(color?: string): string {
  if (!color) {
    return 'auto';
  }

  return normalizeColor(color) ?? 'auto';
}

function resolveBorderStyle(size?: number, color?: string): BorderStyleValue {
  if (!size || size <= 0) {
    return BorderStyle.NONE;
  }

  if (color === 'none') {
    return BorderStyle.NONE;
  }

  return BorderStyle.SINGLE;
}

function normalizeBorders(style: StyleInput | undefined): DocxBorders | undefined {
  const resolvedStyle = resolveStyle(style);

  if (!resolvedStyle) {
    return undefined;
  }

  const borders = getStyleValue(resolvedStyle, 'borders');

  if (borders && typeof borders === 'object') {
    const borderRecord = borders as Record<
      'top' | 'bottom' | 'left' | 'right',
      { color?: string; size?: number; style?: unknown } | undefined
    >;

    const defaultStyle = BorderStyle.NONE;

    return {
      top: borderRecord.top
        ? {
            color: borderRecord.top.color ?? 'auto',
            size: borderRecord.top.size ?? 0,
            style: normalizeBorderStyle(borderRecord.top.style) ?? defaultStyle,
          }
        : undefined,
      bottom: borderRecord.bottom
        ? {
            color: borderRecord.bottom.color ?? 'auto',
            size: borderRecord.bottom.size ?? 0,
            style: normalizeBorderStyle(borderRecord.bottom.style) ?? defaultStyle,
          }
        : undefined,
      left: borderRecord.left
        ? {
            color: borderRecord.left.color ?? 'auto',
            size: borderRecord.left.size ?? 0,
            style: normalizeBorderStyle(borderRecord.left.style) ?? defaultStyle,
          }
        : undefined,
      right: borderRecord.right
        ? {
            color: borderRecord.right.color ?? 'auto',
            size: borderRecord.right.size ?? 0,
            style: normalizeBorderStyle(borderRecord.right.style) ?? defaultStyle,
          }
        : undefined,
    };
  }

  const borderTopWidth = getStyleValue(resolvedStyle, 'borderTopWidth');
  const borderBottomWidth = getStyleValue(resolvedStyle, 'borderBottomWidth');
  const borderLeftWidth = getStyleValue(resolvedStyle, 'borderLeftWidth');
  const borderRightWidth = getStyleValue(resolvedStyle, 'borderRightWidth');

  const borderTopColor = getStyleValue(resolvedStyle, 'borderTopColor');
  const borderBottomColor = getStyleValue(resolvedStyle, 'borderBottomColor');
  const borderLeftColor = getStyleValue(resolvedStyle, 'borderLeftColor');
  const borderRightColor = getStyleValue(resolvedStyle, 'borderRightColor');

  return {
    top: {
      color: normalizeBorderColor(borderTopColor),
      size: borderTopWidth ?? 0,
      style: resolveBorderStyle(borderTopWidth, borderTopColor),
    },
    bottom: {
      color: normalizeBorderColor(borderBottomColor),
      size: borderBottomWidth ?? 0,
      style: resolveBorderStyle(borderBottomWidth, borderBottomColor),
    },
    left: {
      color: normalizeBorderColor(borderLeftColor),
      size: borderLeftWidth ?? 0,
      style: resolveBorderStyle(borderLeftWidth, borderLeftColor),
    },
    right: {
      color: normalizeBorderColor(borderRightColor),
      size: borderRightWidth ?? 0,
      style: resolveBorderStyle(borderRightWidth, borderRightColor),
    },
  };
}

function resolveImageTransformation(
  width?: Length | string | number,
  height?: Length | string | number,
): { width: number; height: number } {
  const resolvedWidth = resolveLength(width);
  const resolvedHeight = resolveLength(height);

  return {
    width: toPixels(resolvedWidth) ?? 1,
    height: toPixels(resolvedHeight) ?? 1,
  };
}

function resolveFloating(style?: StyleInput): IFloating | undefined {
  const resolvedStyle = resolveStyle(style);

  if (!resolvedStyle || getStyleValue(resolvedStyle, 'position') !== 'absolute') {
    return undefined;
  }

  const top = resolveLength(getStyleValue(resolvedStyle, 'top'));
  const bottom = resolveLength(getStyleValue(resolvedStyle, 'bottom'));
  const left = resolveLength(getStyleValue(resolvedStyle, 'left'));
  const right = resolveLength(getStyleValue(resolvedStyle, 'right'));
  const behindDocument = getStyleValue(resolvedStyle, 'behindDocument');
  const zIndex = getStyleValue(resolvedStyle, 'zIndex');

  const horizontalPosition =
    left !== undefined
      ? {
          relative: HorizontalPositionRelativeFrom.MARGIN,
          offset: toEmu(left) ?? 0,
        }
      : right !== undefined
        ? {
            relative: HorizontalPositionRelativeFrom.MARGIN,
            align: HorizontalPositionAlign.RIGHT,
            offset: toEmu(right) ?? 0,
          }
        : {
            relative: HorizontalPositionRelativeFrom.MARGIN,
            offset: 0,
          };

  const verticalPosition =
    top !== undefined
      ? {
          relative: VerticalPositionRelativeFrom.MARGIN,
          offset: toEmu(top) ?? 0,
        }
      : bottom !== undefined
        ? {
            relative: VerticalPositionRelativeFrom.MARGIN,
            offset: -(toEmu(bottom) ?? 0),
          }
        : {
            relative: VerticalPositionRelativeFrom.MARGIN,
            offset: 0,
          };

  return {
    horizontalPosition,
    verticalPosition,
    ...(behindDocument ? { behindDocument: true } : {}),
    ...(zIndex !== undefined ? { zIndex } : {}),
  };
}

function resolveFontSize(style: StyleInput | undefined): number | undefined {
  const fontSize = getStyleValue(style, 'fontSize');
  return fontSize ?? undefined;
}

function resolveFontWeight(style: StyleInput | undefined): boolean {
  const fontWeight = getStyleValue(style, 'fontWeight');

  if (fontWeight === 'bold') {
    return true;
  }

  if (typeof fontWeight === 'number') {
    return fontWeight >= 600;
  }

  return false;
}

function resolveLineHeight(style: StyleInput | undefined, fontSize?: number): number | undefined {
  const lineHeight = getStyleValue(style, 'lineHeight');

  if (!lineHeight) {
    return undefined;
  }

  if (lineHeight <= 4 && fontSize) {
    return Math.round(fontSize * lineHeight * TWIPS_PER_POINT);
  }

  return Math.round(lineHeight * TWIPS_PER_POINT);
}

function resolveUnderline(style: StyleInput | undefined): IRunOptions['underline'] | undefined {
  const decoration = getStyleValue(style, 'textDecoration');
  const hasUnderline =
    getStyleValue(style, 'underline') ??
    (decoration ? decoration.split(/\s+/).includes('underline') : false);

  if (!hasUnderline) {
    return undefined;
  }

  const underlineColor = normalizeColor(
    getStyleValue(style, 'textDecorationColor') ?? getStyleValue(style, 'color'),
  );

  return {
    type: UnderlineType.SINGLE,
    ...(underlineColor ? { color: underlineColor } : {}),
  };
}

function mergeStyles(base?: StyleInput, next?: StyleInput): Style | undefined {
  const resolvedBase = resolveStyle(base);
  const resolvedNext = resolveStyle(next);

  if (!resolvedBase && !resolvedNext) {
    return undefined;
  }

  return {
    ...(resolvedBase ?? {}),
    ...(resolvedNext ?? {}),
  } satisfies Style;
}

function toAlignment(value?: string): AlignmentTypeValue {
  if (value === 'center') {
    return AlignmentType.CENTER;
  }

  if (value === 'right') {
    return AlignmentType.RIGHT;
  }

  if (value === 'justify') {
    return AlignmentType.JUSTIFIED;
  }

  return AlignmentType.LEFT;
}

export {
  getStyleValue,
  mergeStyles,
  normalizeBorderColor,
  normalizeBorderStyle,
  normalizeBorders,
  normalizeColor,
  resolveBorderStyle,
  resolveFloating,
  resolveFontSize,
  resolveFontWeight,
  resolveImageTransformation,
  resolveLineHeight,
  resolveLength,
  resolveUnderline,
  resolveStyle,
  toAlignment,
  toEmu,
  toHalfPoints,
  toTwip,
};
