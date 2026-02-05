import type {
  IFloating,
  IParagraphOptions,
  IPropertiesOptions,
  IRunOptions,
  ISectionPropertiesOptions,
  IStylesOptions,
  ITableCellOptions,
  ITableOptions,
  ITableRowOptions,
} from 'docx';
import type { ReactNode } from 'react';

/**
 * Length values used by react-docx.
 *
 * Numbers are interpreted as points (pt). String values may include a unit
 * suffix ("pt", "px", "in", "cm", "mm", "pc", "pi").
 */
type LengthUnit = 'pt' | 'px' | 'in' | 'cm' | 'mm' | 'pc' | 'pi';

/**
 * Unit-bearing length values supported by docx (plus pixels for convenience).
 */
export type Length = number | `${number}${LengthUnit}` | `-${number}${LengthUnit}`;

/**
 * Percentage string (e.g. "50%"). Useful for widths.
 */
export type Percentage = `${number}%`;

/**
 * Size value that supports absolute units or percentages.
 */
export type SizeValue = Length | Percentage;

/**
 * Page orientation values supported by docx.
 */
export type PageOrientation = 'portrait' | 'landscape';

/**
 * Page size input.
 *
 * Use "A4" for the default A4 size, or provide custom dimensions.
 * Numbers are interpreted as points; string values can use units.
 */
export type PageSize =
  | 'A4'
  | {
      code?: number;
      height: Length;
      orientation?: PageOrientation;
      width: Length;
    };

/**
 * Additional document-level docx options (excluding sections and core metadata).
 */
export type DocxDocumentOptions = Omit<
  IPropertiesOptions,
  'sections' | 'styles' | 'creator' | 'description' | 'keywords' | 'subject' | 'title'
>;

/**
 * Paragraph options that can be passed through to docx.
 */
export type ParagraphOptions = Omit<IParagraphOptions, 'children' | 'text'>;

/**
 * Run options that can be passed through to docx.
 */
export type RunOptions = Omit<IRunOptions, 'children' | 'text'>;

/**
 * Table options that can be passed through to docx.
 */
export type TableOptions = Omit<ITableOptions, 'rows'>;

/**
 * Table row options that can be passed through to docx.
 */
export type TableRowOptions = Omit<ITableRowOptions, 'children'>;

/**
 * Table cell options that can be passed through to docx.
 */
export type TableCellOptions = Omit<ITableCellOptions, 'children'>;

/**
 * Border style tokens supported by docx borders.
 */
export type BorderStyleValue =
  | 'none'
  | 'single'
  | 'dashed'
  | 'dotted'
  | 'double'
  | 'thick'
  | 'thin'
  | (string & {});

/**
 * Border configuration for a single side.
 */
export type BorderSideStyle = {
  color?: string;
  size?: number;
  style?: BorderStyleValue;
};

/**
 * Border configuration per edge.
 */
export type BordersStyle = {
  bottom?: BorderSideStyle;
  left?: BorderSideStyle;
  right?: BorderSideStyle;
  top?: BorderSideStyle;
};

/**
 * Paragraph alignment values.
 */
export type TextAlign = 'center' | 'justify' | 'left' | 'right';
/**
 * Vertical alignment values used in table cells.
 */
export type VerticalAlign = 'bottom' | 'center' | 'top';
/**
 * Positioning options for floating images.
 */
export type Position = 'absolute' | 'relative' | 'static';
/**
 * Supported text decoration strings.
 */
export type TextDecoration =
  | 'none'
  | 'underline'
  | 'line-through'
  | 'underline line-through'
  | 'line-through underline';

/**
 * Styling for react-docx elements.
 *
 * All numeric values are in points (pt) unless otherwise noted.
 */
export type Style = {
  backgroundColor?: string;
  behindDocument?: boolean;
  /**
   * Control capitalization for text runs.
   */
  allCaps?: boolean;
  borderBottomColor?: string;
  borderBottomWidth?: number;
  borderLeftColor?: string;
  borderLeftWidth?: number;
  borderRightColor?: string;
  borderRightWidth?: number;
  borderTopColor?: string;
  borderTopWidth?: number;
  borders?: BordersStyle;
  bottom?: Length;
  color?: string;
  fontFamily?: string;
  fontSize?: number;
  /**
   * CSS-style font weight. Numbers >= 600 are treated as bold.
   */
  fontWeight?: number | 'bold';
  /**
   * CSS-style font style.
   */
  fontStyle?: 'normal' | 'italic';
  /**
   * Height in points or unit string (e.g. "24pt", "10mm").
   */
  height?: Length | string;
  /**
   * Highlight text with a docx highlight color name (e.g. "yellow").
   */
  highlight?: RunOptions['highlight'];
  left?: Length;
  /**
   * Additional spacing between characters (in points or unit string).
   */
  letterSpacing?: Length;
  lineHeight?: number;
  marginBottom?: Length;
  marginLeft?: Length;
  marginRight?: Length;
  marginTop?: Length;
  padding?: Length;
  paddingBottom?: Length;
  paddingHorizontal?: Length;
  paddingLeft?: Length;
  paddingRight?: Length;
  paddingTop?: Length;
  paddingVertical?: Length;
  position?: Position;
  right?: Length;
  /**
   * Use small caps when true.
   */
  smallCaps?: boolean;
  /**
   * Apply subscript formatting when true.
   */
  subScript?: boolean;
  /**
   * Apply superscript formatting when true.
   */
  superScript?: boolean;
  textAlign?: TextAlign;
  /**
   * Text decoration string (e.g. "underline", "line-through").
   */
  textDecoration?: TextDecoration;
  /**
   * Optional decoration color, defaults to the text color.
   */
  textDecorationColor?: string;
  /**
   * First-line indent (in points).
   */
  textIndent?: Length;
  top?: Length;
  /**
   * Apply a strike-through.
   */
  strike?: boolean;
  /**
   * Apply double strike-through.
   */
  doubleStrike?: boolean;
  /**
   * Apply underline (single) when true.
   */
  underline?: boolean;
  verticalAlign?: VerticalAlign;
  /**
   * Width in points, unit string, or percentage (percentage is used for tables).
   */
  width?: SizeValue | string;
  zIndex?: number;
};

/**
 * A record of named styles.
 */
export type Styles = Record<string, Style>;

/**
 * Style input supports a single style or an array (React Native style pattern).
 */
export type StyleInput = Style | Array<Style | false | null | undefined>;

/**
 * Root document properties.
 */
export type DocumentProps = {
  children?: ReactNode;
  creator?: string;
  description?: string;
  keywords?: string | string[];
  language?: string;
  style?: StyleInput;
  styles?: IStylesOptions;
  subject?: string;
  title?: string;
  /**
   * Additional docx document options (excluding sections and core metadata).
   */
  docx?: DocxDocumentOptions;
};

/**
 * Page/section properties.
 */
export type PageProps = {
  children?: ReactNode;
  size?: PageSize;
  /**
   * Additional section properties to merge into the generated section.
   */
  properties?: ISectionPropertiesOptions;
  style?: StyleInput;
};

/**
 * View container properties (used for grouping and style inheritance).
 */
export type ViewProps = {
  children?: ReactNode;
  style?: StyleInput;
};

/**
 * Paragraph/text node properties.
 */
export type TextProps = {
  children?: ReactNode;
  /**
   * Additional paragraph options passed to docx (children/text are ignored).
   */
  paragraph?: ParagraphOptions;
  /**
   * Additional run options passed to docx (children/text are ignored).
   */
  run?: RunOptions;
  style?: StyleInput;
};

/**
 * Image node properties.
 */
export type ImageProps = {
  altText?: {
    description: string;
    name: string;
    title: string;
  };
  fallback?: {
    data: Uint8Array | ArrayBuffer | string;
    type: 'bmp' | 'gif' | 'jpg' | 'jpeg' | 'png';
  };
  /**
   * Override floating positioning for this image.
   */
  floating?: IFloating;
  src: Uint8Array | ArrayBuffer | string;
  style?: StyleInput;
  /**
   * Override the computed transformation (width/height in pixels).
   */
  transformation?: {
    height: number;
    width: number;
  };
  type?: 'bmp' | 'gif' | 'jpg' | 'jpeg' | 'png' | 'svg';
};

/**
 * Inline SVG properties for converting to an image run.
 */
export type SvgProps = {
  children?: ReactNode;
  /**
   * Alternative text metadata for the generated image run.
   */
  altText?: {
    description: string;
    name: string;
    title: string;
  };
  /**
   * Override floating positioning for this SVG.
   */
  floating?: IFloating;
  height?: number;
  style?: StyleInput;
  /**
   * Override the computed transformation (width/height in pixels).
   */
  transformation?: {
    height: number;
    width: number;
  };
  viewBox?: string;
  width?: number;
};

/**
 * SVG path properties for inline SVG rendering.
 */
export type PathProps = {
  d: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
};

/**
 * Table properties.
 */
export type TableProps = {
  children?: ReactNode;
  /**
   * Additional table options passed to docx (rows are ignored).
   */
  docx?: TableOptions;
  style?: StyleInput;
};

/**
 * Table row properties.
 */
export type TableRowProps = {
  children?: ReactNode;
  /**
   * Additional table row options passed to docx (children are ignored).
   */
  docx?: TableRowOptions;
  style?: StyleInput;
};

/**
 * Table cell properties.
 */
export type TableCellProps = {
  children?: ReactNode;
  columnSpan?: number;
  /**
   * Additional table cell options passed to docx (children are ignored).
   */
  docx?: TableCellOptions;
  rowSpan?: number;
  style?: StyleInput;
  width?: SizeValue | string;
};

/**
 * Header node properties.
 */
export type HeaderProps = {
  children?: ReactNode;
  /**
   * Header type for the section.
   */
  type?: 'default' | 'first' | 'even';
};

/**
 * Footer node properties.
 */
export type FooterProps = {
  children?: ReactNode;
  /**
   * Footer type for the section.
   */
  type?: 'default' | 'first' | 'even';
};

/**
 * Internal text node emitted by the reconciler.
 */
export type TextNode = {
  text: string;
  type: 'TEXT_INSTANCE';
};

/**
 * Internal node type tags used by the renderer.
 */
export type DocxNodeType =
  | 'DOCUMENT'
  | 'PAGE'
  | 'VIEW'
  | 'TEXT'
  | 'IMAGE'
  | 'SVG'
  | 'PATH'
  | 'TABLE'
  | 'TABLE_ROW'
  | 'TABLE_CELL'
  | 'HEADER'
  | 'FOOTER';

export type DocxPropsByType = {
  document: DocumentProps;
  footer: FooterProps;
  header: HeaderProps;
  image: ImageProps;
  page: PageProps;
  path: PathProps;
  svg: SvgProps;
  table: TableProps;
  table_cell: TableCellProps;
  table_row: TableRowProps;
  text: TextProps;
  view: ViewProps;
};

export type DocxPropsFor<TType extends DocxNodeType> = DocxPropsByType[Lowercase<TType>];

export type DocxProps = DocxPropsFor<DocxNodeType>;

export type DocxNode =
  | {
      children: DocxChild[];
      props: DocumentProps;
      type: 'DOCUMENT';
    }
  | {
      children: DocxChild[];
      props: FooterProps;
      type: 'FOOTER';
    }
  | {
      children: DocxChild[];
      props: HeaderProps;
      type: 'HEADER';
    }
  | {
      children: DocxChild[];
      props: ImageProps;
      type: 'IMAGE';
    }
  | {
      children: DocxChild[];
      props: PageProps;
      type: 'PAGE';
    }
  | {
      children: DocxChild[];
      props: PathProps;
      type: 'PATH';
    }
  | {
      children: DocxChild[];
      props: SvgProps;
      type: 'SVG';
    }
  | {
      children: DocxChild[];
      props: TableProps;
      type: 'TABLE';
    }
  | {
      children: DocxChild[];
      props: TableCellProps;
      type: 'TABLE_CELL';
    }
  | {
      children: DocxChild[];
      props: TableRowProps;
      type: 'TABLE_ROW';
    }
  | {
      children: DocxChild[];
      props: TextProps;
      type: 'TEXT';
    }
  | {
      children: DocxChild[];
      props: ViewProps;
      type: 'VIEW';
    };

export type DocxNodeOf<TType extends DocxNodeType> = Extract<DocxNode, { type: TType }>;

export type DocxChild = DocxNode | TextNode;

export type Container = {
  children: DocxChild[];
};

export type HostContext = {
  isInsideText: boolean;
};
