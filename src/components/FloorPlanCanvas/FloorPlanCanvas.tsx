import { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from "react";
import type { FloorPlan, FloorPlanRoom, RoomFeature, Placement } from "@/types/simulation";

// ─── Color Maps ───

const ROOM_TYPE_COLORS: Record<string, string> = {
  living: "#e8f4fd",
  kitchen: "#fef3e2",
  bedroom: "#f0e8fd",
  bathroom: "#e8e8e8",
  utility: "#e2f4e8",
  balcony: "#f0f8e8",
};

const CATEGORY_COLORS: Record<string, string> = {
  TV: "#6366f1", 냉장고: "#0ea5e9", 세탁기: "#14b8a6",
  워시타워: "#14b8a6", 워시콤보: "#14b8a6", 의류건조기: "#f59e0b",
  의류관리기: "#8b5cf6", 에어컨: "#06b6d4", 전기레인지: "#ef4444",
  오븐: "#f97316", 전자레인지: "#fb923c", 식기세척기: "#10b981",
  정수기: "#3b82f6", 스탠바이미: "#a855f7",
  침대: "#7c3aed", 소파: "#d946ef", "식탁·테이블": "#c2410c",
  의자: "#a16207", "책장·수납장": "#4d7c0f", 책상: "#0f766e",
  선반: "#6d28d9", "옷장·행거": "#9333ea", "화장대·콘솔": "#db2777",
  TV거실장: "#4338ca", 유아동가구: "#f472b6",
};

// ─── Props ───

interface FloorPlanCanvasProps {
  floorPlan: FloorPlan | null;
  placements?: Record<number, Placement[]>;
  selectedRoomId?: number | null;
  selectedPlacementId?: number | null;
  zoom?: number;
  showGrid?: boolean;
  onRoomClick?: (room: FloorPlanRoom) => void;
  onPlacementMove?: (roomId: number, placementIndex: number, xMm: number, yMm: number) => void;
  onPlacementMoveEnd?: (roomId: number, placementIndex: number, xMm: number, yMm: number) => void;
  onPlacementRotate?: (roomId: number, placementIndex: number) => void;
  onPlacementRoomChange?: (fromRoomId: number, placementIndex: number, toRoomId: number, xMm: number, yMm: number) => number;
}

export interface FloorPlanCanvasHandle {
  /** Canvas를 PNG Base64 문자열로 반환 */
  toDataURL: () => string | null;
}

/** Hit-test: find placement under pixel coords */
function findPlacementAt(
  px: number, py: number,
  floorPlan: FloorPlan, placements: Record<number, Placement[]>,
  scale: number, offsetX: number, offsetY: number,
): { roomId: number; index: number; placement: Placement } | null {
  const mmX = (px - offsetX) / scale;
  const mmY = (py - offsetY) / scale;

  for (const room of floorPlan.rooms) {
    const roomPls = placements[room.id] ?? [];
    for (let i = roomPls.length - 1; i >= 0; i--) {
      const pl = roomPls[i];
      const product = pl.product;
      if (!product?.width_mm || !product?.depth_mm) continue;

      let fw: number, fd: number;
      if (pl.rotation === 0 || pl.rotation === 180) { fw = product.width_mm; fd = product.depth_mm; }
      else { fw = product.depth_mm; fd = product.width_mm; }

      const MIN_DIM = 250;
      const isWall = product.mount_type === "wall";
      const dw = isWall ? Math.max(fw, 200) : Math.max(fw, MIN_DIM);
      const dd = isWall ? Math.min(fd, 120) : Math.max(fd, MIN_DIM);

      const absX = room.x_mm + pl.x_mm;
      const absY = room.y_mm + pl.y_mm;

      if (
        mmX >= absX - dw / 2 && mmX <= absX + dw / 2 &&
        mmY >= absY - dd / 2 && mmY <= absY + dd / 2
      ) {
        return { roomId: room.id, index: i, placement: pl };
      }
    }
  }
  return null;
}

// ─── Helpers ───

function computeTransform(
  canvas: HTMLCanvasElement,
  plan: FloorPlan,
  zoom: number,
) {
  const padding = 100;
  const availW = canvas.width - padding;
  const availH = canvas.height - padding;
  const baseScale = Math.min(availW / plan.total_width_mm, availH / plan.total_height_mm);
  const scale = baseScale * zoom;
  const planPxW = plan.total_width_mm * scale;
  const planPxH = plan.total_height_mm * scale;
  const offsetX = (canvas.width - planPxW) / 2;
  const offsetY = (canvas.height - planPxH) / 2;
  return { scale, offsetX, offsetY };
}

function mmToPixel(
  mmX: number,
  mmY: number,
  scale: number,
  offsetX: number,
  offsetY: number,
) {
  return { x: offsetX + mmX * scale, y: offsetY + mmY * scale };
}

// ─── Draw Functions ───

function drawRoom(
  ctx: CanvasRenderingContext2D,
  room: FloorPlanRoom,
  isSelected: boolean,
  scale: number,
  offsetX: number,
  offsetY: number,
) {
  const tl = mmToPixel(room.x_mm, room.y_mm, scale, offsetX, offsetY);
  const br = mmToPixel(room.x_mm + room.width_mm, room.y_mm + room.height_mm, scale, offsetX, offsetY);
  const w = br.x - tl.x;
  const h = br.y - tl.y;

  const openWalls = new Set(room.open_walls ?? []);
  const bgColor = ROOM_TYPE_COLORS[room.room_type] ?? "#f8f8f8";
  ctx.fillStyle = room.is_placeable ? bgColor : "#f0f0f0";
  ctx.fillRect(tl.x, tl.y, w, h);
  ctx.strokeStyle = isSelected ? "#4a6cf7" : "#555";
  ctx.lineWidth = isSelected ? 3 : 1.5;
  ctx.beginPath();
  if (!openWalls.has("north")) { ctx.moveTo(tl.x, tl.y); ctx.lineTo(tl.x + w, tl.y); }
  if (!openWalls.has("east"))  { ctx.moveTo(tl.x + w, tl.y); ctx.lineTo(tl.x + w, tl.y + h); }
  if (!openWalls.has("south")) { ctx.moveTo(tl.x + w, tl.y + h); ctx.lineTo(tl.x, tl.y + h); }
  if (!openWalls.has("west"))  { ctx.moveTo(tl.x, tl.y + h); ctx.lineTo(tl.x, tl.y); }
  ctx.stroke();

  ctx.fillStyle = isSelected ? "#4a6cf7" : "#888";
  const fontSize = Math.max(10, Math.min(14, w / 10));
  ctx.font = `${isSelected ? "bold " : ""}${fontSize}px 'Segoe UI', sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(room.name, tl.x + w / 2, tl.y + h / 2);

  if (w > 60) {
    ctx.fillStyle = "#aaa";
    ctx.font = `${Math.max(8, fontSize - 3)}px 'Segoe UI', sans-serif`;
    const dimText = `${(room.width_mm / 1000).toFixed(1)}x${(room.height_mm / 1000).toFixed(1)}m`;
    ctx.fillText(dimText, tl.x + w / 2, tl.y + h / 2 + fontSize);
  }

  if (!room.is_placeable) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(tl.x, tl.y, w, h);
    ctx.clip();
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = "#999";
    ctx.lineWidth = 1;
    const maxDim = Math.max(w, h);
    for (let d = -maxDim; d < maxDim * 2; d += 12) {
      ctx.beginPath();
      ctx.moveTo(tl.x + d, tl.y);
      ctx.lineTo(tl.x + d - h, tl.y + h);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawFeatures(
  ctx: CanvasRenderingContext2D,
  room: FloorPlanRoom,
  scale: number,
  offsetX: number,
  offsetY: number,
) {
  const features = room.features ?? [];
  const rx = room.x_mm;
  const ry = room.y_mm;
  const rw = room.width_mm;
  const rh = room.height_mm;

  for (const feat of features) {
    const { wall, offset, width: fw } = feat;
    let x1: number, y1: number, x2: number, y2: number;

    if (wall === "north") {
      const p1 = mmToPixel(rx + offset, ry, scale, offsetX, offsetY);
      const p2 = mmToPixel(rx + offset + fw, ry, scale, offsetX, offsetY);
      x1 = p1.x; y1 = p1.y; x2 = p2.x; y2 = p2.y;
    } else if (wall === "south") {
      const p1 = mmToPixel(rx + offset, ry + rh, scale, offsetX, offsetY);
      const p2 = mmToPixel(rx + offset + fw, ry + rh, scale, offsetX, offsetY);
      x1 = p1.x; y1 = p1.y; x2 = p2.x; y2 = p2.y;
    } else if (wall === "west") {
      const p1 = mmToPixel(rx, ry + offset, scale, offsetX, offsetY);
      const p2 = mmToPixel(rx, ry + offset + fw, scale, offsetX, offsetY);
      x1 = p1.x; y1 = p1.y; x2 = p2.x; y2 = p2.y;
    } else {
      const p1 = mmToPixel(rx + rw, ry + offset, scale, offsetX, offsetY);
      const p2 = mmToPixel(rx + rw, ry + offset + fw, scale, offsetX, offsetY);
      x1 = p1.x; y1 = p1.y; x2 = p2.x; y2 = p2.y;
    }

    ctx.save();
    drawFeature(ctx, feat, x1, y1, x2, y2, fw, scale, wall);
    ctx.restore();
  }
}

function drawFeature(
  ctx: CanvasRenderingContext2D,
  feat: RoomFeature,
  x1: number, y1: number, x2: number, y2: number,
  fw: number, scale: number, wall: string,
) {
  if (feat.type === "door") {
    const isSlide = feat.door_type === "slide";
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();

    if (isSlide) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = (-dy / len) * 2.5;
      const ny = (dx / len) * 2.5;
      ctx.strokeStyle = "#8e44ad";
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(x1 + nx, y1 + ny); ctx.lineTo(x2 + nx, y2 + ny); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x1 - nx, y1 - ny); ctx.lineTo(x2 - nx, y2 - ny); ctx.stroke();
    } else {
      ctx.strokeStyle = "#e67e22";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      const radius = Math.max(fw * scale, 1);
      if (wall === "north") { ctx.beginPath(); ctx.arc(x1, y1, radius, 0, Math.PI / 2); ctx.stroke(); }
      else if (wall === "south") { ctx.beginPath(); ctx.arc(x1, y1, radius, -Math.PI / 2, 0); ctx.stroke(); }
      else if (wall === "west") { ctx.beginPath(); ctx.arc(x1, y1, radius, 0, Math.PI / 2); ctx.stroke(); }
      else { ctx.beginPath(); ctx.arc(x1, y1, radius, Math.PI / 2, Math.PI); ctx.stroke(); }
      ctx.setLineDash([]);
      ctx.strokeStyle = "#e67e22";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }
  } else if (feat.type === "window") {
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.strokeStyle = "#3498db"; ctx.lineWidth = 2.5; ctx.setLineDash([6, 3]);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.setLineDash([]);
  } else if (feat.type === "water_hookup") {
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    ctx.fillStyle = "#2ecc71";
    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 7px 'Segoe UI', sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("W", cx, cy);
  } else if (feat.type === "gas_line") {
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    ctx.fillStyle = "#e74c3c";
    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 7px 'Segoe UI', sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("G", cx, cy);
  } else if (feat.type === "fixture") {
    const depth = (feat.depth ?? 600) * scale;
    const widthPx = Math.abs(x2 - x1) || fw * scale;
    let fx: number, fy: number, fwPx: number, fhPx: number;
    if (wall === "north") { fx = x1; fy = y1; fwPx = widthPx; fhPx = depth; }
    else if (wall === "south") { fx = x1; fy = y1 - depth; fwPx = widthPx; fhPx = depth; }
    else if (wall === "west") { fx = x1; fy = y1; fwPx = depth; fhPx = widthPx; }
    else { fx = x1 - depth; fy = y1; fwPx = depth; fhPx = widthPx; }

    ctx.fillStyle = "rgba(120, 120, 120, 0.15)";
    ctx.fillRect(fx, fy, fwPx, fhPx);
    ctx.strokeStyle = "#888"; ctx.lineWidth = 1;
    ctx.strokeRect(fx, fy, fwPx, fhPx);

    ctx.save();
    ctx.beginPath(); ctx.rect(fx, fy, fwPx, fhPx); ctx.clip();
    ctx.strokeStyle = "rgba(100,100,100,0.3)"; ctx.lineWidth = 0.5;
    const maxDim = Math.max(fwPx, fhPx);
    for (let d = -maxDim; d < maxDim * 2; d += 6) {
      ctx.beginPath();
      ctx.moveTo(fx + d, fy);
      ctx.lineTo(fx + d - fhPx, fy + fhPx);
      ctx.stroke();
    }
    ctx.restore();

    const label = feat.label ?? "설비";
    const fcx = fx + fwPx / 2;
    const fcy = fy + fhPx / 2;
    const labelSize = Math.max(7, Math.min(10, fwPx / 6));
    ctx.fillStyle = "#555";
    ctx.font = `bold ${labelSize}px 'Segoe UI', sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(label, fcx, fcy);
  }
}

function drawPlacement(
  ctx: CanvasRenderingContext2D,
  pl: Placement,
  room: FloorPlanRoom,
  isSelected: boolean,
  scale: number,
  offsetX: number,
  offsetY: number,
) {
  const product = pl.product;
  if (!product?.width_mm || !product?.depth_mm) return;

  const isWallMount = product.mount_type === "wall";
  let fw: number, fd: number;
  if (pl.rotation === 0 || pl.rotation === 180) {
    fw = product.width_mm; fd = product.depth_mm;
  } else {
    fw = product.depth_mm; fd = product.width_mm;
  }

  const MIN_DIM = 250;
  const displayW = isWallMount ? Math.max(fw, 200) : Math.max(fw, MIN_DIM);
  const displayD = isWallMount ? Math.min(fd, 120) : Math.max(fd, MIN_DIM);

  const absX = room.x_mm + pl.x_mm;
  const absY = room.y_mm + pl.y_mm;

  const tl = mmToPixel(absX - displayW / 2, absY - displayD / 2, scale, offsetX, offsetY);
  const br = mmToPixel(absX + displayW / 2, absY + displayD / 2, scale, offsetX, offsetY);
  const w = br.x - tl.x;
  const h = br.y - tl.y;

  const color = CATEGORY_COLORS[product.category] ?? "#78909c";
  const isInvalid = !pl.is_valid;

  ctx.save();

  if (isWallMount) {
    ctx.fillStyle = isInvalid ? "rgba(255,82,82,0.15)" : color + "22";
    ctx.fillRect(tl.x, tl.y, w, h);
    ctx.setLineDash([4, 3]);
    ctx.strokeStyle = isSelected ? "#ffd700" : isInvalid ? "#ff5252" : color;
    ctx.lineWidth = isSelected ? 2.5 : 1.5;
    ctx.strokeRect(tl.x, tl.y, w, h);
    ctx.setLineDash([]);
  } else {
    ctx.fillStyle = isInvalid ? "rgba(255,82,82,0.25)" : color + "33";
    ctx.fillRect(tl.x, tl.y, w, h);
    ctx.strokeStyle = isSelected ? "#ffd700" : isInvalid ? "#ff5252" : color;
    ctx.lineWidth = isSelected ? 3 : 1.5;
    ctx.strokeRect(tl.x, tl.y, w, h);
  }

  const cx = tl.x + w / 2;
  const cy = tl.y + h / 2;
  const mountLabel = isWallMount ? "벽걸이" : product.category === "에어컨" ? "스탠드" : "";
  const label = mountLabel ? `${product.category}(${mountLabel})` : product.category;
  ctx.fillStyle = "#333";
  ctx.font = `bold ${Math.max(9, Math.min(13, w / 6))}px 'Segoe UI', sans-serif`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(label, cx, cy - (isWallMount ? 0 : 6));
  if (!isWallMount) {
    ctx.fillStyle = "#888";
    ctx.font = `${Math.max(8, Math.min(11, w / 8))}px 'Segoe UI', sans-serif`;
    ctx.fillText(`${(fw / 10).toFixed(0)}x${(fd / 10).toFixed(0)}cm`, cx, cy + 8);
  }

  if (isSelected) {
    const hs = 3;
    ctx.fillStyle = "#ffd700";
    ctx.fillRect(tl.x - hs, tl.y - hs, hs * 2, hs * 2);
    ctx.fillRect(br.x - hs, tl.y - hs, hs * 2, hs * 2);
    ctx.fillRect(tl.x - hs, br.y - hs, hs * 2, hs * 2);
    ctx.fillRect(br.x - hs, br.y - hs, hs * 2, hs * 2);
  }
  if (isInvalid) {
    // 빨간 ⚠ 아이콘
    const iconSize = Math.max(12, Math.min(18, w / 4));
    ctx.fillStyle = "#ff5252";
    ctx.beginPath();
    ctx.arc(br.x - 2, tl.y + 2, iconSize / 2 + 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${iconSize}px 'Segoe UI', sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("!", br.x - 2, tl.y + 3);

    // 위반 메시지 표시
    if (pl.violations && pl.violations.length > 0) {
      const msg = pl.violations[0]; // 첫 번째 위반만
      ctx.fillStyle = "rgba(255,82,82,0.9)";
      ctx.font = `bold ${Math.max(8, Math.min(10, w / 8))}px 'Segoe UI', sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText(msg, cx, br.y + 2);
    }
  }
  ctx.restore();
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  room: FloorPlanRoom,
  scale: number,
  offsetX: number,
  offsetY: number,
) {
  const gridStep = 500;
  ctx.save();
  ctx.strokeStyle = "rgba(160,175,195,0.5)";
  ctx.lineWidth = 0.5;

  for (let x = gridStep; x < room.width_mm; x += gridStep) {
    const p = mmToPixel(room.x_mm + x, room.y_mm, scale, offsetX, offsetY);
    const p2 = mmToPixel(room.x_mm + x, room.y_mm + room.height_mm, scale, offsetX, offsetY);
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
  }
  for (let y = gridStep; y < room.height_mm; y += gridStep) {
    const p = mmToPixel(room.x_mm, room.y_mm + y, scale, offsetX, offsetY);
    const p2 = mmToPixel(room.x_mm + room.width_mm, room.y_mm + y, scale, offsetX, offsetY);
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
  }
  ctx.restore();
}

// ─── Component ───

const FloorPlanCanvas = forwardRef<FloorPlanCanvasHandle, FloorPlanCanvasProps>(function FloorPlanCanvas({
  floorPlan,
  placements = {},
  selectedRoomId = null,
  selectedPlacementId = null,
  zoom = 1,
  showGrid = false,
  onRoomClick,
  onPlacementMove,
  onPlacementMoveEnd,
  onPlacementRotate,
  onPlacementRoomChange,
}, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useImperativeHandle(ref, () => ({
    toDataURL: () => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      return canvas.toDataURL("image/png");
    },
  }));
  const [dragging, setDragging] = useState<{
    roomId: number; index: number; placementId: number; startMmX: number; startMmY: number;
  } | null>(null);
  const dragRef = useRef(dragging);
  dragRef.current = dragging;
  const placementsRef = useRef(placements);
  placementsRef.current = placements;
  const floorPlanRef = useRef(floorPlan);
  floorPlanRef.current = floorPlan;

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const wrap = canvas.parentElement;
    if (wrap) {
      canvas.width = wrap.clientWidth;
      canvas.height = wrap.clientHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!floorPlan) {
      ctx.fillStyle = "#999";
      ctx.font = "16px 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("도면을 선택하세요", canvas.width / 2, canvas.height / 2);
      return;
    }

    const { scale, offsetX, offsetY } = computeTransform(canvas, floorPlan, zoom);

    for (const room of floorPlan.rooms) {
      const isSelected = room.id === selectedRoomId;
      drawRoom(ctx, room, isSelected, scale, offsetX, offsetY);
      if (showGrid && isSelected) drawGrid(ctx, room, scale, offsetX, offsetY);
      drawFeatures(ctx, room, scale, offsetX, offsetY);
    }

    for (const room of floorPlan.rooms) {
      const roomPlacements = placements[room.id] ?? [];
      const isCurrentRoom = room.id === selectedRoomId;
      for (const pl of roomPlacements) {
        const isSel = isCurrentRoom && pl.id === selectedPlacementId;
        drawPlacement(ctx, pl, room, isSel, scale, offsetX, offsetY);
      }
    }

    ctx.fillStyle = "#666";
    ctx.font = "12px 'Segoe UI', sans-serif";
    ctx.textAlign = "left";
    const titlePos = mmToPixel(0, 0, scale, offsetX, offsetY);
    ctx.fillText(floorPlan.name, titlePos.x, titlePos.y - 8);

    // 범례 (좌측 하단 고정)
    const legendX = 12;
    const legendY = canvas.height - 60;
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillRect(legendX, legendY, 100, 52);
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1;
    ctx.strokeRect(legendX, legendY, 100, 52);

    const items = [
      { color: "#2ecc71", letter: "W", label: "수전 (배관)" },
      { color: "#e74c3c", letter: "G", label: "가스 배관" },
    ];
    items.forEach((item, i) => {
      const iy = legendY + 14 + i * 20;
      ctx.fillStyle = item.color;
      ctx.beginPath(); ctx.arc(legendX + 12, iy, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 7px 'Segoe UI', sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(item.letter, legendX + 12, iy);
      ctx.fillStyle = "#555";
      ctx.font = "11px 'Segoe UI', sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(item.label, legendX + 22, iy + 1);
    });
  }, [floorPlan, placements, selectedRoomId, selectedPlacementId, zoom, showGrid]);

  useEffect(() => {
    render();
    const handleResize = () => render();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [render]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!floorPlan) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const { scale, offsetX, offsetY } = computeTransform(canvas, floorPlan, zoom);

      if (onPlacementMove) {
        const hit = findPlacementAt(px, py, floorPlan, placements, scale, offsetX, offsetY);
        if (hit) {
          setDragging({
            roomId: hit.roomId,
            index: hit.index,
            placementId: hit.placement.id,
            startMmX: hit.placement.x_mm,
            startMmY: hit.placement.y_mm,
          });
          return;
        }
      }
    },
    [floorPlan, zoom, placements, onPlacementMove],
  );

  const NON_PLACEABLE_TYPES = ["bathroom", "utility"];

  // placementId로 현재 roomId와 index를 찾는 헬퍼
  const findPlacementById = useCallback((pid: number) => {
    const pls = placementsRef.current;
    for (const roomIdStr of Object.keys(pls)) {
      const roomId = Number(roomIdStr);
      const arr = pls[roomId];
      if (!arr) continue;
      const idx = arr.findIndex((p) => p.id === pid);
      if (idx >= 0) return { roomId, index: idx, placement: arr[idx] };
    }
    return null;
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!dragRef.current || !floorPlanRef.current || !onPlacementMove) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const fp = floorPlanRef.current;

      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const { scale, offsetX, offsetY } = computeTransform(canvas, fp, zoom);

      const drag = dragRef.current;
      const globalMmX = (px - offsetX) / scale;
      const globalMmY = (py - offsetY) / scale;

      // placementId로 현재 실제 위치를 찾기
      const current = findPlacementById(drag.placementId);
      if (!current) return;
      // drag 상태를 최신으로 동기화
      drag.roomId = current.roomId;
      drag.index = current.index;

      // 마우스가 어떤 방 위에 있는지 찾기
      let targetRoom = fp.rooms.find((r) => r.id === drag.roomId);
      for (const room of fp.rooms) {
        if (
          globalMmX >= room.x_mm && globalMmX <= room.x_mm + room.width_mm &&
          globalMmY >= room.y_mm && globalMmY <= room.y_mm + room.height_mm
        ) {
          if (!room.is_placeable || NON_PLACEABLE_TYPES.includes(room.room_type)) continue;
          targetRoom = room;
          break;
        }
      }
      if (!targetRoom) return;

      // 다른 방으로 이동한 경우
      if (targetRoom.id !== drag.roomId && onPlacementRoomChange) {
        const localX = Math.max(0, Math.min(targetRoom.width_mm, globalMmX - targetRoom.x_mm));
        const localY = Math.max(0, Math.min(targetRoom.height_mm, globalMmY - targetRoom.y_mm));
        onPlacementRoomChange(drag.roomId, drag.index, targetRoom.id, localX, localY);
        return;
      }

      // 같은 방 내에서 이동
      const pl = current.placement;
      let halfW = 125, halfD = 125;
      if (pl?.product?.width_mm && pl?.product?.depth_mm) {
        const rot = pl.rotation;
        const fw = (rot === 0 || rot === 180) ? pl.product.width_mm : pl.product.depth_mm;
        const fd = (rot === 0 || rot === 180) ? pl.product.depth_mm : pl.product.width_mm;
        halfW = Math.max(fw, 250) / 2;
        halfD = Math.max(fd, 250) / 2;
      }

      const mmX = globalMmX - targetRoom.x_mm;
      const mmY = globalMmY - targetRoom.y_mm;

      const ow = new Set(targetRoom.open_walls ?? []);
      const minX = ow.has("west") ? -halfW * 2 : halfW;
      const maxX = ow.has("east") ? targetRoom.width_mm + halfW * 2 : targetRoom.width_mm - halfW;
      const minY = ow.has("north") ? -halfD * 2 : halfD;
      const maxY = ow.has("south") ? targetRoom.height_mm + halfD * 2 : targetRoom.height_mm - halfD;
      const clampedX = Math.max(minX, Math.min(maxX, mmX));
      const clampedY = Math.max(minY, Math.min(maxY, mmY));

      onPlacementMove(drag.roomId, drag.index, clampedX, clampedY);
    },
    [zoom, onPlacementMove, onPlacementRoomChange, findPlacementById],
  );

  const handleMouseUp = useCallback(() => {
    const drag = dragRef.current;
    if (drag && onPlacementMoveEnd) {
      const current = findPlacementById(drag.placementId);
      if (current) {
        onPlacementMoveEnd(current.roomId, current.index, current.placement.x_mm, current.placement.y_mm);
      }
    }
    setDragging(null);
  }, [onPlacementMoveEnd, findPlacementById]);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!floorPlan || !onPlacementRotate) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const { scale, offsetX, offsetY } = computeTransform(canvas, floorPlan, zoom);

      const hit = findPlacementAt(px, py, floorPlan, placements, scale, offsetX, offsetY);
      if (hit) {
        onPlacementRotate(hit.roomId, hit.index);
      }
    },
    [floorPlan, zoom, placements, onPlacementRotate],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!floorPlan || !onRoomClick) return;
      if (dragRef.current) return; // don't fire room click after drag
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const { scale, offsetX, offsetY } = computeTransform(canvas, floorPlan, zoom);

      const mmX = (px - offsetX) / scale;
      const mmY = (py - offsetY) / scale;

      for (const room of floorPlan.rooms) {
        if (
          mmX >= room.x_mm && mmX <= room.x_mm + room.width_mm &&
          mmY >= room.y_mm && mmY <= room.y_mm + room.height_mm
        ) {
          onRoomClick(room);
          return;
        }
      }
    },
    [floorPlan, zoom, onRoomClick],
  );

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        width: "100%", height: "100%", display: "block",
        cursor: dragging ? "grabbing" : onPlacementMove ? "grab" : onRoomClick ? "pointer" : "default",
      }}
    />
  );
});

export default FloorPlanCanvas;
