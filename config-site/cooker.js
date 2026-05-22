// "cooks" raw data into final barcode bitmaps

import { aztec, code128, datamatrix, pdf417, quickresponse } from "./barcode";

export function cook(entry) {
  const flat = entry.type === "code128";
  const widthOverride = { pdf417: 103 }[entry.type];
  return matrix_to_pbi(to_matrix(entry), flat, widthOverride);
}

// { name: string, type: string, data: string }
function to_matrix(entry) {
  return {
    code128,
    azteccode: aztec,
    datamatrix,
    pdf417,
    qrcode: quickresponse,
  }[entry.type]?.(entry.data);
}

// create pebble image
// loosely based on unlobito/skunk-config xbi.rb
// mat is an array of rows, so mat.length is height
function matrix_to_pbi(mat, flat, widthOverride) {
  const max_pixel_count = (256 - 3) * 8;
  const flat_barcode_height = 100;

  // by default assume 2D codes are square
  // this is only false for PDF417, then its always 103 unless changed in config
  // and for datamatrix, when rectangular mode is enabled in config
  // we do not allow changing that config for now, so this is fine.

  const width = widthOverride || (flat ? mat.length : mat.length);
  const height = flat ? flat_barcode_height : mat.length;

  const npixels = flat ? width : width * height;
  const data = new Uint8Array(3 + Math.ceil(npixels / 8));

  // pbi header
  data[0] = +flat;
  data[1] = width;
  data[2] = height;

  let working = 0;

  for (let i = 0; i < npixels; i++) {
    if (i + 1 > max_pixel_count) break;

    const x = i % width;
    const y = ~~(i / width);

    const value = (flat ? mat[x] : mat[y][x]) || 0;
    // shift over one and then add this pixel
    working = (working << 1) | value;

    if (i % 8 == 7) {
      data[3 + ~~(i / 8)] = working;
      working = 0;
    }
  }

  // convert to string for pebble use
  return String.fromCharCode(...data);
}
