export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      characters: {
        Row: {
          abilities: Json
          advancement_type: string | null
          background_data: Json | null
          background_name: string | null
          class_data: Json | null
          class_name: string | null
          created_at: string
          equipment: Json | null
          hit_point_type: string | null
          hit_points: Json | null
          id: string
          level: number
          name: string
          sources: Json | null
          species_data: Json | null
          species_name: string | null
          spell_slots: Json | null
          spells: Json | null
          subclass_name: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          abilities: Json
          advancement_type?: string | null
          background_data?: Json | null
          background_name?: string | null
          class_data?: Json | null
          class_name?: string | null
          created_at?: string
          equipment?: Json | null
          hit_point_type?: string | null
          hit_points?: Json | null
          id?: string
          level?: number
          name: string
          sources?: Json | null
          species_data?: Json | null
          species_name?: string | null
          spell_slots?: Json | null
          spells?: Json | null
          subclass_name?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          abilities?: Json
          advancement_type?: string | null
          background_data?: Json | null
          background_name?: string | null
          class_data?: Json | null
          class_name?: string | null
          created_at?: string
          equipment?: Json | null
          hit_point_type?: string | null
          hit_points?: Json | null
          id?: string
          level?: number
          name?: string
          sources?: Json | null
          species_data?: Json | null
          species_name?: string | null
          spell_slots?: Json | null
          spells?: Json | null
          subclass_name?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      open5e_backgrounds: {
        Row: {
          created_at: string
          description: string
          document_slug: string
          equipment: string | null
          feature: string | null
          feature_desc: string | null
          id: string
          languages: string | null
          name: string
          skill_proficiencies: string | null
          slug: string
        }
        Insert: {
          created_at?: string
          description: string
          document_slug: string
          equipment?: string | null
          feature?: string | null
          feature_desc?: string | null
          id?: string
          languages?: string | null
          name: string
          skill_proficiencies?: string | null
          slug: string
        }
        Update: {
          created_at?: string
          description?: string
          document_slug?: string
          equipment?: string | null
          feature?: string | null
          feature_desc?: string | null
          id?: string
          languages?: string | null
          name?: string
          skill_proficiencies?: string | null
          slug?: string
        }
        Relationships: []
      }
      open5e_classes: {
        Row: {
          archetypes: Json | null
          created_at: string
          description: string
          document_slug: string
          equipment: string | null
          hit_die: number
          id: string
          name: string
          prof_armor: string | null
          prof_saving_throws: string | null
          prof_skills: string | null
          prof_tools: string | null
          prof_weapons: string | null
          slug: string
          spellcasting_ability: string | null
          subtypes_name: string | null
        }
        Insert: {
          archetypes?: Json | null
          created_at?: string
          description: string
          document_slug: string
          equipment?: string | null
          hit_die: number
          id?: string
          name: string
          prof_armor?: string | null
          prof_saving_throws?: string | null
          prof_skills?: string | null
          prof_tools?: string | null
          prof_weapons?: string | null
          slug: string
          spellcasting_ability?: string | null
          subtypes_name?: string | null
        }
        Update: {
          archetypes?: Json | null
          created_at?: string
          description?: string
          document_slug?: string
          equipment?: string | null
          hit_die?: number
          id?: string
          name?: string
          prof_armor?: string | null
          prof_saving_throws?: string | null
          prof_skills?: string | null
          prof_tools?: string | null
          prof_weapons?: string | null
          slug?: string
          spellcasting_ability?: string | null
          subtypes_name?: string | null
        }
        Relationships: []
      }
      open5e_equipment: {
        Row: {
          ac: number | null
          ac_add_dex: boolean | null
          ac_base: number | null
          ac_cap_dex: number | null
          category: string | null
          cost_quantity: number | null
          cost_unit: string | null
          created_at: string
          damage_dice: string | null
          damage_type: string | null
          description: string
          dex_bonus: boolean | null
          document_slug: string
          id: string
          max_dex_bonus: number | null
          name: string
          properties: Json | null
          rarity: string
          requires_attunement: boolean
          slug: string
          type: string
          weight: number | null
        }
        Insert: {
          ac?: number | null
          ac_add_dex?: boolean | null
          ac_base?: number | null
          ac_cap_dex?: number | null
          category?: string | null
          cost_quantity?: number | null
          cost_unit?: string | null
          created_at?: string
          damage_dice?: string | null
          damage_type?: string | null
          description: string
          dex_bonus?: boolean | null
          document_slug: string
          id?: string
          max_dex_bonus?: number | null
          name: string
          properties?: Json | null
          rarity?: string
          requires_attunement?: boolean
          slug: string
          type: string
          weight?: number | null
        }
        Update: {
          ac?: number | null
          ac_add_dex?: boolean | null
          ac_base?: number | null
          ac_cap_dex?: number | null
          category?: string | null
          cost_quantity?: number | null
          cost_unit?: string | null
          created_at?: string
          damage_dice?: string | null
          damage_type?: string | null
          description?: string
          dex_bonus?: boolean | null
          document_slug?: string
          id?: string
          max_dex_bonus?: number | null
          name?: string
          properties?: Json | null
          rarity?: string
          requires_attunement?: boolean
          slug?: string
          type?: string
          weight?: number | null
        }
        Relationships: []
      }
      open5e_races: {
        Row: {
          age: string
          alignment: string
          asi: Json
          created_at: string
          description: string
          document_slug: string
          id: string
          languages: string
          name: string
          proficiencies: string | null
          size: string
          slug: string
          speed: Json
          subraces: Json | null
          traits: string | null
        }
        Insert: {
          age: string
          alignment: string
          asi?: Json
          created_at?: string
          description: string
          document_slug: string
          id?: string
          languages: string
          name: string
          proficiencies?: string | null
          size: string
          slug: string
          speed?: Json
          subraces?: Json | null
          traits?: string | null
        }
        Update: {
          age?: string
          alignment?: string
          asi?: Json
          created_at?: string
          description?: string
          document_slug?: string
          id?: string
          languages?: string
          name?: string
          proficiencies?: string | null
          size?: string
          slug?: string
          speed?: Json
          subraces?: Json | null
          traits?: string | null
        }
        Relationships: []
      }
      open5e_spells: {
        Row: {
          attack_type: string | null
          casting_time: string
          classes: Json
          components: string
          concentration: boolean
          created_at: string
          damage_type: string | null
          description: string
          document_slug: string
          duration: string
          higher_level: string | null
          id: string
          level: string
          material: string | null
          name: string
          range_value: string
          ritual: boolean
          save_type: string | null
          school: string
          slug: string
        }
        Insert: {
          attack_type?: string | null
          casting_time: string
          classes?: Json
          components: string
          concentration?: boolean
          created_at?: string
          damage_type?: string | null
          description: string
          document_slug: string
          duration: string
          higher_level?: string | null
          id?: string
          level: string
          material?: string | null
          name: string
          range_value: string
          ritual?: boolean
          save_type?: string | null
          school: string
          slug: string
        }
        Update: {
          attack_type?: string | null
          casting_time?: string
          classes?: Json
          components?: string
          concentration?: boolean
          created_at?: string
          damage_type?: string | null
          description?: string
          document_slug?: string
          duration?: string
          higher_level?: string | null
          id?: string
          level?: string
          material?: string | null
          name?: string
          range_value?: string
          ritual?: boolean
          save_type?: string | null
          school?: string
          slug?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
