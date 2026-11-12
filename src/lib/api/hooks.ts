import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type {
  Stats,
  DevicesResponse,
  DeviceDetailResponse,
  SessionsResponse,
  Session,
  LiveResponse,
  ConfigResponse,
  PaymentNumbersResponse,
  PaymentNumbers,
} from "@/lib/api/types";
import { toast } from "sonner";

// ─── Stats Hook ────────────────────────────────────────────────────────
export function useStats() {
  return useQuery<Stats>({
    queryKey: ["stats"],
    queryFn: () => apiClient<Stats>("/api/v1/stats"),
    refetchInterval: 15000,
  });
}

// ─── Devices Hooks ─────────────────────────────────────────────────────
export function useDevices(limit = 100, offset = 0) {
  return useQuery<DevicesResponse>({
    queryKey: ["devices", limit, offset],
    queryFn: () =>
      apiClient<DevicesResponse>(`/api/v1/devices?limit=${limit}&offset=${offset}`),
    refetchInterval: 10000,
  });
}

export function useDevice(id: string | null | undefined) {
  return useQuery<DeviceDetailResponse>({
    queryKey: ["device", id],
    queryFn: () => apiClient<DeviceDetailResponse>(`/api/v1/devices/${id}`),
    enabled: Boolean(id),
  });
}

export function useUpdateDevice(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name?: string | null; notes?: string | null; is_blocked?: boolean }) =>
      apiClient<{ success: boolean; updated: unknown }>(`/api/v1/devices/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["device", id] });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update device");
    },
  });
}

export function useSetDeviceBalance(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (balance: number) =>
      apiClient<{ success: boolean; balance: number }>(`/api/v1/devices/${id}/set-balance`, {
        method: "POST",
        body: JSON.stringify({ balance }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["device", id] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["live"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to set device balance");
    },
  });
}

export function useResetDeviceBalance(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient<{ success: boolean; balance: number }>(`/api/v1/devices/${id}/reset-balance`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["device", id] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["live"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to reset balance");
    },
  });
}

// ─── Sessions Hooks ────────────────────────────────────────────────────
export function useSessions({
  limit = 50,
  status = "",
  deviceId = "",
}: {
  limit?: number;
  status?: string;
  deviceId?: string;
} = {}) {
  const params = new URLSearchParams();
  if (limit) params.set("limit", limit.toString());
  if (status) params.set("status", status);
  if (deviceId) params.set("device_id", deviceId);

  return useQuery<SessionsResponse>({
    queryKey: ["sessions", limit, status, deviceId],
    queryFn: () => apiClient<SessionsResponse>(`/api/v1/sessions?${params.toString()}`),
    refetchInterval: 10000,
  });
}

export function useSession(id: string | null | undefined) {
  return useQuery<Session>({
    queryKey: ["session", id],
    queryFn: () => apiClient<Session>(`/api/v1/sessions/${id}`),
    enabled: Boolean(id),
  });
}

// ─── Live Hooks ────────────────────────────────────────────────────────
export function useLive() {
  return useQuery<LiveResponse>({
    queryKey: ["live"],
    queryFn: () => apiClient<LiveResponse>("/api/v1/live"),
    refetchInterval: 3000,
  });
}

// ─── Config Hooks ──────────────────────────────────────────────────────
export function useConfig() {
  return useQuery<ConfigResponse>({
    queryKey: ["config"],
    queryFn: () => apiClient<ConfigResponse>("/api/v1/config"),
    refetchInterval: 30000,
  });
}

export function useUpdateConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: unknown }) =>
      apiClient<{ success: boolean; key: string; value: unknown }>(`/api/v1/config/${key}`, {
        method: "PATCH",
        body: JSON.stringify({ value }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update configuration parameter");
    },
  });
}

export function usePaymentNumbers() {
  return useQuery<PaymentNumbersResponse>({
    queryKey: ["payment-numbers"],
    queryFn: () => apiClient<PaymentNumbersResponse>("/api/v1/config/payment-numbers"),
  });
}

export function useUpdatePaymentNumbers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payment_numbers: PaymentNumbers) =>
      apiClient<{ success: boolean; payment_numbers: PaymentNumbers }>(
        "/api/v1/config/payment-numbers",
        {
          method: "PATCH",
          body: JSON.stringify({ payment_numbers }),
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-numbers"] });
      queryClient.invalidateQueries({ queryKey: ["config"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update payment numbers");
    },
  });
}
