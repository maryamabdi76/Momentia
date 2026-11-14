import type { CSSProperties, ReactNode } from 'react';
import { formatColors } from '../lib/format-colors';
import { formatFrame, getExportFormat, type ExportFormatId } from '../lib/export-formats';
import type { PosterStyle } from '../lib/themes';

type Props = {
  format: ExportFormatId;
  style: PosterStyle;
  /** Backdrop colour of the page, for posters whose colours are not a sky style. */
  mat?: string;
  /** The poster, drawn at the size the file gives it; it is placed and scaled by the frame. */
  children: ReactNode;
  /** Tallest the page may get on screen, as a share of the viewport height. */
  maxViewportHeight?: number;
};

/**
 * The page of the file that will be downloaded (story, wallpaper, A4 …) with the
 * poster on it, to scale. For the plain poster the page is the poster itself.
 *
 * The page is as wide as its column allows but never taller than `maxViewportHeight`,
 * so a tall phone wallpaper doesn't push the buttons below the fold.
 */
export function FormatPreviewFrame({
  format,
  style,
  mat: matOverride,
  children,
  maxViewportHeight = 78,
}: Props) {
  const { aspect, poster } = formatFrame(getExportFormat(format));
  const mat = matOverride ?? formatColors(style).mat;
  const plain = poster.width === 1 && poster.height === 1;

  // The plain poster keeps its usual size; only the taller pages are held to the viewport.
  const page: CSSProperties = plain
    ? { aspectRatio: String(aspect), width: '100%' }
    : {
        aspectRatio: String(aspect),
        width: `min(100%, ${(maxViewportHeight * aspect).toFixed(3)}vh)`,
        backgroundColor: mat,
      };
  const box: CSSProperties = {
    left: `${poster.left * 100}%`,
    top: `${poster.top * 100}%`,
    width: `${poster.width * 100}%`,
    height: `${poster.height * 100}%`,
  };

  return (
    <div
      data-format={format}
      // the plain poster carries its own shadow, which a clipped frame would cut off
      className={`relative mx-auto max-w-md ${plain ? '' : 'overflow-hidden rounded-[6px]'}`}
      style={page}
    >
      <div className="absolute" style={box}>
        {children}
      </div>
    </div>
  );
}
