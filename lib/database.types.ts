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
      sop_files: {
        Row: {
          id: string;
          sop_id: string;
          file_name: string;
          file_type: string;
          file_size: number;
          file_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          sop_id: string;
          file_name: string;
          file_type: string;
          file_size: number;
          file_url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          sop_id?: string;
          file_name?: string;
          file_type?: string;
          file_size?: number;
          file_url?: string;
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
          user_id: string;
          title: string;
          raw_notes: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          raw_notes: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          raw_notes?: string;
          content?: string;
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
