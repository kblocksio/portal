interface Point {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface Line {
  start: Point;
  end: Point;
}

export function getConnectingLineWithoutCrossing(
  centerPos1: Point,
  size1: Size,
  centerPos2: Point,
  size2: Size,
): Line {
  // Calculate the direction from centerPos1 to centerPos2
  const dx = centerPos2.x - centerPos1.x;
  const dy = centerPos2.y - centerPos1.y;
  const angle = Math.atan2(dy, dx);

  // Calculate half dimensions for each rectangle
  const halfWidth1 = size1.width / 2;
  const halfHeight1 = size1.height / 2;
  const halfWidth2 = size2.width / 2;
  const halfHeight2 = size2.height / 2;

  // Calculate the start point on the boundary of the first rectangle
  const scale1 = Math.min(
    halfWidth1 / Math.abs(Math.cos(angle)),
    halfHeight1 / Math.abs(Math.sin(angle)),
  );
  const startX = centerPos1.x + scale1 * Math.cos(angle);
  const startY = centerPos1.y + scale1 * Math.sin(angle);
  const startPoint: Point = { x: startX, y: startY };

  // Calculate the end point on the boundary of the second rectangle
  const scale2 = Math.min(
    halfWidth2 / Math.abs(Math.cos(angle)),
    halfHeight2 / Math.abs(Math.sin(angle)),
  );
  const endX = centerPos2.x - scale2 * Math.cos(angle);
  const endY = centerPos2.y - scale2 * Math.sin(angle);
  const endPoint: Point = { x: endX, y: endY };

  return {
    start: startPoint,
    end: endPoint,
  };
}
