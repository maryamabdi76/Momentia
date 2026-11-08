/**
 * The photo the "on the wall" preview uses, and where its blank frame is, in the photo's own
 * pixels. To change the photo, replace the file and measure the white rectangle again.
 */
export type WallMockup = {
  src: string;
  width: number;
  height: number;
  frame: { x: number; y: number; w: number; h: number };
};

export const WALL_MOCKUP: WallMockup = {
  src: '/mockups/living-room.jpg',
  width: 1024,
  height: 1536,
  frame: { x: 265, y: 175, w: 498, h: 760 },
};

/** The frame as percentages of the photo, so it can be placed at any rendered size. */
export function frameBox(m: WallMockup) {
  return {
    left: (m.frame.x / m.width) * 100,
    top: (m.frame.y / m.height) * 100,
    width: (m.frame.w / m.width) * 100,
    height: (m.frame.h / m.height) * 100,
  };
}
