import { Shape } from "three";

/*
 * TEMPORARY — 3D version of the rough logo trace (TemporaryApexMark).
 * Replace with the designer's SVG paths when they arrive (brief §6.1).
 * Coordinates are in the trace's SVG space (y down) and mapped to scene units.
 */
const CX = 615;
const CY = 581;
const UNIT = 300;

const map = (x: number, y: number): [number, number] => [(x - CX) / UNIT, -(y - CY) / UNIT];

function polygon(points: [number, number][]) {
  const shape = new Shape();
  points.forEach(([x, y], index) => {
    const [px, py] = map(x, y);
    if (index === 0) shape.moveTo(px, py);
    else shape.lineTo(px, py);
  });
  shape.closePath();
  return shape;
}

function swoosh() {
  const shape = new Shape();
  const m = (x: number, y: number) => map(x, y);
  shape.moveTo(...m(140, 985));
  shape.bezierCurveTo(...m(450, 990), ...m(800, 880), ...m(1040, 720));
  shape.bezierCurveTo(...m(1090, 680), ...m(1060, 630), ...m(960, 610));
  shape.bezierCurveTo(...m(1040, 650), ...m(1050, 690), ...m(1000, 725));
  shape.bezierCurveTo(...m(780, 870), ...m(450, 960), ...m(140, 985));
  shape.closePath();
  return shape;
}

export const apexShapes = {
  leftStroke: polygon([
    [640, 172],
    [712, 293],
    [330, 955],
    [200, 955],
  ]),
  rightStroke: polygon([
    [720, 318],
    [1080, 945],
    [940, 945],
    [652, 435],
  ]),
  bars: [
    polygon([
      [480, 800],
      [535, 778],
      [535, 895],
      [480, 915],
    ]),
    polygon([
      [562, 722],
      [618, 700],
      [618, 872],
      [562, 890],
    ]),
    polygon([
      [645, 640],
      [705, 615],
      [705, 850],
      [645, 865],
    ]),
  ],
  swoosh: swoosh(),
};
