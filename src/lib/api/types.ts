export interface Device {
  id: string;
  app_guid: string;
  name?: string | null;
  platform?: string | null;
  model?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  first_seen_at: string;
  last_seen_at: string;
  is_blocked: boolean;
  notes?: string | null;
  metadata?: Record<string, unknown>;
}

export interface Session {
  id: string;
  device_id: string;
  started_at: string;
  ended_at?: string | null;
  bet_sum: number | string;
  initial_balance: number | string;
  final_balance?: number | string | null;
  win_sum?: number | string | null;
  current_step: number;
  status: "active" | "won" | "lost" | "cashed_out";
  difficulty_profile: string;
  forced_outcome?: "win" | "lose" | "cashout" | null;
}

export interface Grid {
  id: string;
  session_id: string;
  grid_json: number[][];
  difficulty_profile: string;
  is_forced: boolean;
  created_at: string;
}

export interface Action {
  id: string;
  session_id: string;
  step: number;
  chosen_column: number;
  correct_column: number;
  result: "good" | "bad";
  coefficient: number | string;
  at: string;
}

export interface Stats {
  devices: number;
  sessions: {
    total: number;
    active: number;
    won: number;
    lost: number;
    cashed_out: number;
  };
  economy: {
    total_bet: number;
    total_win: number;
    net: number;
  };
  current_balance: number;
}

export interface LiveGame {
  device_guid: string;
  grid: number[][];
  action_step: number;
  status: number | string;
  bet_sum: number;
  chosen_columns: number[];
  session_id?: string | null;
  forced_outcome?: string | null;
}

export interface LiveResponse {
  active: LiveGame[];
  count: number;
  balance?: number;
}

export interface DevicesResponse {
  devices: Device[];
  count: number;
}

export interface DeviceDetailResponse {
  device: Device;
  sessions: Session[];
}

export interface SessionsResponse {
  sessions: Session[];
  count: number;
}

export interface SessionDetailResponse {
  session: Session;
  grid: Grid | null;
  actions: Action[];
}

export interface PaymentNumbers {
  VodafoneCash?: string;
  EtisalatCash?: string;
  OrangeCash?: string;
  WEPay?: string;
  InstaPay?: string;
  [key: string]: string | undefined;
}

export interface PaymentNumbersResponse {
  payment_numbers: PaymentNumbers;
}

export interface ConfigMap {
  difficulty_profile?: string;
  win_rate?: number;
  auto_cashout_after?: number;
  min_bet?: number;
  max_bet?: number;
  virtual_balance?: number;
  payment_numbers?: PaymentNumbers;
  grid_override_enabled?: boolean;
  grid_override_json?: number[][];
  maintenance_mode?: boolean;
  active?: boolean;
  [key: string]: unknown;
}

export interface ConfigResponse {
  config: ConfigMap;
}
