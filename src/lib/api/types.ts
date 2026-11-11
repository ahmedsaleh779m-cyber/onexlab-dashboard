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
  status: number;
  bet_sum: number;
  chosen_columns: number[];
  session_id?: string | null;
  forced_outcome?: string | null;
}

export interface ConfigMap {
  [key: string]: unknown;
}
