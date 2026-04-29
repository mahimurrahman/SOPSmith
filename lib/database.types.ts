export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      agent_approvals: {
        Row: {
          id: string;
          workspace_id: string;
          run_id: string | null;
          sop_id: string | null;
          approval_type: "sop_edit" | "google_action";
          status: "pending" | "approved" | "rejected";
          title: string;
          preview: string;
          proposed_payload: Json;
          decided_by: string | null;
          decided_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          run_id?: string | null;
          sop_id?: string | null;
          approval_type: "sop_edit" | "google_action";
          status?: "pending" | "approved" | "rejected";
          title: string;
          preview: string;
          proposed_payload?: Json;
          decided_by?: string | null;
          decided_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["agent_approvals"]["Insert"]>;
        Relationships: [];
      };
      agent_run_steps: {
        Row: {
          id: string;
          run_id: string;
          step_order: number;
          status: "queued" | "running" | "completed" | "failed";
          tool_name: string;
          input_summary: string;
          output_summary: string | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          run_id: string;
          step_order: number;
          status?: "queued" | "running" | "completed" | "failed";
          tool_name: string;
          input_summary: string;
          output_summary?: string | null;
          error_message?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["agent_run_steps"]["Insert"]>;
        Relationships: [];
      };
      agent_runs: {
        Row: {
          id: string;
          workspace_id: string;
          sop_id: string | null;
          user_id: string | null;
          agent_type:
            | "sop_creation"
            | "sop_audit"
            | "sop_improvement"
            | "section_regeneration"
            | "google_mock";
          status:
            | "queued"
            | "running"
            | "waiting_approval"
            | "completed"
            | "failed"
            | "cancelled";
          title: string;
          summary: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          sop_id?: string | null;
          user_id?: string | null;
          agent_type:
            | "sop_creation"
            | "sop_audit"
            | "sop_improvement"
            | "section_regeneration"
            | "google_mock";
          status?: "queued" | "running" | "waiting_approval" | "completed" | "failed" | "cancelled";
          title: string;
          summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["agent_runs"]["Insert"]>;
        Relationships: [];
      };
      integration_actions: {
        Row: {
          id: string;
          workspace_id: string;
          integration_id: string | null;
          run_id: string | null;
          action_type: "drive_export" | "docs_sync" | "gmail_draft";
          status: "draft" | "approved" | "rejected" | "completed";
          destination: string | null;
          payload: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          integration_id?: string | null;
          run_id?: string | null;
          action_type: "drive_export" | "docs_sync" | "gmail_draft";
          status?: "draft" | "approved" | "rejected" | "completed";
          destination?: string | null;
          payload?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["integration_actions"]["Insert"]>;
        Relationships: [];
      };
      integrations: {
        Row: {
          id: string;
          workspace_id: string;
          provider: "google";
          status: "mock_connected" | "disconnected";
          config: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          provider: "google";
          status?: "mock_connected" | "disconnected";
          config?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["integrations"]["Insert"]>;
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          workspace_id: string;
          invoice_number: string;
          plan_id: string;
          amount_due: number;
          status: "draft" | "paid" | "void";
          period_start: string;
          period_end: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          invoice_number: string;
          plan_id: string;
          amount_due: number;
          status?: "draft" | "paid" | "void";
          period_start: string;
          period_end: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["invoices"]["Insert"]>;
        Relationships: [];
      };
      plans: {
        Row: {
          id: string;
          name: string;
          monthly_price: number;
          sop_limit: number | null;
          agent_run_limit: number | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          monthly_price: number;
          sop_limit?: number | null;
          agent_run_limit?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["plans"]["Insert"]>;
        Relationships: [];
      };
      sop_files: {
        Row: {
          id: string;
          sop_id: string;
          file_name: string;
          file_type: string;
          file_size: number;
          file_url: string;
          extracted_text: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          sop_id: string;
          file_name: string;
          file_type: string;
          file_size: number;
          file_url: string;
          extracted_text?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          sop_id?: string;
          file_name?: string;
          file_type?: string;
          file_size?: number;
          file_url?: string;
          extracted_text?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sop_files_sop_id_fkey";
            columns: ["sop_id"];
            isOneToOne: false;
            referencedRelation: "sops";
            referencedColumns: ["id"];
          },
        ];
      };
      sops: {
        Row: {
          id: string;
          workspace_id: string | null;
          user_id: string;
          title: string;
          raw_notes: string;
          content: string;
          structured_data: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id?: string | null;
          user_id: string;
          title: string;
          raw_notes: string;
          content: string;
          structured_data?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string | null;
          user_id?: string;
          title?: string;
          raw_notes?: string;
          content?: string;
          structured_data?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sops_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      sop_versions: {
        Row: {
          id: string;
          sop_id: string;
          content: string;
          structured_data: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          sop_id: string;
          content: string;
          structured_data?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          sop_id?: string;
          content?: string;
          structured_data?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sop_versions_sop_id_fkey";
            columns: ["sop_id"];
            isOneToOne: false;
            referencedRelation: "sops";
            referencedColumns: ["id"];
          },
        ];
      };
      sop_health_scores: {
        Row: {
          id: string;
          workspace_id: string;
          sop_id: string;
          score: number;
          issues: Json;
          last_audited_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          sop_id: string;
          score: number;
          issues?: Json;
          last_audited_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["sop_health_scores"]["Insert"]>;
        Relationships: [];
      };
      usage_events: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string | null;
          event_type: "sop_created" | "agent_run" | "google_mock_action";
          quantity: number;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id?: string | null;
          event_type: "sop_created" | "agent_run" | "google_mock_action";
          quantity?: number;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["usage_events"]["Insert"]>;
        Relationships: [];
      };
      workspace_members: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          role: "owner" | "admin" | "member";
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          role?: "owner" | "admin" | "member";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["workspace_members"]["Insert"]>;
        Relationships: [];
      };
      workspace_subscriptions: {
        Row: {
          id: string;
          workspace_id: string;
          plan_id: string;
          status: "active" | "paused" | "cancelled";
          current_period_start: string;
          current_period_end: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          plan_id: string;
          status?: "active" | "paused" | "cancelled";
          current_period_start?: string;
          current_period_end?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["workspace_subscriptions"]["Insert"]>;
        Relationships: [];
      };
      workspaces: {
        Row: {
          id: string;
          owner_user_id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_user_id: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["workspaces"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Sop = Database["public"]["Tables"]["sops"]["Row"];
export type SopInsert = Database["public"]["Tables"]["sops"]["Insert"];
export type SopUpdate = Database["public"]["Tables"]["sops"]["Update"];
export type SopFile = Database["public"]["Tables"]["sop_files"]["Row"];
export type SopFileInsert = Database["public"]["Tables"]["sop_files"]["Insert"];
export type SopFileUpdate = Database["public"]["Tables"]["sop_files"]["Update"];
export type SopVersion = Database["public"]["Tables"]["sop_versions"]["Row"];
export type SopVersionInsert = Database["public"]["Tables"]["sop_versions"]["Insert"];
export type SopVersionUpdate = Database["public"]["Tables"]["sop_versions"]["Update"];
export type Workspace = Database["public"]["Tables"]["workspaces"]["Row"];
export type WorkspaceSubscription = Database["public"]["Tables"]["workspace_subscriptions"]["Row"];
export type Plan = Database["public"]["Tables"]["plans"]["Row"];
export type UsageEvent = Database["public"]["Tables"]["usage_events"]["Row"];
export type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
export type AgentRun = Database["public"]["Tables"]["agent_runs"]["Row"];
export type AgentRunStep = Database["public"]["Tables"]["agent_run_steps"]["Row"];
export type AgentApproval = Database["public"]["Tables"]["agent_approvals"]["Row"];
export type Integration = Database["public"]["Tables"]["integrations"]["Row"];
export type IntegrationAction = Database["public"]["Tables"]["integration_actions"]["Row"];
export type SopHealthScore = Database["public"]["Tables"]["sop_health_scores"]["Row"];
