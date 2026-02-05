import { ImageRun, Paragraph } from 'docx';

import { transparentPngFallback } from '../constants.js';
import {
  getStyleValue,
  mergeStyles,
  resolveFloating,
  resolveImageTransformation,
  toAlignment,
} from '../style.js';

import type { DocxNodeOf, ImageProps, StyleInput } from '../types.js';

function normalizeImageType(type?: ImageProps['type']): 'bmp' | 'gif' | 'jpg' | 'png' | 'svg' {
  if (!type) {
    return 'png';
  }

  if (type === 'svg') {
    return 'svg';
  }

  if (type === 'jpeg') {
    return 'jpg';
  }

  return type;
}

function normalizeFallbackType(type?: ImageProps['type']): 'bmp' | 'gif' | 'jpg' | 'png' {
  const normalized = normalizeImageType(type);

  return normalized === 'svg' ? 'png' : normalized;
}

export function createImageParagraph(
  node: DocxNodeOf<'IMAGE'>,
  inheritedStyle?: StyleInput,
): Paragraph {
  const style = mergeStyles(inheritedStyle, node.props.style);
  const widthValue = getStyleValue(style, 'width');
  const heightValue = getStyleValue(style, 'height');
  const alignment = toAlignment(getStyleValue(style, 'textAlign'));
  const type = normalizeImageType(node.props.type);
  const data = node.props.src;
  const fallback = node.props.fallback;
  const transformation =
    node.props.transformation ?? resolveImageTransformation(widthValue, heightValue);
  const floating = node.props.floating ?? resolveFloating(style);
  const normalizedFallback =
    type === 'svg' && fallback
      ? {
          ...fallback,
          type: normalizeFallbackType(fallback.type),
        }
      : undefined;

  const imageRun =
    type === 'svg'
      ? new ImageRun({
          type: 'svg',
          data,
          transformation,
          altText: node.props.altText,
          fallback: normalizedFallback ?? {
            type: 'png',
            data: transparentPngFallback,
          },
          ...(floating ? { floating } : {}),
        })
      : new ImageRun({
          type,
          data,
          transformation,
          altText: node.props.altText,
          ...(floating ? { floating } : {}),
        });

  return new Paragraph({
    alignment,
    children: [imageRun],
  });
}

function renderSvgToString(node: DocxNodeOf<'SVG'>) {
  const width = node.props.width ? ` width="${node.props.width}"` : '';
  const height = node.props.height ? ` height="${node.props.height}"` : '';
  const viewBox = node.props.viewBox ? ` viewBox="${node.props.viewBox}"` : '';

  const paths = node.children
    .filter((child): child is DocxNodeOf<'PATH'> => child.type === 'PATH')
    .map((child) => {
      const fill = child.props.fill ? ` fill="${child.props.fill}"` : '';
      const stroke = child.props.stroke ? ` stroke="${child.props.stroke}"` : '';
      const strokeWidth = child.props.strokeWidth
        ? ` stroke-width="${child.props.strokeWidth}"`
        : '';

      return `<path d="${child.props.d}"${fill}${stroke}${strokeWidth} />`;
    })
    .join('');

  return (
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<svg xmlns="http://www.w3.org/2000/svg"${width}${height}${viewBox}>` +
    `${paths}</svg>`
  );
}

export function createSvgImageParagraph(
  node: DocxNodeOf<'SVG'>,
  inheritedStyle?: StyleInput,
): Paragraph {
  const svgMarkup = renderSvgToString(node);
  const style = mergeStyles(inheritedStyle, node.props.style);
  const widthValue = getStyleValue(style, 'width');
  const heightValue = getStyleValue(style, 'height');
  const width = widthValue ?? node.props.width;
  const height = heightValue ?? node.props.height;
  const alignment = toAlignment(getStyleValue(style, 'textAlign'));
  const transformation = node.props.transformation ?? resolveImageTransformation(width, height);
  const floating = node.props.floating ?? resolveFloating(style);

  return new Paragraph({
    alignment,
    children: [
      new ImageRun({
        type: 'svg',
        data: Buffer.from(svgMarkup),
        transformation,
        altText: node.props.altText,
        fallback: {
          type: 'png',
          data: transparentPngFallback,
        },
        ...(floating ? { floating } : {}),
      }),
    ],
  });
}
