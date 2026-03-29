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

function getDoorPassageZones(door: RoomFeature, roomW: number, roomH: number): Rect[] {
  const { wall, offset, width: dw } = door;
  const isSlide = door.door_type === "slide";
  const margin = isSlide ? 100 : 300;
  const depthInward = isSlide ? 300 : 700;   // 방 안쪽으로
  // depthOutward는 getAdjacentDoorZones에서 처리

  // 문 안쪽 + 바깥쪽 양방향 통행 구역
  if (wall === "north") {
    const x1 = Math.max(0, offset - margin);
    const x2 = Math.min(roomW, offset + dw + margin);
    // 안쪽: 북벽에서 아래로
    // 바깥쪽은 방 밖이므로 방 내부 좌표로는 음수 → 0으로 clamp됨
    return [[x1, 0, x2, depthInward]];
  }
  if (wall === "south") {
    const x1 = Math.max(0, offset - margin);
    const x2 = Math.min(roomW, offset + dw + margin);
    return [[x1, roomH - depthInward, x2, roomH]];
  }
  if (wall === "west") {
    const y1 = Math.max(0, offset - margin);
    const y2 = Math.min(roomH, offset + dw + margin);
    return [[0, y1, depthInward, y2]];
  }
  // east
  const y1 = Math.max(0, offset - margin);
  const y2 = Math.min(roomH, offset + dw + margin);
  return [[roomW - depthInward, y1, roomW, y2]];
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
 * 인접 방의 문이 현재 방 쪽으로 열리는 경우, 현재 방 좌표계에서의 통행 구역을 반환합니다.
 */
function getAdjacentDoorZones(currentRoom: FloorPlanRoom, allRooms: FloorPlanRoom[]): Rect[] {
  const zones: Rect[] = [];
  const cr = currentRoom;
  const margin = 80;
  const depth = 400;

  for (const otherRoom of allRooms) {
    if (otherRoom.id === cr.id) continue;
    const or = otherRoom;
    for (const feat of or.features ?? []) {
      if (feat.type !== "door") continue;

      // 다른 방의 문 위치를 전체 좌표로 변환
      let doorGlobalX = 0, doorGlobalY = 0, doorW = feat.width;
      let isHorizontalWall = false;

      if (feat.wall === "north") {
        doorGlobalX = or.x_mm + feat.offset;
        doorGlobalY = or.y_mm;
        isHorizontalWall = true;
      } else if (feat.wall === "south") {
        doorGlobalX = or.x_mm + feat.offset;
        doorGlobalY = or.y_mm + or.height_mm;
        isHorizontalWall = true;
      } else if (feat.wall === "west") {
        doorGlobalX = or.x_mm;
        doorGlobalY = or.y_mm + feat.offset;
        isHorizontalWall = false;
      } else {
        doorGlobalX = or.x_mm + or.width_mm;
        doorGlobalY = or.y_mm + feat.offset;
        isHorizontalWall = false;
      }

      // 현재 방과 인접한 문인지 확인 (문 위치가 현재 방의 벽에 닿는지)
      if (isHorizontalWall) {
        // 문이 수평 벽에 있음 → 현재 방의 위쪽 또는 아래쪽 벽과 맞닿는지
        const doorX1 = doorGlobalX;
        const doorX2 = doorGlobalX + doorW;
        const overlapX = Math.max(0, Math.min(doorX2, cr.x_mm + cr.width_mm) - Math.max(doorX1, cr.x_mm));
        if (overlapX <= 0) continue;

        if (Math.abs(doorGlobalY - cr.y_mm) < 5) {
          // 현재 방의 북쪽 벽과 맞닿음 → 안쪽으로 통행구역
          const lx = Math.max(0, doorX1 - cr.x_mm - margin);
          const rx = Math.min(cr.width_mm, doorX2 - cr.x_mm + margin);
          zones.push([lx, 0, rx, depth]);
        } else if (Math.abs(doorGlobalY - (cr.y_mm + cr.height_mm)) < 5) {
          // 현재 방의 남쪽 벽과 맞닿음
          const lx = Math.max(0, doorX1 - cr.x_mm - margin);
          const rx = Math.min(cr.width_mm, doorX2 - cr.x_mm + margin);
          zones.push([lx, cr.height_mm - depth, rx, cr.height_mm]);
        }
      } else {
        // 문이 수직 벽에 있음
        const doorY1 = doorGlobalY;
        const doorY2 = doorGlobalY + doorW;
        const overlapY = Math.max(0, Math.min(doorY2, cr.y_mm + cr.height_mm) - Math.max(doorY1, cr.y_mm));
        if (overlapY <= 0) continue;

        if (Math.abs(doorGlobalX - cr.x_mm) < 5) {
          // 현재 방의 서쪽 벽과 맞닿음
          const ty = Math.max(0, doorY1 - cr.y_mm - margin);
          const by = Math.min(cr.height_mm, doorY2 - cr.y_mm + margin);
          zones.push([0, ty, depth, by]);
        } else if (Math.abs(doorGlobalX - (cr.x_mm + cr.width_mm)) < 5) {
          // 현재 방의 동쪽 벽과 맞닿음
          const ty = Math.max(0, doorY1 - cr.y_mm - margin);
          const by = Math.min(cr.height_mm, doorY2 - cr.y_mm + margin);
          zones.push([cr.width_mm - depth, ty, cr.width_mm, by]);
        }
      }
    }
  }
  return zones;
}

/**
 * 단일 제품 배치를 검증합니다.
 * @returns 위반 사항 문자열 배열 (빈 배열 = 유효)
 */
export function validatePlacement(
  placement: Placement,
  room: FloorPlanRoom,
  otherPlacements: Placement[],
  allRooms?: FloorPlanRoom[],
): string[] {
  const violations: string[] = [];
  const product = placement.product;
  if (!product?.width_mm || !product?.depth_mm) return ["치수 정보 없음"];

  const [fw, fd] = getFootprint(product.width_mm, product.depth_mm, placement.rotation);
  const rect = getRect(placement.x_mm, placement.y_mm, fw, fd);
  const roomW = room.width_mm;
  const roomH = room.height_mm;
  const myMount = product.mount_type ?? "floor";

  // 1. 방 경계 체크 (open_walls 방향은 스킵)
  const openWalls = new Set(room.open_walls ?? []);
  const outWest = rect[0] < -1 && !openWalls.has("west");
  const outNorth = rect[1] < -1 && !openWalls.has("north");
  const outEast = rect[2] > roomW + 1 && !openWalls.has("east");
  const outSouth = rect[3] > roomH + 1 && !openWalls.has("south");
  if (outWest || outNorth || outEast || outSouth) {
    violations.push("방 경계를 벗어남");
  }

  // 1-1. 투명벽(open_walls) 바로 앞 통행 구역 체크 (100mm)
  const openWallMargin = 100;
  for (const wall of openWalls) {
    let zone: Rect | null = null;
    if (wall === "north") zone = [0, 0, roomW, openWallMargin];
    else if (wall === "south") zone = [0, roomH - openWallMargin, roomW, roomH];
    else if (wall === "west") zone = [0, 0, openWallMargin, roomH];
    else if (wall === "east") zone = [roomW - openWallMargin, 0, roomW, roomH];
    if (zone && rectsOverlap(rect, zone)) {
      violations.push(`개방 공간 통행 구역 침범 (${wall})`);
    }
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
        for (const zone of getDoorPassageZones(feat, roomW, roomH)) {
          if (rectsOverlap(rect, zone)) {
            violations.push(`문 통행 구역 침범 (${feat.wall}벽)`);
            break;
          }
        }
      }
    }

    // 3-1. 인접 방 문의 통행 구역 (다른 방의 문이 현재 방 쪽으로 열리는 경우)
    if (allRooms) {
      for (const zone of getAdjacentDoorZones(room, allRooms)) {
        if (rectsOverlap(rect, zone)) {
          violations.push("인접 방 문 통행 구역 침범");
          break;
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
