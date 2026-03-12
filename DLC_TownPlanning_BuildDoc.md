# DLC Town Planning — Angular Site Build Brief
**Client:** DLC Town Planning (Pty) Ltd  
**Domain:** TBD (dlcgroup.co.za or dlctownplan.co.za — confirm with client)  
**Stack:** Angular 18+, TailwindCSS, Angular Signals  
**CMS:** content.arclink.dev (`siteId: dlc-townplanning`)  
**Forms:** forms.arclink.dev  
**Hosted:** Vercel  
**Last updated:** March 2026

---

## 1. Overview

A full rebuild of the DLC Town Planning website. Replace an outdated Wix site with a professional Angular application. The site presents DLC as an authoritative, experienced African town planning and project management firm. Content is managed via the arclink.dev CMS — the client does not touch code.

**Business goal:** Position DLC credibly for new project inquiries from both South African and broader African markets. The projects map is the hero feature — it communicates geographic reach immediately.

---

## 2. Brand & Design

### Colour Palette

```scss
:root {
  --navy:      #0a1628;   // primary — headers, nav, dark sections
  --teal:      #0e7c72;   // secondary — accents, CTAs, highlights
  --teal-l:    #12a89b;   // teal lighter — hover states, badges
  --white:     #ffffff;
  --off-white: #f5f7f8;   // page background
  --warm-grey: #e8ecef;   // borders, dividers
  --text:      #1a2b3c;   // body copy
  --muted:     #5a6b7a;   // secondary text
  --tertiary:  #6C737B;   // tertiary — additional UI elements, subtle accents
}
```

### Typography

- **Primary (headings):** Avenir — the font used across the existing site. Load via `@font-face` if licensed, or use Nunito as a close web-safe fallback from Google Fonts.
- **Body:** DM Sans or similar clean sans-serif
- **Confirm** exact font assets or licence with Fanus

### Logo

- Logo mark is an image file — obtain SVG or AI source from Fanus
- Do not attempt to recreate from the Wix site (it uses a rasterised export)
- Placeholder: use text "DLC Town Planning" in Avenir until asset is received

---

## 3. Site Architecture

```
/                     Home
/about                About
/services             Services overview
/services/[slug]      Individual service (CMS-driven)
/projects             Interactive map + project browser
/contact              Contact form + details
```

Six routes total. No blog. No individual team member profile pages.

---

## 4. Page Specifications

---

### 4.1 Home `/`

**Sections in order:**

1. **Hero** — full-viewport, navy background, DLC logo, headline, sub-headline, dual CTAs ("View Our Projects" → `/projects`, "Get in Touch" → `/contact`). Background: subtle topographic or geometric pattern, or a high-quality aerial/urban planning image if supplied by client.

2. **Company Pillars** — 3–4 cards pulled from CMS (`pillar` content type). Icon, title, short description. Horizontal row or 2×2 grid. Content TBD from client — use placeholder text during build.

3. **Services Teaser** — grid of service cards (from CMS `service` type), each linking to `/services/[slug]`. Show icon, title, one-line summary. "View All Services" CTA.

4. **Projects Teaser** — 3 featured projects pulled from CMS (`?featured=true&limit=3`). Card layout: image, title, location, category tag. CTA → `/projects`.

5. **About Strip** — short company statement, years established, key accreditations. Navy background. CTA → `/about`.

6. **Contact CTA** — full-width band. "Ready to discuss your project?" + CTA button → `/contact`.

---

### 4.2 About `/about`

**Sections:**

1. **Page Hero** — page title, breadcrumb, short intro paragraph

2. **Company Story** — multi-paragraph richtext from CMS. DLC's history, founding, growth into African markets.

3. **Company Pillars** — same pillars as homepage, expanded. Larger cards with fuller description text.

4. **Accreditations** — logos or listed names of professional bodies DLC is registered with. Content from client — static for v1.

5. **Team Photo** — single team photo from CMS (`team` content type). Optional caption. No individual profiles.

---

### 4.3 Services Overview `/services`

Card grid. Each card:
- Service title
- Short summary (1–2 sentences)
- Optional icon
- Links to `/services/[slug]`

Cards pulled from CMS `service` content type, ordered by `order` field.

---

### 4.4 Service Detail `/services/[slug]`

Dynamic route. Fetches single `service` entry by slug from content API.

**Layout:**
- Page hero: service title, breadcrumb
- Full richtext body (rendered markdown)
- Contact CTA at bottom

**If slug not found:** redirect to `/services`.

---

### 4.5 Projects `/projects`

**The flagship page.** Split-panel layout:

```
┌─────────────────────┬──────────────────────┐
│                     │                      │
│   Google Maps       │  Scrollable sidebar  │
│   (left, ~60%)      │  project cards       │
│                     │  (right, ~40%)       │
│                     │                      │
└─────────────────────┴──────────────────────┘
```

**Filter bar** above the split:
- Region: All / South Africa / Africa / International
- Category: All / Master Planning / Town Planning / Project Management / Environmental

**Map behaviour:**
- All published projects rendered as markers
- Marker click → highlights sidebar card + opens project modal
- Card click → pans map to marker + opens project modal
- Active marker: teal, others navy

**Project modal:**
- Project title, location, category tag
- Full description (richtext/markdown rendered)
- Image gallery (carousel)
- Optional video embed (YouTube/Vimeo iframe from `videoUrl`)
- Optional external URL button
- Per-project map embed (zoomed to project coordinates)
- Close button / backdrop click to dismiss

**Sidebar cards:**
- Thumbnail (first image from `images` array)
- Project title
- Location name + country
- Category tag (colour-coded)
- Highlighted state when active

**Data:** `GET content.arclink.dev/api/sites/dlc-townplanning/project?published=true`  
Filter client-side (project count is small enough for v1).

**Google Maps:**
- Use `@angular/google-maps`
- API key in environment variables
- Custom map style: muted/dark to match brand (generate at mapstyle.withgoogle.com)
- Default center: `-25.7479, 28.2293` (Pretoria)
- Default zoom: 4 (shows southern Africa)

---

### 4.6 Contact `/contact`

**Sections:**

1. **Page hero** — title, short intro

2. **Contact form** — via forms.arclink.dev
   - Fields: Name, Email, Phone (optional), Subject (select dropdown), Message
   - On submit: POST to forms.arclink.dev
   - Success: inline confirmation, no redirect
   - Error: inline error with retry prompt

3. **Contact details** — address, phone, email from CMS `site-settings`

4. **Office location** — static Google Maps embed

---

## 5. Navigation

### Desktop Nav
```
[Logo]   Services   Projects   About   [Contact — teal CTA button]
```
- Sticky on scroll with slight background blur
- Navy background, white text
- Active route: teal bottom border on link
- Logo links to `/`

### Mobile Nav
- Hamburger icon top right
- Full-screen overlay, navy background
- Links stacked vertically, large tap targets
- Close button top right

---

## 6. CMS Integration

### API Base URL
```
https://content.arclink.dev
```

### Site ID
```
dlc-townplanning
```

### Content Types

| Name | Slug | Key Fields | Used On |
|---|---|---|---|
| Project | `project` | title, summary, description, location, coordinates, country, region, category, images, videoUrl, featured | `/projects`, home teaser |
| Service | `service` | title, summary, body, icon, order | `/services`, `/services/:slug`, home |
| Pillar | `pillar` | title, description, icon, order | Home, `/about` |
| Team | `team` | photo, caption | `/about` |
| Site Settings | `site-settings` | email, phone, address, postal, linkedin, facebook | Contact page, footer |

### Angular Service

```typescript
// src/app/core/services/dlc-content.service.ts
import { Injectable, inject } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { environment } from '../../../environments/environment'

@Injectable({ providedIn: 'root' })
export class DlcContentService {
  private http = inject(HttpClient)
  private base = environment.contentApiUrl
  private site = 'dlc-townplanning'

  getProjects(filters?: Record<string, string>) {
    let params = new HttpParams().set('published', 'true')
    if (filters) Object.entries(filters).forEach(([k, v]) => params = params.set(k, v))
    return this.http.get<any[]>(`${this.base}/api/sites/${this.site}/project`, { params })
  }

  getServices() {
    return this.http.get<any[]>(`${this.base}/api/sites/${this.site}/service?published=true`)
  }

  getService(slug: string) {
    return this.http.get<any>(`${this.base}/api/sites/${this.site}/service/${slug}`)
  }

  getPillars() {
    return this.http.get<any[]>(`${this.base}/api/sites/${this.site}/pillar?published=true`)
  }

  getTeam() {
    return this.http.get<any[]>(`${this.base}/api/sites/${this.site}/team?published=true`)
  }

  getSiteSettings() {
    return this.http.get<any>(`${this.base}/api/sites/${this.site}/site-settings/main`)
  }
}
```

---

## 7. Forms Integration

```typescript
// src/app/core/services/dlc-forms.service.ts
import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { environment } from '../../../environments/environment'

@Injectable({ providedIn: 'root' })
export class DlcFormsService {
  private http = inject(HttpClient)

  submitContact(data: {
    name: string
    email: string
    phone?: string
    subject: string
    message: string
  }) {
    return this.http.post(`${environment.formsApiUrl}/api/submit`, {
      siteId: 'dlc-townplanning',
      ...data
    })
  }
}
```

---

## 8. Environment Config

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  contentApiUrl:  'https://content.arclink.dev',
  formsApiUrl:    'https://forms.arclink.dev',
  googleMapsKey:  'YOUR_GOOGLE_MAPS_API_KEY',
}

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  contentApiUrl:  'https://content.arclink.dev',
  formsApiUrl:    'https://forms.arclink.dev',
  googleMapsKey:  'YOUR_GOOGLE_MAPS_API_KEY',
}
```

Set `googleMapsKey` as a Vercel environment variable — do not commit to repo.

---

## 9. Project Structure

```
src/
├── index.html              ← Google Fonts link here
├── styles.scss             ← CSS custom properties, global resets
└── app/
    ├── app.component.ts
    ├── app.config.ts
    ├── app.routes.ts
    │
    ├── core/
    │   └── services/
    │       ├── dlc-content.service.ts
    │       └── dlc-forms.service.ts
    │
    ├── shared/
    │   ├── pipes/
    │   │   └── markdown.pipe.ts
    │   └── components/
    │       ├── nav/
    │       ├── footer/
    │       └── project-modal/
    │
    └── pages/
        ├── home/
        ├── about/
        ├── services/
        │   ├── services-overview/
        │   └── service-detail/
        ├── projects/
        └── contact/
```

---

## 10. Routes

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      { path: '',               loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
      { path: 'about',          loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent) },
      { path: 'services',       loadComponent: () => import('./pages/services/services-overview/services-overview.component').then(m => m.ServicesOverviewComponent) },
      { path: 'services/:slug', loadComponent: () => import('./pages/services/service-detail/service-detail.component').then(m => m.ServiceDetailComponent) },
      { path: 'projects',       loadComponent: () => import('./pages/projects/projects.component').then(m => m.ProjectsComponent) },
      { path: 'contact',        loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent) },
      { path: '**',             redirectTo: '' },
    ]
  }
]
```

---

## 11. Richtext / Markdown Rendering

CMS stores richtext as markdown. Render with a pipe:

```bash
npm install marked
```

```typescript
// src/app/shared/pipes/markdown.pipe.ts
import { Pipe, PipeTransform } from '@angular/core'
import { marked } from 'marked'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'

@Pipe({ name: 'markdown', standalone: true })
export class MarkdownPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(value: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(marked(value || '') as string)
  }
}
```

```html
<div class="prose" [innerHTML]="entry.data.body | markdown"></div>
```

---

## 12. Google Maps Setup

```bash
npm install @angular/google-maps
```

```typescript
// app.config.ts
import { provideGoogleMaps } from '@angular/google-maps'

providers: [
  provideHttpClient(),
  provideRouter(routes),
  provideGoogleMaps(),
]
```

```html
<!-- projects.component.html -->
<google-map height="100%" width="100%" [center]="mapCenter" [zoom]="mapZoom" [options]="mapOptions">
  @for (project of filteredProjects; track project._id) {
    <map-marker
      [position]="{ lat: project.data.coordinates.lat, lng: project.data.coordinates.lng }"
      [title]="project.data.title"
      [options]="getMarkerOptions(project)"
      (mapClick)="onMarkerClick(project)" />
  }
</google-map>
```

```typescript
// projects.component.ts (key signals)
projects        = signal<any[]>([])
activeProject   = signal<any | null>(null)
regionFilter    = signal<string>('all')
categoryFilter  = signal<string>('all')

filteredProjects = computed(() => {
  return this.projects().filter(p => {
    const regionMatch   = this.regionFilter()   === 'all' || p.data.region   === this.regionFilter()
    const categoryMatch = this.categoryFilter() === 'all' || p.data.category === this.categoryFilter()
    return regionMatch && categoryMatch
  })
})

mapCenter = { lat: -25.7479, lng: 28.2293 }
mapZoom   = 4

mapOptions: google.maps.MapOptions = {
  streetViewControl: false,
  mapTypeControl:    false,
  fullscreenControl: false,
  styles: [], // add custom JSON style here
}

getMarkerOptions(project: any): google.maps.MarkerOptions {
  const isActive = this.activeProject()?._id === project._id
  return {
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale:       isActive ? 10 : 7,
      fillColor:   isActive ? '#12a89b' : '#0a1628',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
    }
  }
}

onMarkerClick(project: any) {
  this.activeProject.set(project)
  // scroll sidebar card into view
}
```

---

## 13. Build Order

```
Step 1   Scaffold
         ng new dlc-townplanning --standalone --routing --style=scss
         TailwindCSS setup
         CSS custom properties in styles.scss
         Google Fonts in index.html
         Environment files

Step 2   Shell
         AppShellComponent (nav + <router-outlet> + footer)
         NavComponent — desktop sticky nav + mobile hamburger overlay
         FooterComponent — logo, links, contact details, copyright

Step 3   Core services
         DlcContentService (all methods)
         DlcFormsService (submit)

Step 4   Home page
         Hero (static initially — placeholder copy + brand)
         Pillars section (CMS)
         Services teaser (CMS)
         Projects teaser (CMS, featured=true)
         About strip (static)
         Contact CTA (static)

Step 5   Services pages
         ServicesOverviewComponent — card grid from CMS
         ServiceDetailComponent — dynamic slug, markdown rendered
         MarkdownPipe

Step 6   About page
         Company story (CMS richtext)
         Pillars expanded (CMS)
         Accreditations (static until content received)
         Team photo (CMS)

Step 7   Contact page
         Reactive form with validation
         DlcFormsService.submitContact()
         Success / error states
         CMS site-settings for contact details
         Static Google Maps embed

Step 8   Projects page
         Install @angular/google-maps
         Map + sidebar split layout
         Filter bar (region + category)
         Client-side filtering via computed()
         Marker ↔ card active state sync
         ProjectModalComponent (gallery, video, description, mini-map)
         Mobile: stack map above cards, modal full-screen

Step 9   Polish
         Skeleton loaders on all CMS fetches
         Error states (API unreachable)
         Empty states (no results after filter)
         Page titles per route (Title service)
         Meta descriptions (Meta service)
         Scroll-triggered fade-in animations (IntersectionObserver)
         Favicon

Step 10  Deploy
         Vercel project, connect repo
         Environment variables set in Vercel dashboard
         Test all routes on production URL
         DNS once domain confirmed with client
```

---

## 14. Content Pending from Client

Build with placeholder content. Site cannot go live without:

```
[ ] Company pillars — exact wording (title + description each)
[ ] Full service list — names + copy per service
[ ] Full project list — title, location, coordinates, description, images, video links
[ ] Team photo — high resolution
[ ] Logo SVG or AI source file (from Fanus)
[ ] Tertiary brand colour (from Fanus)
[ ] Accreditations — names and/or logos
[ ] Office contact details — address, phone, email
[ ] Domain decision — dlcgroup.co.za or dlctownplan.co.za
[ ] Google Maps API key decision — client or Machinum.io account
[ ] About / company story copy
```

---

## 15. Design Notes for Agent

The existing site (`dlcgroup.co.za`) is reference for **content only** — not design. Do not replicate its layout or visual treatment.

The site should feel:
- **Authoritative** — this is a professional services firm, not a startup
- **Spacious** — generous whitespace, not cramped
- **Geographic** — maps and location are core to the brand
- **Clean** — navy + teal, no clutter, strong typography hierarchy

Do not carry over from the existing Wix site:
- Teal text directly on photo backgrounds (no contrast)
- Full-viewport hero images with zero content above fold on inner pages
- Broken navigation elements
- "Proudly created with Wix.com" in footer
- Inconsistent font usage

---

## 16. Out of Scope (v1)

- Blog / news section
- Individual team member profile pages
- Client portal or document downloads
- Multi-language support
- Online quote calculator
- Job listings / careers page

---

*All content served from content.arclink.dev. All form submissions via forms.arclink.dev. No backend code in this repository.*
