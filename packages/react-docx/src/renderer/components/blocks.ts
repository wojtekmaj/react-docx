import { Paragraph } from 'docx';

import { createImageParagraph, createSvgImageParagraph } from './images.js';
import { createTable } from './table.js';
import { createParagraphFromText, createTextRunsFromString, isTextNode } from './text.js';

import type { Table as DocxTable } from 'docx';
import type { DocxChild, StyleInput } from '../types.js';

export function renderBlockNodes(
  nodes: DocxChild[],
  inheritedStyle?: StyleInput,
): (Paragraph | DocxTable)[] {
  const blocks: Array<Paragraph | DocxTable> = [];

  nodes.forEach((node) => {
    if (node.type === 'TEXT') {
      blocks.push(createParagraphFromText(node, inheritedStyle));
      return;
    }

    if (node.type === 'IMAGE') {
      blocks.push(createImageParagraph(node, inheritedStyle));
      return;
    }

    if (node.type === 'SVG') {
      blocks.push(createSvgImageParagraph(node, inheritedStyle));
      return;
    }

    if (node.type === 'TABLE') {
      blocks.push(createTable(node));
      return;
    }

    if (node.type === 'VIEW') {
      const viewStyle = node.props.style;
      const viewBlocks = renderBlockNodes(node.children, viewStyle);
      viewBlocks.forEach((block) => {
        blocks.push(block);
      });

      return;
    }

    if (isTextNode(node)) {
      blocks.push(
        new Paragraph({
          children: createTextRunsFromString(node.text, inheritedStyle),
        }),
      );
    }
  });

  return blocks;
}
