/**
 * Authentic, standards-compliant QR Code generator for HRSJM ID Card.
 * Generates an official, high-contrast, 100% scannable ISO/IEC 18004 QR matrix.
 */
import QRCode from 'qrcode';

const qrCache = new Map<string, boolean[][]>();

export function generateQrMatrix(data: string, _size = 25): boolean[][] {
  const safeData =
    data && typeof data === 'string' && data.trim().length > 0
      ? data.trim()
      : 'HRSJM-VALID';

  if (qrCache.has(safeData)) {
    return qrCache.get(safeData)!;
  }

  try {
    const qr = QRCode.create(safeData, {
      errorCorrectionLevel: 'M',
    });
    const size = qr.modules.size;
    const bytes = qr.modules.data;
    const matrix: boolean[][] = [];
    for (let row = 0; row < size; row += 1) {
      const line: boolean[] = [];
      for (let col = 0; col < size; col += 1) {
        line.push(Boolean(bytes[row * size + col]));
      }
      matrix.push(line);
    }
    qrCache.set(safeData, matrix);
    return matrix;
  } catch (err) {
    console.error('Failed to generate real QR code matrix:', err);
    return [];
  }
}
