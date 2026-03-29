// ─── Room Feature (도면 설비 정보) ───

export interface RoomFeature {
  type: "door" | "window" | "water_hookup" | "gas_line" | "fixture";
  wall: "north" | "south" | "east" | "west";
  offset: number;
  width: number;
  depth?: number;
  label?: string;
  door_type?: "swing" | "slide";
  swing_dir?: "inward" | "outward";
}

// ─── Floor Plan ───

export interface FloorPlanRoom {
  id: number;
  floor_plan_id: number;
  name: string;
  room_type: "living" | "kitchen" | "bedroom" | "bathroom" | "utility" | "balcony";
  x_mm: number;
  y_mm: number;
  width_mm: number;
  height_mm: number;
  is_placeable: boolean;
  features: RoomFeature[];
  open_walls?: string[];
}

export interface FloorPlan {
  id: number;
  name: string;
  category: string;
  total_area_m2: number | null;
  total_width_mm: number;
  total_height_mm: number;
  thumbnail_url: string | null;
  is_active: boolean;
  rooms: FloorPlanRoom[];
}

// ─── Product ───

export interface Product {
  product_id: number;
  model_id: string;
  name: string;
  category: string;
  product_type: "appliance" | "furniture";
  brand: string | null;
  list_price: number | null;
  discount_rate: number | null;
  price: number | null;
  review_score: number | null;
  review_count: number | null;
  url: string | null;
  image_url: string | null;
  width_mm: number | null;
  height_mm: number | null;
  depth_mm: number | null;
  is_placeable: boolean;
  mount_type: "floor" | "wall";
}

export interface Category {
  category: string;
  count: number;
}

// ─── Session (placement_group) ───

export interface Session {
  id: number;
  floor_plan_id: number;
  session_name: string;
  floor_plan: FloorPlan | null;
}

export interface SessionCreate {
  floor_plan_id: number;
  session_name?: string;
  user_id?: number;
}

// ─── Placement ───

export type Rotation = 0 | 90 | 180 | 270;

export interface Placement {
  id: number;
  session_id: number;
  room_id: number;
  product_id: number;
  x_mm: number;
  y_mm: number;
  rotation: Rotation;
  is_valid: boolean;
  violations: string[];
  product: Product | null;
}

export interface PlacementCreate {
  product_id: number;
  x_mm: number;
  y_mm: number;
  rotation?: Rotation;
}

export interface PlacementUpdate {
  x_mm: number;
  y_mm: number;
  rotation?: Rotation;
}

// ─── Auto Place ───

export interface AutoPlaceRequest {
  product_ids: number[];
}

export interface AutoPlaceResponse {
  placements: Placement[];
  warnings: string[];
}

// ─── Layout Generation ───

export interface LayoutMetrics {
  space_usage: number;
  circulation: number;
  pair_satisfaction: number;
  wall_balance: number;
  center_openness: number;
  front_zone: number;
  total: number;
}

export interface LayoutOption {
  id: number;
  name: string;
  desc: string;
  placements: Placement[];
  warnings: string[];
  metrics: LayoutMetrics;
}

export interface AiRanking {
  layout_id: number;
  score: number;
  pros: string;
  cons: string;
}

export interface GenerateLayoutsResponse {
  layouts: LayoutOption[];
  ai_evaluation: {
    rankings: AiRanking[];
    recommendation: number;
    summary: string;
  } | null;
}

// ─── Validation ───

export interface ValidationResult {
  placement_id: number;
  is_valid: boolean;
  violations: string[];
}

// ─── Products API params ───

export interface ProductsParams {
  category?: string;
  search?: string;
  product_type?: "appliance" | "furniture";
  placeable_only?: boolean;
  page?: number;
  per_page?: number;
}
