import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';

export interface BarcodeSvgProps {
  value: string;
  format?: 'CODE128';
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  textColor?: string;
  lineColor?: string;
  background?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Standard Code 128 (Subset B) Fallback Module Patterns for 100% offline/SVG compatibility.
 * Each character consists of 11 modules (3 bars and 3 spaces).
 */
const CODE128_PATTERNS: Record<number, string> = {
  0: '212222', 1: '222122', 2: '222221', 3: '121223', 4: '121322', 5: '131222',
  6: '122213', 7: '122312', 8: '132212', 9: '221213', 10: '221312', 11: '231212',
  12: '112232', 13: '122132', 14: '122231', 15: '113222', 16: '123122', 17: '123221',
  18: '223211', 19: '221132', 20: '221231', 21: '213212', 22: '223112', 23: '312131',
  24: '311222', 25: '321122', 26: '321221', 27: '312212', 28: '322112', 29: '322211',
  30: '212123', 31: '212321', 32: '232121', 33: '111323', 34: '131123', 35: '131321',
  36: '112313', 37: '132113', 38: '132311', 39: '211313', 40: '231113', 41: '231311',
  42: '112133', 43: '112331', 44: '132131', 45: '113123', 46: '113321', 47: '133121',
  48: '313121', 49: '211331', 50: '231131', 51: '213113', 52: '213311', 53: '213131',
  54: '311123', 55: '311321', 56: '331121', 57: '312113', 58: '312311', 59: '332111',
  60: '314111', 61: '221411', 62: '431111', 63: '111224', 64: '111422', 65: '121124',
  66: '121421', 67: '141122', 68: '141221', 69: '112214', 70: '112412', 71: '122114',
  72: '122411', 73: '142112', 74: '142211', 75: '241211', 76: '221114', 77: '413111',
  78: '241112', 79: '134111', 80: '111242', 81: '121142', 82: '121241', 83: '114212',
  84: '124112', 85: '124211', 86: '411212', 87: '421112', 88: '421211', 89: '212141',
  90: '214121', 91: '412121', 92: '111143', 93: '111341', 94: '131141', 95: '114113',
  96: '114311', 97: '411113', 98: '411311', 99: '113141', 100: '114131', 101: '311141',
  102: '411131', 103: '211412', 104: '211214', 105: '211232', 106: '2331112',
};

export function generateCode128BModules(text: string): boolean[] {
  const safeText = text || 'HRSJM';
  const codes: number[] = [104]; // Start B
  let checksum = 104;

  for (let i = 0; i < safeText.length; i++) {
    const code = safeText.charCodeAt(i) - 32;
    const validCode = code >= 0 && code <= 95 ? code : 0;
    codes.push(validCode);
    checksum += validCode * (i + 1);
  }

  codes.push(checksum % 103);
  codes.push(106); // Stop

  const modules: boolean[] = [false, false, false, false, false, false, false, false, false, false]; // Quiet zone

  for (const c of codes) {
    const pattern = CODE128_PATTERNS[c] || '212222';
    let isBar = true;
    for (let j = 0; j < pattern.length; j++) {
      const run = parseInt(pattern[j], 10);
      for (let k = 0; k < run; k++) {
        modules.push(isBar);
      }
      isBar = !isBar;
    }
  }

  // Right quiet zone
  for (let q = 0; q < 10; q++) modules.push(false);
  return modules;
}

export const BarcodeSvg: React.FC<BarcodeSvgProps> = ({
  value,
  format = 'CODE128',
  width = 1.5,
  height = 36,
  displayValue = true,
  fontSize = 10,
  textColor = '#000000',
  lineColor = '#000000',
  background = 'transparent',
  className = '',
  style,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    if (!svgRef.current || !value) return;

    try {
      JsBarcode(svgRef.current, String(value), {
        format,
        width,
        height,
        displayValue,
        fontSize,
        font: 'monospace',
        fontOptions: 'bold',
        textMargin: 2,
        lineColor,
        background,
        margin: 0,
      });
      setUseFallback(false);
    } catch (err) {
      console.warn('JsBarcode direct render warning, using SVG fallback:', err);
      setUseFallback(true);
    }
  }, [value, format, width, height, displayValue, fontSize, textColor, lineColor, background]);

  if (useFallback) {
    const modules = generateCode128BModules(value);
    const totalW = modules.length * width;
    const totalH = height + (displayValue ? fontSize + 6 : 0);

    return (
      <svg
        viewBox={`0 0 ${totalW} ${totalH}`}
        className={className}
        style={{ maxWidth: '100%', height: 'auto', ...style }}
      >
        {background !== 'transparent' && (
          <rect width={totalW} height={totalH} fill={background} />
        )}
        {modules.map((isBar, idx) =>
          isBar ? (
            <rect
              key={idx}
              x={idx * width}
              y={0}
              width={width}
              height={height}
              fill={lineColor}
            />
          ) : null
        )}
        {displayValue && (
          <text
            x={totalW / 2}
            y={height + fontSize + 2}
            textAnchor="middle"
            fill={textColor}
            fontSize={fontSize}
            fontFamily="monospace"
            fontWeight="bold"
          >
            {value}
          </text>
        )}
      </svg>
    );
  }

  return (
    <svg
      ref={svgRef}
      className={className}
      style={{ maxWidth: '100%', height: 'auto', ...style }}
    />
  );
};
