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
          preview_path: string | null;
          title: string;
          visibility: Database["public"]["Enums"]["visibility"];
        };
        Insert: {
          composers: string[];
          created_at?: string;
          ensemble_type: Database["public"]["Enums"]["ensemble_type"];
          file_path?: string | null;
          id?: string;
          owner_id: string;
          preview_path?: string | null;
          title: string;
          visibility?: Database["public"]["Enums"]["visibility"];
        };
        Update: {
          composers?: string[];
          created_at?: string;
          ensemble_type?: Database["public"]["Enums"]["ensemble_type"];
          file_path?: string | null;
          id?: string;
          owner_id?: string;
          preview_path?: string | null;
          title?: string;
          visibility?: Database["public"]["Enums"]["visibility"];
        };
        Relationships: [];
      };
      parts: {
        Row: {
          arrangement_id: string | null;
          category: string | null;
          created_at: string;
          end_page: number | null;
          id: string;
          label: string;
          preview_path: string | null;
          start_page: number | null;
        };
        Insert: {
          arrangement_id?: string | null;
          category?: string | null;
          created_at?: string;
          end_page?: number | null;
          id?: string;
          label: string;
          preview_path?: string | null;
          start_page?: number | null;
        };
        Update: {
          arrangement_id?: string | null;
          category?: string | null;
          created_at?: string;
          end_page?: number | null;
          id?: string;
          label?: string;
          preview_path?: string | null;
          start_page?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "parts_arrangement_id_fkey";
            columns: ["arrangement_id"];
            isOneToOne: false;
            referencedRelation: "arrangements";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      bytea_to_text: {
        Args: { data: string };
        Returns: string;
      };
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] };
        Returns: Database["public"]["CompositeTypes"]["http_response"];
      };
      http_delete: {
        Args: { uri: string } | { uri: string; content: string; content_type: string };
        Returns: Database["public"]["CompositeTypes"]["http_response"];
      };
      http_get: {
        Args: { uri: string } | { uri: string; data: Json };
        Returns: Database["public"]["CompositeTypes"]["http_response"];
      };
      http_head: {
        Args: { uri: string };
        Returns: Database["public"]["CompositeTypes"]["http_response"];
      };
      http_header: {
        Args: { field: string; value: string };
        Returns: Database["public"]["CompositeTypes"]["http_header"];
      };
      http_list_curlopt: {
        Args: Record<PropertyKey, never>;
        Returns: {
          curlopt: string;
          value: string;
        }[];
      };
      http_patch: {
        Args: { uri: string; content: string; content_type: string };
        Returns: Database["public"]["CompositeTypes"]["http_response"];
      };
      http_post: {
        Args: { uri: string; content: string; content_type: string } | { uri: string; data: Json };
        Returns: Database["public"]["CompositeTypes"]["http_response"];
      };
      http_put: {
        Args: { uri: string; content: string; content_type: string };
        Returns: Database["public"]["CompositeTypes"]["http_response"];
      };
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      http_set_curlopt: {
        Args: { curlopt: string; value: string };
        Returns: boolean;
      };
      text_to_bytea: {
        Args: { data: string };
        Returns: string;
      };
      urlencode: {
        Args: { data: Json } | { string: string } | { string: string };
        Returns: string;
      };
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
      visibility: "private" | "unlisted" | "public";
    };
    CompositeTypes: {
      http_header: {
        field: string | null;
        value: string | null;
      };
      http_request: {
        method: unknown | null;
        uri: string | null;
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null;
        content_type: string | null;
        content: string | null;
      };
      http_response: {
        status: number | null;
        content_type: string | null;
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null;
        content: string | null;
      };
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
      ],
      visibility: ["private", "unlisted", "public"]
    }
  }
} as const;
