import { Paragraph, TextRun } from 'docx';

import {
  getStyleValue,
  mergeStyles,
  normalizeColor,
  resolveFontSize,
  resolveFontWeight,
  resolveLength,
  resolveLineHeight,
  resolveUnderline,
  toAlignment,
  toHalfPoints,
  toTwip,
} from '../style.js';

import type { DocxChild, DocxNodeOf, RunOptions, StyleInput, TextNode } from '../types.js';

function isTextNode(node: DocxChild): node is TextNode {
  return node.type === 'TEXT_INSTANCE';
}

function mergeRunOptions(base?: RunOptions, next?: RunOptions): RunOptions | undefined {
  if (!base && !next) {
    return undefined;
  }

  return {
    ...(base ?? {}),
    ...(next ?? {}),
  };
}

function resolveRunOptions(style: StyleInput | undefined, run?: RunOptions): RunOptions {
  const fontSize = resolveFontSize(style);
  const decoration = getStyleValue(style, 'textDecoration');
  const hasLineThrough = decoration ? decoration.split(/\s+/).includes('line-through') : false;
  const strike = getStyleValue(style, 'strike') ?? hasLineThrough;
  const doubleStrike = getStyleValue(style, 'doubleStrike') ?? false;
  const underline = resolveUnderline(style);
  const letterSpacing = resolveLength(getStyleValue(style, 'letterSpacing'));
  const characterSpacing = letterSpacing !== undefined ? toTwip(letterSpacing) : undefined;

  return {
    bold: resolveFontWeight(style),
    italics: getStyleValue(style, 'fontStyle') === 'italic',
    underline,
    strike: strike && !doubleStrike ? true : undefined,
    doubleStrike: doubleStrike || undefined,
    allCaps: getStyleValue(style, 'allCaps') || undefined,
    smallCaps: getStyleValue(style, 'smallCaps') || undefined,
    subScript: getStyleValue(style, 'subScript') || undefined,
    superScript: getStyleValue(style, 'superScript') || undefined,
    highlight: getStyleValue(style, 'highlight'),
    size: toHalfPoints(fontSize),
    font: getStyleValue(style, 'fontFamily'),
    color: normalizeColor(getStyleValue(style, 'color')),
    characterSpacing,
    ...(run ?? {}),
  } satisfies RunOptions;
}

function createTextRunsFromString(
  text: string,
  style: StyleInput | undefined,
  run?: RunOptions,
): TextRun[] {
  const runOptions = resolveRunOptions(style, run);
  const runs: TextRun[] = [];

  const segments = text.split('\n');

  segments.forEach((segment, index) => {
    runs.push(
      new TextRun({
        text: segment,
        ...runOptions,
      }),
    );

    if (index < segments.length - 1) {
      runs.push(new TextRun({ break: 1 }));
    }
  });

  return runs;
}

function renderInlineNode(
  node: DocxChild,
  inheritedStyle?: StyleInput,
  inheritedRun?: RunOptions,
): TextRun[] {
  if (isTextNode(node)) {
    return createTextRunsFromString(node.text, inheritedStyle, inheritedRun);
  }

  if (node.type === 'TEXT') {
    const mergedStyle = mergeStyles(inheritedStyle, node.props.style);
    const mergedRun = mergeRunOptions(inheritedRun, node.props.run);

    return node.children.flatMap((child) => renderInlineNode(child, mergedStyle, mergedRun));
  }

  return [];
}

function createParagraphFromText(node: DocxNodeOf<'TEXT'>, inheritedStyle?: StyleInput): Paragraph {
  const style = mergeStyles(inheritedStyle, node.props.style);
  const fontSize = resolveFontSize(style);
  const alignment = toAlignment(getStyleValue(style, 'textAlign'));
  const paragraphOptions = node.props.paragraph ?? {};
  const runOptions = mergeRunOptions(undefined, node.props.run);

  const {
    alignment: overrideAlignment,
    spacing: spacingOverride,
    indent: indentOverride,
    ...restParagraph
  } = paragraphOptions;

  const marginTop = resolveLength(getStyleValue(style, 'marginTop'));
  const marginBottom = resolveLength(getStyleValue(style, 'marginBottom'));
  const marginLeft = resolveLength(getStyleValue(style, 'marginLeft'));
  const marginRight = resolveLength(getStyleValue(style, 'marginRight'));
  const textIndent = resolveLength(getStyleValue(style, 'textIndent'));

  const spacing = {
    before: toTwip(marginTop) ?? 0,
    after: toTwip(marginBottom) ?? 0,
    line: resolveLineHeight(style, fontSize),
    ...(spacingOverride ?? {}),
  };

  const indent =
    textIndent !== undefined ||
    marginLeft !== undefined ||
    marginRight !== undefined ||
    indentOverride
      ? {
          ...(textIndent !== undefined ? { firstLine: toTwip(textIndent) ?? 0 } : {}),
          ...(marginLeft !== undefined ? { left: toTwip(marginLeft) ?? 0 } : {}),
          ...(marginRight !== undefined ? { right: toTwip(marginRight) ?? 0 } : {}),
          ...(indentOverride ?? {}),
        }
      : undefined;

  return new Paragraph({
    ...restParagraph,
    alignment: overrideAlignment ?? alignment,
    spacing,
    ...(indent ? { indent } : {}),
    children: node.children.flatMap((child) => renderInlineNode(child, style, runOptions)),
  });
}

export { createParagraphFromText, createTextRunsFromString, isTextNode, renderInlineNode };
