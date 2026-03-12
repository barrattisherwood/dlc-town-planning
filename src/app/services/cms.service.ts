import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Interfaces for CMS content types
export interface Pillar {
  id: string;
  title: string;
  description: string;
  icon?: string;
  order?: number;
}

export interface Service {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  icon?: string;
  image?: string;
  order?: number;
}

export interface Project {
  id: string;
  title: string;
  location: string;
  category: string;
  description: string;
  image?: string;
  latitude?: number;
  longitude?: number;
  featured?: boolean;
  completionDate?: string;
}

export interface AboutContent {
  id: string;
  companyStory: string;
  mission?: string;
  vision?: string;
  values?: string[];
  yearsEstablished?: string;
  accreditations?: string[];
}

export interface CMSResponse<T> {
  data: T[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class CmsService {
  private http = inject(HttpClient);
  private readonly API_BASE_URL = environment.cmsApiUrl;
  private readonly SITE_ID = environment.cmsSiteId;

  constructor() { }

  getPillars(): Observable<CMSResponse<Pillar>> {
    const url = `${this.API_BASE_URL}/${this.SITE_ID}/pillars`;
    return this.http.get<CMSResponse<Pillar>>(url);
  }

  getServices(): Observable<CMSResponse<Service>> {
    const url = `${this.API_BASE_URL}/${this.SITE_ID}/services`;
    return this.http.get<CMSResponse<Service>>(url);
  }

  getServiceBySlug(slug: string): Observable<Service> {
    const url = `${this.API_BASE_URL}/${this.SITE_ID}/services/${slug}`;
    return this.http.get<Service>(url);
  }

  getProjects(featured?: boolean, limit?: number): Observable<CMSResponse<Project>> {
    const url = `${this.API_BASE_URL}/${this.SITE_ID}/projects`;
    let params = new HttpParams();
    
    if (featured !== undefined) {
      params = params.set('featured', featured.toString());
    }
    if (limit) {
      params = params.set('limit', limit.toString());
    }

    return this.http.get<CMSResponse<Project>>(url, { params });
  }

  getAboutContent(): Observable<AboutContent> {
    const url = `${this.API_BASE_URL}/${this.SITE_ID}/about`;
    return this.http.get<AboutContent>(url);
  }
}
