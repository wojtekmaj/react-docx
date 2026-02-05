import { describe, expect, it } from 'vitest';

import { Document, Page, renderToBuffer, Text } from './index.js';

describe('renderToBuffer()', () => {
  it('renders a buffer for a simple document', async () => {
    const element = (
      <Document style={[{ fontFamily: 'Helvetica' }, { fontWeight: 700 }]}>
        <Page size="A4">
          <Text style={{ fontSize: 12 }}>"Hello"</Text>
        </Page>
      </Document>
    );

    const buffer = await renderToBuffer(element);

    expect(buffer.byteLength).toBeGreaterThan(0);
  });
});
