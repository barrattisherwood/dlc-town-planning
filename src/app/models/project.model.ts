/**
 * Shared Project interface for components
 * This represents the flattened structure used throughout the app
 * When CMS is connected, data will be mapped from ContentEntry<ProjectData> to this format
 */
export interface Project {
  id: string;
  title: string;
  slug?: string;
  location: string;
  region: string;
  country: string;
  category: string;
  description: string;
  image?: string;
  images?: string[];
  videoUrl?: string;
  projectUrl?: string;
  latitude?: number;
  longitude?: number;
  boundary?: { lat: number; lng: number }[] | [number, number][];
  featured?: boolean;
  completionDate?: string;
}

/**
 * Service interface for components
 */
export interface Service {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  icon?: string;
  image?: string;
  category?: string;
  featured?: boolean;
  order?: number;
}

/**
 * Pillar interface for components
 */
export interface Pillar {
  id: string;
  title: string;
  description: string;
  icon?: string;
  order?: number;
}
