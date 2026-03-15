# DLC Town Planning — Content API Integration Guide

**API Base URL:** `https://content.arclink.dev`  
**Environment:** Production  
**Last updated:** March 2026

---

## Overview

This document outlines the integration requirements for the DLC Town Planning CMS Content API. The frontend Angular application consumes content from the Arclink CMS to display projects, services, news, and other dynamic content.

**API Structure:**
- All content accessed via `/entries/{site}/{typeSlug}` pattern
- Site identifier: `dlc-townplanning`
- Response includes pagination wrapper: `{ entries, total, limit, offset }`
- Content fields nested under `.data` property
- Access fields as `entry.data.title`, NOT `entry.title`

**Critical Points:**
- ❌ No `/api` prefix in base URL
- ❌ No separate `/about` endpoint — use `/entries/dlc-townplanning/site-settings`
- ✅ All content types follow unified `/entries/{site}/{type}` pattern
- ✅ Metadata (\_id, slug, published, timestamps) at root level
- ✅ Content fields (title, description, etc.) nested under `.data`
- ✅ Featured filter `?featured=true` maps to `data.featured`

---

## API Endpoints

### 1. Projects

**List Endpoint:** `GET /entries/dlc-townplanning/project?published=true`

**Single Entry:** `GET /entries/dlc-townplanning/project/{slug}`

**Purpose:** Retrieve all published projects for display on the projects page and featured projects on the home page.

**Query Parameters:**
- `published` (boolean, required): Filter for published projects only
- `featured` (boolean, optional): Filter for featured projects (maps to `data.featured`)
- `limit` (number, optional): Limit number of results (default: 50)
- `offset` (number, optional): Pagination offset (default: 0)

**Response Format:**
```json
{
  "entries": [
    {
      "_id": "string",
      "slug": "string",
      "published": true,
      "data": {
        "title": "string",
        "location": "string",
        "region": "string",
        "country": "string",
        "category": "string",
        "description": "string (markdown supported)",
        "image": "string (URL)",
        "images": ["string (URL)", "..."],
        "videoUrl": "string (YouTube/Vimeo URL, optional)",
        "projectUrl": "string (external website URL, optional)",
        "latitude": "number (optional)",
        "longitude": "number (optional)",
        "boundary": ["array of [lat, lng] coordinates (optional)"],
        "featured": "boolean",
        "completionDate": "string (YYYY format or full date)"
      },
      "createdAt": "ISO 8601 timestamp",
      "updatedAt": "ISO 8601 timestamp"
    }
  ],
  "total": 25,
  "limit": 50,
  "offset": 0
}
```

**Frontend Integration:**
- File: `src/app/services/cms.service.ts`
- Method: `getProjects()` and `getFeaturedProjects()`
- Used by: `ProjectsComponent`, `HomeComponent`
- **Important:** Access fields via `entry.data.title`, NOT `entry.title`

**Example Requests:**
```bash
# All published projects
GET https://content.arclink.dev/entries/dlc-townplanning/project?published=true

# Featured projects only
GET https://content.arclink.dev/entries/dlc-townplanning/project?published=true&featured=true

# Single project by slug
GET https://content.arclink.dev/entries/dlc-townplanning/project/tatu-city-kenya
```

---

### 2. Services

**List Endpoint:** `GET /entries/dlc-townplanning/service?published=true`

**Single Entry:** `GET /entries/dlc-townplanning/service/{slug}`

**Purpose:** Retrieve all published services for display on the services page and home page teasers.

**Query Parameters:**
- `published` (boolean, required): Filter for published services only
- `featured` (boolean, optional): Filter for featured services (maps to `data.featured`)
- `limit` (number, optional): Limit number of results
- `offset` (number, optional): Pagination offset

**Response Format:**
```json
{
  "entries": [
    {
      "_id": "string",
      "slug": "string",
      "published": true,
      "data": {
        "title": "string",
        "summary": "string (short description)",
        "description": "string (full markdown content)",
        "icon": "string (icon identifier: 'land', 'township', 'environment', etc.)",
        "category": "string (optional)",
        "image": "string (URL, optional)",
        "featured": "boolean",
        "order": "number (for sorting)"
      },
      "createdAt": "ISO 8601 timestamp",
      "updatedAt": "ISO 8601 timestamp"
    }
  ],
  "total": 12,
  "limit": 50,
  "offset": 0
}
```

**Frontend Integration:**
- File: `src/app/services/cms.service.ts`
- Method: `getServices()` and `getServiceBySlug(slug: string)`
- Used by: `ServicesComponent`, `ServiceDetailComponent`, `HomeComponent`
- **Important:** Access fields via `entry.data.title`, NOT `entry.title`

**Example Requests:**
```bash
# All published services
GET https://content.arclink.dev/entries/dlc-townplanning/service?published=true

# Featured services only
GET https://content.arclink.dev/entries/dlc-townplanning/service?published=true&featured=true

# Single service by slug
GET https://content.arclink.dev/entries/dlc-townplanning/service/land-use-planning
```

---

### 3. Site Settings

**Endpoint:** `GET /entries/dlc-townplanning/site-settings`

**Purpose:** Retrieve site-wide configuration including company information, mission, vision, and other global settings.

**Note:** There is no `/about` endpoint. Site settings are stored as a content entry type.

**Response Format:**
```json
{
  "entries": [
    {
      "_id": "string",
      "slug": "site-settings",
      "published": true,
      "data": {
        "companyName": "DLC Town Planning",
        "companyStory": "string (markdown)",
        "mission": "string",
        "vision": "string",
        "yearsEstablished": "string (YYYY)",
        "accreditations": ["string", "..."],
        "contactEmail": "string",
        "contactPhone": "string",
        "address": "string",
        "socialMedia": {
          "linkedin": "string (URL)",
          "twitter": "string (URL)"
        },
        "pillars": [
          {
            "title": "string",
            "description": "string",
            "icon": "string (optional)"
          }
        ],
        "teamMembers": [
          {
            "name": "string",
            "title": "string",
            "bio": "string (optional)",
            "email": "string (optional)",
            "image": "string (URL, optional)"
          }
        ]
      },
      "createdAt": "ISO 8601 timestamp",
      "updatedAt": "ISO 8601 timestamp"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

**Frontend Integration:**
- File: `src/app/services/cms.service.ts`
- Method: `getSiteSettings()`
- Used by: `AboutComponent`, `FooterComponent`, `HeaderComponent`
- **Important:** Access fields via `entry.data.companyName`, NOT `entry.companyName`

---

### 4. News/Blog Posts (Future)

**List Endpoint:** `GET /entries/dlc-townplanning/post?published=true`

**Single Entry:** `GET /entries/dlc-townplanning/post/{slug}`

**Purpose:** Retrieve blog posts and news articles.

**Query Parameters:**
- `published` (boolean, required)
- `limit` (number, optional): Number of posts to return
- `offset` (number, optional): Pagination offset
- `category` (string, optional): Filter by category

**Response Format:**
```json
{
  "entries": [
    {
      "_id": "string",
      "slug": "string",
      "published": true,
      "data": {
        "title": "string",
        "excerpt": "string",
        "content": "string (markdown)",
        "author": "string",
        "category": "string",
        "tags": ["string", "..."],
        "image": "string (URL)",
        "publishedAt": "ISO 8601 timestamp"
      },
      "createdAt": "ISO 8601 timestamp",
      "updatedAt": "ISO 8601 timestamp"
    }
  ],
  "total": 10,
  "limit": 20,
  "offset": 0
}
```

**Important:** Access fields via `entry.data.title`, NOT `entry.title`

---

## Frontend Data Models

### TypeScript Interfaces

Located in: `src/app/services/cms.service.ts`

```typescript
// API Response wrapper
export interface ApiResponse<T> {
  entries: T[];
  total: number;
  limit: number;
  offset: number;
}

// Generic content entry from CMS
export interface ContentEntry<T = any> {
  _id: string;
  slug: string;
  published: boolean;
  data: T;
  createdAt: string;
  updatedAt: string;
}

// Project data structure (nested under .data)
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

// Project content entry
export type Project = ContentEntry<ProjectData>;

// Service data structure (nested under .data)
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

// Service content entry
export type Service = ContentEntry<ServiceData>;

// Site settings data structure (nested under .data)
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

// Site settings content entry
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
```

---

## Service Implementation

### CMS Service (`src/app/services/cms.service.ts`)

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CmsService {
  private http = inject(HttpClient);
  private apiUrl = 'https://content.arclink.dev';
  private siteId = 'dlc-townplanning';

  /**
   * Get all published projects
   * Returns entries with data nested under .data property
   */
  getProjects(): Observable<Project[]> {
    return this.http.get<ApiResponse<Project>>(
      `${this.apiUrl}/entries/${this.siteId}/project?published=true`
    ).pipe(map(response => response.entries));
  }

  /**
   * Get featured projects only
   * Note: featured filter maps to data.featured in CMS
   */
  getFeaturedProjects(): Observable<Project[]> {
    return this.http.get<ApiResponse<Project>>(
      `${this.apiUrl}/entries/${this.siteId}/project?published=true&featured=true`
    ).pipe(map(response => response.entries));
  }

  /**
   * Get single project by slug
   */
  getProjectBySlug(slug: string): Observable<Project | undefined> {
    return this.http.get<ApiResponse<Project>>(
      `${this.apiUrl}/entries/${this.siteId}/project/${slug}`
    ).pipe(map(response => response.entries[0]));
  }

  /**
   * Get all published services
   */
  getServices(): Observable<Service[]> {
    return this.http.get<ApiResponse<Service>>(
      `${this.apiUrl}/entries/${this.siteId}/service?published=true`
    ).pipe(map(response => response.entries));
  }

  /**
   * Get single service by slug
   */
  getServiceBySlug(slug: string): Observable<Service | undefined> {
    return this.http.get<ApiResponse<Service>>(
      `${this.apiUrl}/entries/${this.siteId}/service/${slug}`
    ).pipe(map(response => response.entries[0]));
  }

  /**
   * Get site settings
   * Note: site-settings is an entry type, not a separate endpoint
   */
  getSiteSettings(): Observable<SiteSettings | undefined> {
    return this.http.get<ApiResponse<SiteSettings>>(
      `${this.apiUrl}/entries/${this.siteId}/site-settings`
    ).pipe(map(response => response.entries[0]));
  }
}
```

**Key Points:**
- Base URL: `https://content.arclink.dev` (no /api prefix)
- All endpoints follow `/entries/{site}/{type}` pattern
- Responses wrapped in `{ entries, total, limit, offset }`
- Content fields nested under `.data` property
- Use `response.entries` to extract array
- Access fields as `entry.data.title`, NOT `entry.title`

---

## Component Integration Examples

### Projects Page (`src/app/pages/projects/projects.component.ts`)

```typescript
export class ProjectsComponent implements OnInit {
  private cmsService = inject(CmsService);
  
  projects = signal<Project[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.cmsService.getProjects().subscribe({
      next: (projects) => {
        this.projects.set(projects);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load projects:', error);
        this.loading.set(false);
      }
    });
  }
}
```

**Template Usage:**
```html
<div *ngFor="let project of projects()">
  <!-- Access fields via .data property -->
  <h3>{{ project.data.title }}</h3>
  <p>{{ project.data.location }}</p>
  <p>{{ project.data.description }}</p>
  <img [src]="project.data.image" [alt]="project.data.title">
</div>
```

### Home Page Featured Projects (`src/app/pages/home/home.component.ts`)

```typescript
export class HomeComponent implements OnInit {
  private cmsService = inject(CmsService);
  
  featuredProjects = signal<Project[]>([]);

  ngOnInit() {
    this.cmsService.getFeaturedProjects().subscribe({
      next: (projects) => {
        this.featuredProjects.set(projects);
      },
      error: (error) => {
        console.error('Failed to load featured projects:', error);
      }
    });
  }
}
```

**Template Usage:**
```html
<div *ngFor="let project of featuredProjects()">
  <!-- Remember: fields are under .data -->
  <h4>{{ project.data.title }}</h4>
  <span>{{ project.data.location }}</span>
</div>
```

**CRITICAL:** Always access content fields via `entry.data.fieldName`, NOT `entry.fieldName`

---

## API Requirements & Constraints

### Required Fields
- `_id` unique identifier for each entry
- `slug` must be URL-safe (lowercase, hyphens only)
- `published` boolean controls visibility on frontend
- All content fields nested under `.data` property

### Optional Fields
- Fields within `.data` marked optional can be `null` or omitted
- Frontend will handle missing optional fields gracefully
- Metadata fields (`createdAt`, `updatedAt`) always present

### Image URLs
- Must be fully qualified URLs (https://)
- Recommended formats: JPEG, PNG, WebP
- Recommended sizes:
  - Project cards: 800x600px minimum
  - Hero images: 1920x1080px minimum
  - Thumbnails: 400x300px

### Video URLs
- Supported: YouTube, Vimeo
- Format: Full video URL (e.g., `https://www.youtube.com/watch?v=...`)
- Frontend extracts video ID and converts to embed format

### Markdown Support
- Fields supporting markdown: `description`, `companyStory`, `content`
- Frontend uses markdown parser for rendering
- Supported: headings, lists, bold, italic, links, images

---

## Error Handling

### API Errors

The frontend expects standard HTTP status codes:

- `200 OK` - Successful request
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

**Error Response Format:**
```json
{
  "error": {
    "message": "string",
    "code": "string",
    "details": {}
  }
}
```

### Frontend Fallbacks

- Loading states displayed during API calls
- Error messages shown on failure
- Fallback to placeholder data if API unavailable
- Graceful degradation for missing images

---

## CORS Configuration

The API must allow requests from:
- `http://localhost:4201` (development)
- `https://dlctownplanning.co.za` (production)
- `https://www.dlctownplanning.co.za` (production)

**Required CORS Headers:**
```
Access-Control-Allow-Origin: <origin>
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## Performance Considerations

### Caching
- API responses should include appropriate cache headers
- Recommended: `Cache-Control: public, max-age=300` (5 minutes)
- ETags supported for conditional requests

### Pagination
- API supports `limit` and `offset` query parameters
- Default limit: 50 items
- Response includes `total`, `limit`, and `offset` for pagination tracking
- Example: `?published=true&limit=20&offset=40` for page 3 of results

### Response Size
- Keep individual API responses under 1MB
- Use image CDN for large media files
- Return image URLs, not base64 encoded data

---

## Testing Endpoints

### Development Testing

Test the API endpoints using curl:

```bash
# Get all published projects
curl -X GET "https://content.arclink.dev/entries/dlc-townplanning/project?published=true"

# Get featured projects only
curl -X GET "https://content.arclink.dev/entries/dlc-townplanning/project?published=true&featured=true"

# Get single project by slug
curl -X GET "https://content.arclink.dev/entries/dlc-townplanning/project/tatu-city-kenya"

# Get all services
curl -X GET "https://content.arclink.dev/entries/dlc-townplanning/service?published=true"

# Get single service by slug
curl -X GET "https://content.arclink.dev/entries/dlc-townplanning/service/land-use-planning"

# Get site settings
curl -X GET "https://content.arclink.dev/entries/dlc-townplanning/site-settings"

# Test pagination
curl -X GET "https://content.arclink.dev/entries/dlc-townplanning/project?published=true&limit=10&offset=0"
```

### Expected Response Structure

All responses follow this format:
```json
{
  "entries": [
    {
      "_id": "...",
      "slug": "...",
      "published": true,
      "data": {
        "title": "...",
        // ... other content fields
      },
      "createdAt": "2026-03-01T10:00:00.000Z",
      "updatedAt": "2026-03-15T14:30:00.000Z"
    }
  ],
  "total": 25,
  "limit": 50,
  "offset": 0
}
```

---

## Deployment Checklist

- [ ] API endpoints return correct data structure with `{ entries, total, limit, offset }` wrapper
- [ ] All entries include `_id`, `slug`, `published`, `data`, `createdAt`, `updatedAt` fields
- [ ] Content fields properly nested under `.data` property
- [ ] All required `.data` fields are populated
- [ ] Image URLs are accessible and properly formatted
- [ ] CORS headers configured for production domains
- [ ] Cache headers configured appropriately
- [ ] Error responses follow standard format
- [ ] Pagination working with `limit` and `offset` parameters
- [ ] Featured filter (`?featured=true`) maps correctly to `data.featured`
- [ ] Site settings accessible at `/entries/dlc-townplanning/site-settings`
- [ ] Single entry endpoints working: `/entries/{site}/{type}/{slug}`
- [ ] SSL certificate valid for `content.arclink.dev`
- [ ] API rate limiting configured (if applicable)
- [ ] Monitoring and logging in place

---

## Contact & Support

**Frontend Developer:** [Contact details]  
**API Developer:** [Contact details]  
**Project Manager:** [Contact details]

**Issue Reporting:**  
Create issues in the project repository with:
- Endpoint URL
- Request parameters
- Expected response
- Actual response
- Timestamp

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-03-14 | 1.0 | Initial API integration specification |

