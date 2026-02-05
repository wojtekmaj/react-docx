import {
  Table as DocxTable,
  TableCell as DocxTableCell,
  TableRow as DocxTableRow,
  ShadingType,
  VerticalAlign,
  WidthType,
} from 'docx';

import {
  getStyleValue,
  normalizeBorders,
  normalizeColor,
  resolveLength,
  toAlignment,
  toTwip,
} from '../style.js';
import { resolveWidth } from '../utils.js';
import { renderBlockNodes } from './blocks.js';

import type { DocxNodeOf } from '../types.js';

function createTableCell(node: DocxNodeOf<'TABLE_CELL'>) {
  const style = node.props.style;
  const docxOptions = node.props.docx ?? {};
  const backgroundColor = normalizeColor(getStyleValue(style, 'backgroundColor'));
  const borders = normalizeBorders(style);
  const padding = getStyleValue(style, 'padding');
  const paddingHorizontal = getStyleValue(style, 'paddingHorizontal');
  const paddingVertical = getStyleValue(style, 'paddingVertical');
  const paddingTop = getStyleValue(style, 'paddingTop') ?? paddingVertical ?? padding;
  const paddingBottom = getStyleValue(style, 'paddingBottom') ?? paddingVertical ?? padding;
  const paddingLeft = getStyleValue(style, 'paddingLeft') ?? paddingHorizontal ?? padding;
  const paddingRight = getStyleValue(style, 'paddingRight') ?? paddingHorizontal ?? padding;

  const verticalAlign = getStyleValue(style, 'verticalAlign');

  const resolvedPaddingTop = toTwip(resolveLength(paddingTop));
  const resolvedPaddingBottom = toTwip(resolveLength(paddingBottom));
  const resolvedPaddingLeft = toTwip(resolveLength(paddingLeft));
  const resolvedPaddingRight = toTwip(resolveLength(paddingRight));
  const resolvedWidth =
    node.props.width !== undefined ? resolveWidth(node.props.width) : docxOptions.width;

  return new DocxTableCell({
    ...docxOptions,
    children: renderBlockNodes(node.children, style),
    columnSpan: node.props.columnSpan ?? docxOptions.columnSpan,
    rowSpan: node.props.rowSpan ?? docxOptions.rowSpan,
    width: resolvedWidth,
    borders: docxOptions.borders ?? borders,
    margins:
      docxOptions.margins ??
      (resolvedPaddingTop !== undefined ||
      resolvedPaddingBottom !== undefined ||
      resolvedPaddingLeft !== undefined ||
      resolvedPaddingRight !== undefined
        ? {
            top: resolvedPaddingTop ?? 0,
            bottom: resolvedPaddingBottom ?? 0,
            left: resolvedPaddingLeft ?? 0,
            right: resolvedPaddingRight ?? 0,
          }
        : undefined),
    shading:
      docxOptions.shading ??
      (backgroundColor
        ? {
            type: ShadingType.CLEAR,
            color: 'auto',
            fill: backgroundColor,
          }
        : undefined),
    verticalAlign:
      docxOptions.verticalAlign ??
      (verticalAlign === 'center'
        ? VerticalAlign.CENTER
        : verticalAlign === 'bottom'
          ? VerticalAlign.BOTTOM
          : VerticalAlign.TOP),
  });
}

export function createTable(node: DocxNodeOf<'TABLE'>): DocxTable {
  const tableStyle = node.props.style;
  const docxOptions = node.props.docx ?? {};
  const width = getStyleValue(tableStyle, 'width');
  const resolvedTableWidth = width !== undefined ? resolveWidth(width) : docxOptions.width;
  const alignment = toAlignment(getStyleValue(tableStyle, 'textAlign'));
  const rows = node.children
    .filter((child): child is DocxNodeOf<'TABLE_ROW'> => child.type === 'TABLE_ROW')
    .map((row) => {
      const rowDocxOptions = row.props.docx ?? {};

      return new DocxTableRow({
        ...rowDocxOptions,
        children: row.children
          .filter((child): child is DocxNodeOf<'TABLE_CELL'> => child.type === 'TABLE_CELL')
          .map((cell) => createTableCell(cell)),
      });
    });

  return new DocxTable({
    ...docxOptions,
    rows,
    alignment: docxOptions.alignment ?? alignment,
    width: docxOptions.width ??
      resolvedTableWidth ?? {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
  });
}
