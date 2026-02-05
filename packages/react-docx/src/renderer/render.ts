import {
  convertMillimetersToTwip,
  Document,
  Footer as DocxFooter,
  Header as DocxHeader,
  Packer,
} from 'docx';

import { renderBlockNodes } from './components/blocks.js';
import { reconciler } from './host-config.js';
import { getStyleValue, resolveLength, toTwip } from './style.js';

import type { IPageMarginAttributes } from 'docx';
import type { ReactNode } from 'react';
import type {
  Container,
  DocxChild,
  DocxNodeOf,
  DocxNodeType,
  Length,
  PageSize,
  StyleInput,
} from './types.js';

function findChildByType<TType extends DocxNodeType>(
  nodes: DocxChild[],
  type: TType,
): DocxNodeOf<TType> | undefined {
  return nodes.find((node): node is DocxNodeOf<TType> => node.type === type);
}

function findChildrenByType<TType extends DocxNodeType>(
  nodes: DocxChild[],
  type: TType,
): DocxNodeOf<TType>[] {
  return nodes.filter((node): node is DocxNodeOf<TType> => node.type === type);
}

function resolveDocumentStyles(
  style: StyleInput | undefined,
  language?: string,
  styles?: Record<string, unknown>,
) {
  const fontFamily = getStyleValue(style, 'fontFamily');

  if (!fontFamily && !language) {
    return styles;
  }

  const baseDefaultRun: Record<string, unknown> = {
    ...(fontFamily ? { font: fontFamily } : {}),
    ...(language ? { language: { value: language } } : {}),
  };

  const resolvedDefault = {
    document: {
      run: baseDefaultRun,
    },
  };

  if (!styles) {
    return { default: resolvedDefault };
  }

  const stylesRecord = styles as Record<string, unknown>;
  const userDefault = stylesRecord.default as Record<string, unknown> | undefined;
  const userDocument = (userDefault?.document as Record<string, unknown> | undefined) ?? {};
  const userRun = (userDocument.run as Record<string, unknown> | undefined) ?? {};

  return {
    ...stylesRecord,
    default: {
      ...resolvedDefault,
      ...userDefault,
      document: {
        ...resolvedDefault.document,
        ...userDocument,
        run: {
          ...baseDefaultRun,
          ...userRun,
        },
      },
    },
  };
}

function resolvePageSize(size?: PageSize) {
  if (!size) {
    return undefined;
  }

  if (size === 'A4') {
    return {
      width: convertMillimetersToTwip(210),
      height: convertMillimetersToTwip(297),
    };
  }

  const width = resolveLength(size.width);
  const height = resolveLength(size.height);

  if (width === undefined || height === undefined) {
    return undefined;
  }

  return {
    width: toTwip(width),
    height: toTwip(height),
    ...(size.code !== undefined ? { code: size.code } : {}),
    ...(size.orientation ? { orientation: size.orientation } : {}),
  };
}

function toTwipFromLength(value?: Length | string | number) {
  const resolved = resolveLength(value);
  return resolved !== undefined ? toTwip(resolved) : undefined;
}

function resolvePageMargins(style?: StyleInput): IPageMarginAttributes | undefined {
  const padding = getStyleValue(style, 'padding');
  const paddingHorizontal = getStyleValue(style, 'paddingHorizontal');
  const paddingVertical = getStyleValue(style, 'paddingVertical');

  const topValue = getStyleValue(style, 'paddingTop') ?? paddingVertical ?? padding;
  const bottomValue = getStyleValue(style, 'paddingBottom') ?? paddingVertical ?? padding;
  const leftValue = getStyleValue(style, 'paddingLeft') ?? paddingHorizontal ?? padding;
  const rightValue = getStyleValue(style, 'paddingRight') ?? paddingHorizontal ?? padding;

  const top = toTwipFromLength(topValue);
  const bottom = toTwipFromLength(bottomValue);
  const left = toTwipFromLength(leftValue);
  const right = toTwipFromLength(rightValue);

  if (top === undefined && bottom === undefined && left === undefined && right === undefined) {
    return undefined;
  }

  return { top, bottom, left, right };
}

function mergeDefined<T extends Record<string, unknown>>(base: T | undefined, next: T | undefined) {
  if (!base && !next) {
    return undefined;
  }

  return {
    ...(base ?? {}),
    ...(next ?? {}),
  } as T;
}

function buildDocxDocument(container: Container) {
  const docNode = findChildByType(container.children, 'DOCUMENT');

  if (!docNode) {
    throw new Error('Document root is missing.');
  }

  const pages = findChildrenByType(docNode.children, 'PAGE');

  const resolvedStyles = resolveDocumentStyles(
    docNode.props.style,
    docNode.props.language,
    docNode.props.styles as Record<string, unknown> | undefined,
  );

  type HeaderFooterGroup<T> = Partial<Record<'default' | 'first' | 'even', T>>;

  const sectionResults = pages.map((page) => {
    const headerNodes = findChildrenByType(page.children, 'HEADER');
    const footerNodes = findChildrenByType(page.children, 'FOOTER');

    const contentNodes = page.children.filter(
      (child) => child.type !== 'HEADER' && child.type !== 'FOOTER',
    );

    const pageStyle = page.props.style;
    const basePageSize = resolvePageSize(page.props.size);
    const pageProperties = page.props.properties;
    const pageFromProps = pageProperties?.page;
    const mergedPageSize = mergeDefined(basePageSize, pageFromProps?.size);
    const defaultPageSize =
      !mergedPageSize && !pageFromProps?.size && !page.props.size
        ? resolvePageSize('A4')
        : undefined;
    const finalPageSize = mergedPageSize ?? defaultPageSize;
    const resolvedMargins = resolvePageMargins(pageStyle);
    const mergedMargins = mergeDefined(resolvedMargins, pageFromProps?.margin);

    const headers = headerNodes.reduce<HeaderFooterGroup<DocxHeader>>((acc, node) => {
      const type = node.props.type ?? 'default';
      acc[type] = new DocxHeader({
        children: renderBlockNodes(node.children),
      });
      return acc;
    }, {});

    const footers = footerNodes.reduce<HeaderFooterGroup<DocxFooter>>((acc, node) => {
      const type = node.props.type ?? 'default';
      acc[type] = new DocxFooter({
        children: renderBlockNodes(node.children),
      });
      return acc;
    }, {});

    const hasFirstHeaderFooter = 'first' in headers || 'first' in footers;

    const properties = {
      ...(pageProperties ?? {}),
      ...(finalPageSize || mergedMargins || pageFromProps
        ? {
            page: {
              ...(pageFromProps ?? {}),
              ...(finalPageSize ? { size: finalPageSize } : {}),
              ...(mergedMargins ? { margin: mergedMargins } : {}),
            },
          }
        : {}),
      ...(pageProperties?.titlePage === undefined && hasFirstHeaderFooter
        ? { titlePage: true }
        : {}),
    };

    return {
      hasEvenHeaderFooter: 'even' in headers || 'even' in footers,
      properties,
      headers: Object.keys(headers).length > 0 ? headers : undefined,
      footers: Object.keys(footers).length > 0 ? footers : undefined,
      children: renderBlockNodes(contentNodes),
    };
  });

  const needsEvenOddHeaders = sectionResults.some((section) => section.hasEvenHeaderFooter);

  const keywords = Array.isArray(docNode.props.keywords)
    ? docNode.props.keywords.join(', ')
    : docNode.props.keywords;

  return new Document({
    ...(docNode.props.docx ?? {}),
    creator: docNode.props.creator,
    description: docNode.props.description,
    keywords,
    styles: resolvedStyles,
    subject: docNode.props.subject,
    title: docNode.props.title,
    ...(docNode.props.docx?.evenAndOddHeaderAndFooters === undefined && needsEvenOddHeaders
      ? { evenAndOddHeaderAndFooters: true }
      : {}),
    sections: sectionResults.map(({ hasEvenHeaderFooter, ...section }) => section),
  });
}

/**
 * Render a React element tree into a DOCX buffer using docx.js.
 */
async function renderToBuffer(element: ReactNode): ReturnType<typeof Packer.toBuffer> {
  const container: Container = { children: [] };
  const root = reconciler.createContainer(
    container,
    0,
    null,
    false,
    null,
    '',
    (error) => {
      console.error('Uncaught error in DOCX renderer:', error);
    },
    (error) => {
      console.error('Caught error in DOCX renderer:', error);
    },
    (error) => {
      console.error('Recoverable error in DOCX renderer:', error);
    },
    () => {},
  );

  reconciler.updateContainerSync(element, root, null, () => {});
  reconciler.flushSyncWork();

  const doc = buildDocxDocument(container);

  return Packer.toBuffer(doc);
}

export { renderToBuffer };
