import { createElement } from 'react';
import type { ReactElement } from 'react';

import type {
  DocumentProps,
  FooterProps,
  HeaderProps,
  ImageProps,
  PageProps,
  PathProps,
  Styles,
  SvgProps,
  TableCellProps,
  TableProps,
  TableRowProps,
  TextProps,
  ViewProps,
} from './types.js';

export function Document(props: DocumentProps): ReactElement {
  return createElement('DOCUMENT', props);
}

export function Page(props: PageProps): ReactElement {
  return createElement('PAGE', props);
}

export function View(props: ViewProps): ReactElement {
  return createElement('VIEW', props);
}

export function Text(props: TextProps): ReactElement {
  return createElement('TEXT', props);
}

export function Image(props: ImageProps): ReactElement {
  return createElement('IMAGE', props);
}

export function Svg(props: SvgProps): ReactElement {
  return createElement('SVG', props);
}

export function Path(props: PathProps): ReactElement {
  return createElement('PATH', props);
}

export function Table(props: TableProps): ReactElement {
  return createElement('TABLE', props);
}

export function TableRow(props: TableRowProps): ReactElement {
  return createElement('TABLE_ROW', props);
}

export function TableCell(props: TableCellProps): ReactElement {
  return createElement('TABLE_CELL', props);
}

export function Header(props: HeaderProps): ReactElement {
  return createElement('HEADER', props);
}

export function Footer(props: FooterProps): ReactElement {
  return createElement('FOOTER', props);
}

export const StyleSheet = {
  create<T extends Styles>(styles: T): T {
    return styles;
  },
};
