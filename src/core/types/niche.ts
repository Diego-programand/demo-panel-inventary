/**
 * ========================================================
 * ADAPTADORES DE NICHO (PLUGGABLE NICHE PROFILES)
 * ========================================================
 */

export type NicheId = 
  | 'retail_fashion'
  | 'pharma_health'
  | 'tech_electronics'
  | 'food_beverage';

export interface NicheFieldDefinition {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'tags';
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

export interface NicheProfile {
  id: NicheId;
  name: string;
  tagline: string;
  icon: string;
  accentColor: string;
  vocabulary: {
    itemSingular: string;
    itemPlural: string;
    categoryLabel: string;
    locationLabel: string;
    unitDefault: string;
  };
  customFields: NicheFieldDefinition[];
  sampleCategories: string[];
}
