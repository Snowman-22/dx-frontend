/**
 * 프론트엔드 배치 제약 검증 (백엔드 constraint_validator.py 포팅)
 * DB 호출 없이 로컬에서 즉시 검증.
 */
import type { FloorPlanRoom, RoomFeature, Placement } from "@/types/simulation";

type Rect = [number, number, number, number]; // x1, y1, x2, y2

function getFootprint(w: number, d: number, rotation: number): [number, number] {
  return rotation === 90 || rotation === 270 ? [d, w] : [w, d];
}

function getRect(x: number, y: number, w: number, d: number): Rect {
  return [x - w / 2, y - d / 2, x + w / 2, y + d / 2];
}

function rectsOverlap(r1: Rect, r2: Rect): boolean {
  return !(r1[2] <= r2[0] || r2[2] <= r1[0] || r1[3] <= r2[1] || r2[3] <= r1[1]);
}

function getDoorSwingRect(door: RoomFeature, roomW: number, roomH: number): Rect {
  if (door.door_type === "slide") return [0, 0, 0, 0];
  const { wall, offset, width: dw } = door;
  if (wall === "north") return [offset, 0, offset + dw, dw];
  if (wall === "south") return [offset, roomH - dw, offset + dw, roomH];
  if (wall === "west") return [0, offset, dw, offset + dw];
  return [roomW - dw, offset, roomW, offset + dw];
}

function getDoorPassageZone(door: RoomFeature, roomW: number, roomH: number): Rect {
  const { wall, offset, width: dw } = door;
  const isSlide = door.door_type === "slide";
  const margin = isSlide ? 100 : 200;
  const depth = isSlide ? 300 : 800;

  if (wall === "north")
    return [Math.max(0, offset - margin), 0, Math.min(roomW, offset + dw + margin), depth];
  if (wall === "south")
    return [Math.max(0, offset - margin), roomH - depth, Math.min(roomW, offset + dw + margin), roomH];
  if (wall === "west")
    return [0, Math.max(0, offset - margin), depth, Math.min(roomH, offset + dw + margin)];
  return [roomW - depth, Math.max(0, offset - margin), roomW, Math.min(roomH, offset + dw + margin)];
}

function getWindowZone(win: RoomFeature, roomW: number, roomH: number): Rect {
  const { wall, offset, width: ww } = win;
  const clearance = 300;
  if (wall === "north") return [offset, 0, offset + ww, clearance];
  if (wall === "south") return [offset, roomH - clearance, offset + ww, roomH];
  if (wall === "west") return [0, offset, clearance, offset + ww];
  return [roomW - clearance, offset, roomW, offset + ww];
}

function getFixtureZone(fix: RoomFeature, roomW: number, roomH: number): Rect {
  const { wall, offset, width: fw } = fix;
  const depth = fix.depth ?? 600;
  if (wall === "north") return [offset, 0, offset + fw, depth];
  if (wall === "south") return [offset, roomH - depth, offset + fw, roomH];
  if (wall === "west") return [0, offset, depth, offset + fw];
  return [roomW - depth, offset, roomW, offset + fw];
}

/**
 * 단일 제품 배치를 검증합니다.
 * @returns 위반 사항 문자열 배열 (빈 배열 = 유효)
 */
export function validatePlacement(
  placement: Placement,
  room: FloorPlanRoom,
  otherPlacements: Placement[],
): string[] {
  const violations: string[] = [];
  const product = placement.product;
  if (!product?.width_mm || !product?.depth_mm) return ["치수 정보 없음"];

  const [fw, fd] = getFootprint(product.width_mm, product.depth_mm, placement.rotation);
  const rect = getRect(placement.x_mm, placement.y_mm, fw, fd);
  const roomW = room.width_mm;
  const roomH = room.height_mm;
  const myMount = product.mount_type ?? "floor";

  // 1. 방 경계 체크
  if (rect[0] < -1 || rect[1] < -1 || rect[2] > roomW + 1 || rect[3] > roomH + 1) {
    violations.push("방 경계를 벗어남");
  }

  // 2. 다른 제품과 겹침 (같은 mount_type끼리만)
  for (const other of otherPlacements) {
    const op = other.product;
    if (!op?.width_mm || !op?.depth_mm) continue;
    const otherMount = op.mount_type ?? "floor";
    if (myMount !== otherMount) continue;

    const [ofw, ofd] = getFootprint(op.width_mm, op.depth_mm, other.rotation);
    const orect = getRect(other.x_mm, other.y_mm, ofw, ofd);
    if (rectsOverlap(rect, orect)) {
      violations.push(`다른 제품과 겹침 (${op.category})`);
    }
  }

  // 벽면 제품은 문/창문 검사 스킵
  if (myMount !== "wall") {
    const features = room.features ?? [];

    // 3. 문 열림/통행 구역
    for (const feat of features) {
      if (feat.type === "door") {
        if (rectsOverlap(rect, getDoorSwingRect(feat, roomW, roomH))) {
          violations.push(`문 열림 공간 침범 (${feat.wall}벽)`);
        }
        if (rectsOverlap(rect, getDoorPassageZone(feat, roomW, roomH))) {
          violations.push(`문 통행 구역 침범 (${feat.wall}벽)`);
        }
      }
    }

    // 4. 창문 앞
    for (const feat of features) {
      if (feat.type === "window") {
        if (rectsOverlap(rect, getWindowZone(feat, roomW, roomH))) {
          violations.push(`창문 앞 공간 침범 (${feat.wall}벽)`);
        }
      }
    }
  }

  // 5. 빌트인 설비
  for (const feat of room.features ?? []) {
    if (feat.type === "fixture") {
      if (rectsOverlap(rect, getFixtureZone(feat, roomW, roomH))) {
        violations.push(`빌트인 설비 영역 침범 (${feat.label ?? "설비"}, ${feat.wall}벽)`);
      }
    }
  }

  return violations;
}
