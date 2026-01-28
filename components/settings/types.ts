export interface SystemSettings {
  // Context
  title: string;
  address: string;
  gpsLocation: string;
  surface: number;
  soilType: string;
  
  // System
  specifications: string[];
  irrigation: boolean;
  description: string;
}

export interface WikiPage {
  id: number;
  page_name: string;
  page_id: number;
  wiki_locale: string;
}
