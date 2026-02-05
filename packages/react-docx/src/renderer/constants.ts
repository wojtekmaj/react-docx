const TWIPS_PER_POINT = 20;
const HALF_POINTS_PER_POINT = 2;
const EMU_PER_POINT = 12700;
const PIXELS_PER_POINT: number = 96 / 72;

const transparentPngFallback: Buffer<ArrayBuffer> = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PdP7SAAAAABJRU5ErkJggg==',
  'base64',
);

export {
  EMU_PER_POINT,
  HALF_POINTS_PER_POINT,
  PIXELS_PER_POINT,
  TWIPS_PER_POINT,
  transparentPngFallback,
};
