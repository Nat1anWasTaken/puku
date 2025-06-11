export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      arrangements: {
        Row: {
          composers: string[];
          created_at: string;
          ensemble_type: Database["public"]["Enums"]["ensemble_type"];
          file_path: string | null;
          id: string;
          owner_id: string;
          title: string;
        };
        Insert: {
          composers: string[];
          created_at?: string;
          ensemble_type: Database["public"]["Enums"]["ensemble_type"];
          file_path?: string | null;
          id?: string;
          owner_id: string;
          title: string;
        };
        Update: {
          composers?: string[];
          created_at?: string;
          ensemble_type?: Database["public"]["Enums"]["ensemble_type"];
          file_path?: string | null;
          id?: string;
          owner_id?: string;
          title?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      ensemble_type:
        | "concert_band"
        | "symphonic_band"
        | "wind_ensemble"
        | "marching_band"
        | "symphony_orchestra"
        | "chamber_orchestra"
        | "string_orchestra"
        | "jazz_big_band"
        | "percussion_ensemble"
        | "drumline"
        | "mallet_ensemble"
        | "saxophone_ensemble"
        | "clarinet_choir"
        | "flute_choir"
        | "brass_ensemble"
        | "horn_ensemble"
        | "trumpet_ensemble"
        | "low_brass_ensemble"
        | "string_quartet"
        | "string_ensemble"
        | "violin_ensemble"
        | "cello_ensemble"
        | "mixed_string_chamber"
        | "mixed_chamber_ensemble"
        | "piano_ensemble"
        | "guitar_ensemble"
        | "handbell_choir"
        | "recorder_ensemble"
        | "choir"
        | "satb_choir"
        | "treble_choir"
        | "a_cappella"
        | "vocal_ensemble";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      ensemble_type: [
        "concert_band",
        "symphonic_band",
        "wind_ensemble",
        "marching_band",
        "symphony_orchestra",
        "chamber_orchestra",
        "string_orchestra",
        "jazz_big_band",
        "percussion_ensemble",
        "drumline",
        "mallet_ensemble",
        "saxophone_ensemble",
        "clarinet_choir",
        "flute_choir",
        "brass_ensemble",
        "horn_ensemble",
        "trumpet_ensemble",
        "low_brass_ensemble",
        "string_quartet",
        "string_ensemble",
        "violin_ensemble",
        "cello_ensemble",
        "mixed_string_chamber",
        "mixed_chamber_ensemble",
        "piano_ensemble",
        "guitar_ensemble",
        "handbell_choir",
        "recorder_ensemble",
        "choir",
        "satb_choir",
        "treble_choir",
        "a_cappella",
        "vocal_ensemble"
      ]
    }
  }
} as const;
