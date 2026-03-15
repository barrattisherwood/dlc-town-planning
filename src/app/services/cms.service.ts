import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// ============================================================================
// API Response Wrapper
// ============================================================================

/**
 * Standard API response wrapper from Arclink CMS
 * All list endpoints return this structure
 */
export interface ApiResponse<T> {
  entries: T[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Generic content entry from CMS
 * All content types follow this structure with data nested under .data
 */
export interface ContentEntry<T = any> {
  _id: string;
  slug: string;
  published: boolean;
  data: T;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Content Data Structures (nested under entry.data)
// ============================================================================

/**
 * Project content fields
 * Access as: entry.data.title, entry.data.location, etc.
 */
export interface ProjectData {
  title: string;
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
  boundary?: [number, number][];
  featured?: boolean;
  completionDate?: string;
}

/**
 * Project content entry type
 */
export type Project = ContentEntry<ProjectData>;

/**
 * Service content fields
 * Access as: entry.data.title, entry.data.summary, etc.
 */
export interface ServiceData {
  title: string;
  summary: string;
  description: string;
  icon: string;
  category?: string;
  image?: string;
  featured?: boolean;
  order?: number;
}

/**
 * Service content entry type
 */
export type Service = ContentEntry<ServiceData>;

/**
 * Site settings content fields
 * Access as: entry.data.companyName, entry.data.mission, etc.
 */
export interface SiteSettingsData {
  companyName: string;
  companyStory: string;
  mission: string;
  vision: string;
  yearsEstablished: string;
  accreditations: string[];
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
  };
  pillars?: Pillar[];
  teamMembers?: TeamMember[];
}

/**
 * Site settings content entry type
 */
export type SiteSettings = ContentEntry<SiteSettingsData>;

export interface Pillar {
  title: string;
  description: string;
  icon?: string;
}

export interface TeamMember {
  name: string;
  title: string;
  bio?: string;
  email?: string;
  image?: string;
}

/**
 * Post/News content fields (future use)
 */
export interface PostData {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  image: string;
  publishedAt: string;
}

export type Post = ContentEntry<PostData>;

// ============================================================================
// CMS Service
// ============================================================================

@Injectable({
  providedIn: 'root'
})
export class CmsService {
  private http = inject(HttpClient);
  private readonly API_BASE_URL = environment.cmsApiUrl;
  private readonly SITE_ID = environment.cmsSiteId;

  /**
   * Get all published projects
   * @returns Observable of Project array with data nested under .data
   */
  getProjects(): Observable<Project[]> {
    return this.http.get<ApiResponse<Project>>(
      `${this.API_BASE_URL}/entries/${this.SITE_ID}/project?published=true`
    ).pipe(map(response => response.entries));
  }

  /**
   * Get featured projects only
   * Note: featured filter maps to data.featured in CMS
   */
  getFeaturedProjects(): Observable<Project[]> {
    return this.http.get<ApiResponse<Project>>(
      `${this.API_BASE_URL}/entries/${this.SITE_ID}/project?published=true&featured=true`
    ).pipe(map(response => response.entries));
  }

  /**
   * Get single project by slug
   */
  getProjectBySlug(slug: string): Observable<Project | undefined> {
    return this.http.get<ApiResponse<Project>>(
      `${this.API_BASE_URL}/entries/${this.SITE_ID}/project/${slug}`
    ).pipe(map(response => response.entries[0]));
  }

  /**
   * Get projects with pagination
   */
  getProjectsPaginated(limit: number = 50, offset: number = 0): Observable<ApiResponse<Project>> {
    return this.http.get<ApiResponse<Project>>(
      `${this.API_BASE_URL}/entries/${this.SITE_ID}/project?published=true&limit=${limit}&offset=${offset}`
    );
  }

  /**
   * Get all published services
   */
  getServices(): Observable<Service[]> {
    return this.http.get<ApiResponse<Service>>(
      `${this.API_BASE_URL}/entries/${this.SITE_ID}/service?published=true`
    ).pipe(map(response => response.entries));
  }

  /**
   * Get featured services only
   */
  getFeaturedServices(): Observable<Service[]> {
    return this.http.get<ApiResponse<Service>>(
      `${this.API_BASE_URL}/entries/${this.SITE_ID}/service?published=true&featured=true`
    ).pipe(map(response => response.entries));
  }

  /**
   * Get single service by slug
   */
  getServiceBySlug(slug: string): Observable<Service | undefined> {
    return this.http.get<ApiResponse<Service>>(
      `${this.API_BASE_URL}/entries/${this.SITE_ID}/service/${slug}`
    ).pipe(map(response => response.entries[0]));
  }

  /**
   * Get site settings
   * Note: site-settings is an entry type, not a separate endpoint
   */
  getSiteSettings(): Observable<SiteSettings | undefined> {
    return this.http.get<ApiResponse<SiteSettings>>(
      `${this.API_BASE_URL}/entries/${this.SITE_ID}/site-settings`
    ).pipe(map(response => response.entries[0]));
  }

  /**
   * Get all published posts (future use)
   */
  getPosts(limit?: number, offset?: number): Observable<Post[]> {
    let url = `${this.API_BASE_URL}/entries/${this.SITE_ID}/post?published=true`;
    if (limit) url += `&limit=${limit}`;
    if (offset) url += `&offset=${offset}`;
    
    return this.http.get<ApiResponse<Post>>(url)
      .pipe(map(response => response.entries));
  }

  /**
   * Get single post by slug (future use)
   */
  getPostBySlug(slug: string): Observable<Post | undefined> {
    return this.http.get<ApiResponse<Post>>(
      `${this.API_BASE_URL}/entries/${this.SITE_ID}/post/${slug}`
    ).pipe(map(response => response.entries[0]));
  }
}
