[![npm](https://img.shields.io/npm/v/@wojtekmaj/react-docx.svg)](https://www.npmjs.com/package/@wojtekmaj/react-docx) ![downloads](https://img.shields.io/npm/dt/@wojtekmaj/react-docx.svg) [![CI](https://github.com/wojtekmaj/react-docx/actions/workflows/ci.yml/badge.svg)](https://github.com/wojtekmaj/react-docx/actions)

# React-DOCX

Render DOCX documents with React.

## tl;dr

- Install by executing `npm install @wojtekmaj/react-docx` or `yarn add @wojtekmaj/react-docx`.
- Setup by importing the elements you need.
- Render with `renderToBuffer` and save the output.

## Getting started

### Compatibility

Your project needs to use React 19.2 or later and run in a Node.js environment.

### Installation

Add React-DOCX to your project by executing `npm install @wojtekmaj/react-docx` or `yarn add @wojtekmaj/react-docx`.

### Usage

```ts
import { Document, Page, Text, renderToBuffer } from '@wojtekmaj/react-docx';

const element = (
	<Document>
		<Page size="A4">
			<Text>Hello DOCX</Text>
		</Page>
	</Document>
);

const buffer = await renderToBuffer(element);
```

## API overview

- `Document`, `Page`, `Text`, `View`, `Image`, `Svg`, `Path`, `Table`, `TableRow`, `TableCell`.
- `renderToBuffer(element)` returns a DOCX `Buffer`.

## License

The MIT License.

## Author

<table>
  <tr>
    <td >
      <img src="https://avatars.githubusercontent.com/u/5426427?v=4&s=128" width="64" height="64" alt="Wojciech Maj">
    </td>
    <td>
      <a href="https://github.com/wojtekmaj">Wojciech Maj</a>
    </td>
  </tr>
</table>
