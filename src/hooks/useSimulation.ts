import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import simulationApi from "@/services/simulationApi";
import type {
  FloorPlan,
  Session,
  SessionCreate,
  Product,
  Category,
  Placement,
  PlacementCreate,
  PlacementUpdate,
  AutoPlaceRequest,
  AutoPlaceResponse,
  GenerateLayoutsResponse,
  ProductsParams,
} from "@/types/simulation";

// ─── Query Keys ───

export const simKeys = {
  floorPlans: ["sim", "floorPlans"] as const,
  floorPlan: (id: number) => ["sim", "floorPlan", id] as const,
  session: (id: number) => ["sim", "session", id] as const,
  categories: (productType?: string) => ["sim", "categories", productType] as const,
  products: (params: ProductsParams) => ["sim", "products", params] as const,
  placements: (sessionId: number, roomId: number) =>
    ["sim", "placements", sessionId, roomId] as const,
};

// ─── Floor Plans ───

export function useFloorPlans() {
  return useQuery({
    queryKey: simKeys.floorPlans,
    queryFn: async () => {
      const { data } = await simulationApi.get<FloorPlan[]>("/floor-plans");
      return data;
    },
  });
}

export function useFloorPlan(planId: number | null) {
  return useQuery({
    queryKey: simKeys.floorPlan(planId!),
    queryFn: async () => {
      const { data } = await simulationApi.get<FloorPlan>(`/floor-plans/${planId}`);
      return data;
    },
    enabled: planId != null,
  });
}

// ─── Sessions ───

export function useCreateSession() {
  return useMutation({
    mutationFn: async (body: SessionCreate) => {
      const { data } = await simulationApi.post<Session>("/sessions", body);
      return data;
    },
  });
}

export function useSession(sessionId: number | null) {
  return useQuery({
    queryKey: simKeys.session(sessionId!),
    queryFn: async () => {
      const { data } = await simulationApi.get<Session>(`/sessions/${sessionId}`);
      return data;
    },
    enabled: sessionId != null,
  });
}

export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: number) => {
      await simulationApi.delete(`/sessions/${sessionId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sim"] });
    },
  });
}

// ─── Products ───

export function useCategories(productType?: string) {
  return useQuery({
    queryKey: simKeys.categories(productType),
    queryFn: async () => {
      const { data } = await simulationApi.get<Category[]>("/categories", {
        params: productType ? { product_type: productType } : undefined,
      });
      return data;
    },
  });
}

export function useProducts(params: ProductsParams) {
  return useQuery({
    queryKey: simKeys.products(params),
    queryFn: async () => {
      const { data } = await simulationApi.get<Product[]>("/products", { params });
      return data;
    },
  });
}

// ─── Placements ───

export function usePlacements(sessionId: number | null, roomId: number | null) {
  return useQuery({
    queryKey: simKeys.placements(sessionId!, roomId!),
    queryFn: async () => {
      const { data } = await simulationApi.get<Placement[]>(
        `/sessions/${sessionId}/rooms/${roomId}/placements`,
      );
      return data;
    },
    enabled: sessionId != null && roomId != null,
  });
}

export function useCreatePlacement(sessionId: number, roomId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: PlacementCreate) => {
      const { data } = await simulationApi.post<Placement>(
        `/sessions/${sessionId}/rooms/${roomId}/placements`,
        body,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: simKeys.placements(sessionId, roomId) });
    },
  });
}

export function useUpdatePlacement(sessionId: number, roomId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ placementId, body }: { placementId: number; body: PlacementUpdate }) => {
      const { data } = await simulationApi.put<Placement>(
        `/sessions/${sessionId}/rooms/${roomId}/placements/${placementId}`,
        body,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: simKeys.placements(sessionId, roomId) });
    },
  });
}

export function useDeletePlacement(sessionId: number, roomId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (placementId: number) => {
      await simulationApi.delete(
        `/sessions/${sessionId}/rooms/${roomId}/placements/${placementId}`,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: simKeys.placements(sessionId, roomId) });
    },
  });
}

// ─── Auto Place (전체 도면) ───

export function useAutoPlaceFloorPlan(sessionId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: AutoPlaceRequest) => {
      const { data } = await simulationApi.post<AutoPlaceResponse>(
        `/sessions/${sessionId}/auto-place`,
        body,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sim", "placements"] });
    },
  });
}

// ─── Auto Place (방 단위) ───

export function useAutoPlaceRoom(sessionId: number, roomId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: AutoPlaceRequest) => {
      const { data } = await simulationApi.post<AutoPlaceResponse>(
        `/sessions/${sessionId}/rooms/${roomId}/placements/auto-place`,
        body,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: simKeys.placements(sessionId, roomId) });
    },
  });
}

// ─── Layout Generation ───

export function useGenerateLayouts(sessionId: number) {
  return useMutation({
    mutationFn: async (body: AutoPlaceRequest) => {
      const { data } = await simulationApi.post<GenerateLayoutsResponse>(
        `/sessions/${sessionId}/generate-layouts`,
        body,
      );
      return data;
    },
  });
}

export function useApplyLayout(sessionId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (layoutId: number) => {
      const { data } = await simulationApi.post(
        `/sessions/${sessionId}/apply-layout`,
        { layout_id: layoutId },
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sim", "placements"] });
    },
  });
}
