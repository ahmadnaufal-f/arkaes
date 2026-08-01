// Reads intrinsic pixel dimensions straight from an image file's header, so
// prerendered pages can emit width/height on <img> tags for assets that live in
// public/ (which Astro serves verbatim — there's no <Image> pipeline handing us
// the size). Without those attributes the browser can't reserve the box before
// the bytes arrive, and the surrounding content shifts on load.
//
// Header parsing rather than a dependency: only PNG and JPEG are used here, and
// both put their dimensions in a fixed, trivially-locatable spot.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export interface ImageSize {
  width: number;
  height: number;
}

/** apps/portfolio/public/ — resolved from this module, not from cwd. */
const PUBLIC_DIR = new URL("../../public/", import.meta.url);

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const readPngSize = (buffer: Buffer): ImageSize | null => {
  // 8-byte signature, then the IHDR chunk: 4-byte length, "IHDR", w, h.
  if (buffer.length < 24) return null;
  if (!buffer.subarray(0, 8).equals(PNG_SIGNATURE)) return null;
  if (buffer.subarray(12, 16).toString("latin1") !== "IHDR") return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
};

// Start-of-Frame markers carry the dimensions. 0xC4 (define Huffman table),
// 0xC8 (JPEG extension) and 0xCC (arithmetic coding conditioning) share the
// 0xC0-0xCF range but are not frame headers, so they're excluded.
const isStartOfFrame = (marker: number) =>
  marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;

const readJpegSize = (buffer: Buffer): ImageSize | null => {
  if (buffer.length < 4 || buffer.readUInt16BE(0) !== 0xffd8) return null;

  let offset = 2;
  while (offset + 9 < buffer.length) {
    // Segments are 0xFF followed by the marker; padding 0xFF bytes are legal.
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1]!;
    if (marker === 0xff) {
      offset += 1;
      continue;
    }
    if (isStartOfFrame(marker)) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }
    // Otherwise skip this segment: 2 marker bytes + the declared length.
    const length = buffer.readUInt16BE(offset + 2);
    if (length < 2) return null;
    offset += 2 + length;
  }
  return null;
};

/**
 * Intrinsic size of an image in public/, addressed by its site-root path
 * (e.g. "/projects/treely-app/1.jpeg"). Returns null for anything unreadable
 * or unrecognised — callers should then simply omit width/height rather than
 * guess, and a missing screenshot must never fail the build.
 */
export const getPublicImageSize = (publicPath: string): ImageSize | null => {
  try {
    const file = fileURLToPath(
      new URL(publicPath.replace(/^\//, ""), PUBLIC_DIR),
    );
    // The header is all we need; 64 KiB comfortably covers the JPEG segments
    // that precede the frame header without reading multi-megabyte payloads.
    const buffer = readFileSync(file).subarray(0, 65_536);
    return readPngSize(buffer) ?? readJpegSize(buffer);
  } catch {
    return null;
  }
};
