# Agent Prompt — DLC Projects Page (`/projects`)

## Context

You are building the `/projects` page for DLC Town Planning, an Angular 18+ standalone component. The page displays a collection of town planning projects across Africa on an interactive map with a filterable list. The current implementation is incorrect — discard it entirely and rebuild from this specification.

**Stack:** Angular 18+, TailwindCSS, Angular Signals, Leaflet (`leaflet` + `@asymmetrik/ngx-leaflet`)  
**Map tiles:** CARTO DarkMatter — no API key required  
**Data source:** `GET https://content.arclink.dev/api/sites/dlc-townplanning/project?published=true`  
**Brand tokens (already in styles.scss):** `--navy: #0a1628`, `--teal: #0e7c72`, `--teal-l: #12a89b`, `--off-white: #f5f7f8`

---

## Package Installation

```bash
npm install leaflet @asymmetrik/ngx-leaflet
npm install --save-dev @types/leaflet
```

### angular.json — add Leaflet CSS

```json
"styles": [
  "src/styles.scss",
  "node_modules/leaflet/dist/leaflet.css"
],
```

### styles.scss — fix Leaflet marker icons (required)

```scss
// Leaflet default marker icons break with Angular bundling — fix with CDN
.leaflet-default-icon-path {
  background-image: url('https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png');
}
```

> Note: We are using custom SVG circle markers throughout (not default icons), so this is just a safety fallback.

---

## Layout Overview

The page has **three view modes**, toggled by the user via a view switcher in the filter bar:

```
[ List | Split | Map ]  ← toggle buttons, "Split" is default
```

### Split mode (default)
```
┌──────────────────────────────────────────────────────────────┐
│  FILTER BAR  [All] [SA] [Africa] [Intl]  · Category ▾  [List|Split|Map]  │
├──────────────────────┬───────────────────────────────────────┤
│                      │                                       │
│   PROJECT LIST       │         LEAFLET MAP                   │
│   (left, 38%)        │         (right, 62%)                  │
│                      │                                       │
│   scrollable         │   sticky, fills viewport height       │
│   cards              │   below filter bar                    │
│                      │                                       │
└──────────────────────┴───────────────────────────────────────┘
```

### List mode (full width)
Filter bar visible. Map hidden. Project cards expand to a 3-column responsive grid.

### Map mode (full width)
Filter bar visible. List hidden. Map fills full viewport width and height below filter bar. Active project info shown as a floating card bottom-left.

---

## Component Files

```
src/app/pages/projects/
├── projects.component.ts
├── projects.component.html
├── projects.component.scss
└── project-modal/
    ├── project-modal.component.ts
    ├── project-modal.component.html
    └── project-modal.component.scss
```

---

## Data Model

```typescript
interface Project {
  _id:   string
  slug:  string
  data: {
    title:       string
    summary:     string
    description: string        // markdown
    location:    string        // display name e.g. "Nairobi, Kenya"
    coordinates: { lat: number; lng: number }
    country:     string
    region:      'south-africa' | 'africa' | 'international'
    category:    'master-planning' | 'town-planning' | 'project-management' | 'environmental'
    images:      string[]      // Cloudinary URLs
    videoUrl?:   string
    projectUrl?: string
    featured:    boolean
  }
}
```

---

## projects.component.ts

```typescript
import { Component, OnInit, OnDestroy, inject, signal, computed, AfterViewInit, ViewChild, ElementRef, NgZone } from '@angular/core'
import { CommonModule } from '@angular/common'
import * as L from 'leaflet'
import { DlcContentService } from '../../core/services/dlc-content.service'
import { ProjectModalComponent } from './project-modal/project-modal.component'

// CARTO DarkMatter tile layer — free, no API key
const TILE_URL     = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const TILE_ATTRIB  = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
const TILE_OPTIONS = { subdomains: 'abcd', maxZoom: 19 }

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, ProjectModalComponent],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
})
export class ProjectsComponent implements OnInit, AfterViewInit, OnDestroy {
  private content = inject(DlcContentService)
  private zone    = inject(NgZone)

  @ViewChild('mapEl') mapEl!: ElementRef<HTMLDivElement>

  // --- State ---
  projects       = signal<Project[]>([])
  loading        = signal(true)
  activeProject  = signal<Project | null>(null)
  modalOpen      = signal(false)
  viewMode       = signal<'list' | 'split' | 'map'>('split')
  regionFilter   = signal<string>('all')
  categoryFilter = signal<string>('all')

  // --- Derived ---
  filteredProjects = computed(() =>
    this.projects().filter(p => {
      const r = this.regionFilter()   === 'all' || p.data.region   === this.regionFilter()
      const c = this.categoryFilter() === 'all' || p.data.category === this.categoryFilter()
      return r && c
    })
  )

  // --- Leaflet internals ---
  private map!:        L.Map
  private markers:     Map<string, L.CircleMarker> = new Map()
  private mapReady     = false

  // --- Default view: centered on Africa ---
  private readonly DEFAULT_CENTER: L.LatLngExpression = [-10, 25]
  private readonly DEFAULT_ZOOM    = 4

  ngOnInit() {
    this.content.getProjects().subscribe({
      next: projects => {
        this.projects.set(projects)
        this.loading.set(false)
        if (this.mapReady) this.renderMarkers()
      },
      error: () => this.loading.set(false),
    })
  }

  ngAfterViewInit() {
    // Defer map init to avoid ExpressionChangedAfterChecked
    setTimeout(() => this.initMap(), 0)
  }

  ngOnDestroy() {
    this.map?.remove()
  }

  // ── Map setup ──────────────────────────────────────────────

  private initMap() {
    if (!this.mapEl?.nativeElement) return

    this.zone.runOutsideAngular(() => {
      this.map = L.map(this.mapEl.nativeElement, {
        center:          this.DEFAULT_CENTER,
        zoom:            this.DEFAULT_ZOOM,
        zoomControl:     true,
        scrollWheelZoom: true,
      })

      L.tileLayer(TILE_URL, { ...TILE_OPTIONS, attribution: TILE_ATTRIB }).addTo(this.map)

      this.mapReady = true
      if (this.projects().length > 0) this.renderMarkers()
    })
  }

  private renderMarkers() {
    // Clear existing
    this.markers.forEach(m => m.remove())
    this.markers.clear()

    this.zone.runOutsideAngular(() => {
      this.filteredProjects().forEach(project => {
        const { lat, lng } = project.data.coordinates
        const isActive = this.activeProject()?._id === project._id

        const marker = L.circleMarker([lat, lng], this.markerStyle(isActive))
          .addTo(this.map)
          .bindTooltip(project.data.title, { direction: 'top', offset: [0, -8] })

        marker.on('click', () => {
          this.zone.run(() => this.onMarkerClick(project))
        })

        this.markers.set(project._id, marker)
      })
    })
  }

  private markerStyle(isActive: boolean): L.CircleMarkerOptions {
    return {
      radius:      isActive ? 11 : 8,
      fillColor:   isActive ? '#12a89b' : '#ffffff',
      fillOpacity: 1,
      color:       isActive ? '#0e7c72' : '#0a1628',
      weight:      isActive ? 3 : 2,
    }
  }

  private refreshMarkerStyles() {
    this.markers.forEach((marker, id) => {
      const isActive = this.activeProject()?._id === id
      marker.setStyle(this.markerStyle(isActive))
      // Bring active marker to front
      if (isActive) marker.bringToFront()
    })
  }

  private invalidateMapSize() {
    // Must be called after the map container changes size (view mode switch)
    setTimeout(() => this.map?.invalidateSize(), 50)
  }

  // ── Event handlers ─────────────────────────────────────────

  onMarkerClick(project: Project) {
    this.activeProject.set(project)
    this.modalOpen.set(true)
    this.refreshMarkerStyles()
    this.map?.flyTo(
      [project.data.coordinates.lat, project.data.coordinates.lng],
      10,
      { duration: 0.8 }
    )
    // Scroll sidebar card into view (split mode)
    const el = document.getElementById(`card-${project._id}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  onCardClick(project: Project) {
    this.activeProject.set(project)
    this.modalOpen.set(true)
    this.refreshMarkerStyles()
    if (this.viewMode() !== 'list') {
      this.map?.flyTo(
        [project.data.coordinates.lat, project.data.coordinates.lng],
        10,
        { duration: 0.8 }
      )
    }
  }

  closeModal() {
    this.modalOpen.set(false)
    this.activeProject.set(null)
    this.refreshMarkerStyles()
    setTimeout(() => {
      this.map?.flyTo(this.DEFAULT_CENTER, this.DEFAULT_ZOOM, { duration: 1 })
    }, 300)
  }

  setView(mode: 'list' | 'split' | 'map') {
    this.viewMode.set(mode)
    if (mode !== 'map') this.activeProject.set(null)
    this.invalidateMapSize()
  }

  setRegion(region: string) {
    this.regionFilter.set(region)
    this.activeProject.set(null)
    this.renderMarkers()
  }

  setCategory(cat: string) {
    this.categoryFilter.set(cat)
    this.activeProject.set(null)
    this.renderMarkers()
  }

  // ── Helpers ────────────────────────────────────────────────

  categoryLabel(slug: string): string {
    const map: Record<string, string> = {
      'master-planning':    'Master Planning',
      'town-planning':      'Town Planning',
      'project-management': 'Project Management',
      'environmental':      'Environmental',
    }
    return map[slug] ?? slug
  }

  regionLabel(slug: string): string {
    const map: Record<string, string> = {
      'south-africa':  'South Africa',
      'africa':        'Africa',
      'international': 'International',
    }
    return map[slug] ?? slug
  }

  firstImage(project: Project): string {
    return project.data.images?.[0] ?? ''
  }
}
```

---

## projects.component.html

```html
<div class="projects-page">

  <!-- FILTER BAR -->
  <div class="filter-bar">
    <div class="filter-group">
      <div class="filter-pills">
        @for (region of ['all','south-africa','africa','international']; track region) {
          <button
            class="pill"
            [class.active]="regionFilter() === region"
            (click)="setRegion(region)">
            {{ region === 'all' ? 'All Regions' : regionLabel(region) }}
          </button>
        }
      </div>

      <select class="category-select" (change)="setCategory($any($event.target).value)">
        <option value="all">All Categories</option>
        <option value="master-planning">Master Planning</option>
        <option value="town-planning">Town Planning</option>
        <option value="project-management">Project Management</option>
        <option value="environmental">Environmental</option>
      </select>
    </div>

    <div class="view-toggle">
      <button [class.active]="viewMode() === 'list'"  (click)="setView('list')"  title="List view">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <rect x="0" y="1"  width="16" height="2.5" rx="1"/>
          <rect x="0" y="6.5" width="16" height="2.5" rx="1"/>
          <rect x="0" y="12" width="16" height="2.5" rx="1"/>
        </svg>
        List
      </button>
      <button [class.active]="viewMode() === 'split'" (click)="setView('split')" title="Split view">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <rect x="0" y="0" width="7"  height="16" rx="1"/>
          <rect x="9" y="0" width="7"  height="16" rx="1"/>
        </svg>
        Split
      </button>
      <button [class.active]="viewMode() === 'map'"   (click)="setView('map')"   title="Map view">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1a5 5 0 00-5 5c0 3.5 5 9 5 9s5-5.5 5-9a5 5 0 00-5-5zm0 6.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/>
        </svg>
        Map
      </button>
    </div>
  </div>

  <!-- RESULTS COUNT -->
  <div class="results-count">
    {{ filteredProjects().length }} project{{ filteredProjects().length !== 1 ? 's' : '' }}
  </div>

  <!-- CONTENT AREA -->
  <div class="content-area" [class]="'mode-' + viewMode()">

    <!-- PROJECT LIST (list + split modes) -->
    @if (viewMode() !== 'map') {
      <div class="project-list">

        @if (loading()) {
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="card skeleton"></div>
          }
        } @else if (filteredProjects().length === 0) {
          <div class="empty-state">
            <p>No projects match your current filters.</p>
            <button (click)="setRegion('all'); setCategory('all')">Clear filters</button>
          </div>
        } @else {
          @for (project of filteredProjects(); track project._id) {
            <div
              class="project-card"
              [class.active]="activeProject()?._id === project._id"
              [id]="'card-' + project._id"
              (click)="onCardClick(project)">

              <div class="card-image">
                @if (firstImage(project)) {
                  <img [src]="firstImage(project)" [alt]="project.data.title" loading="lazy" />
                } @else {
                  <div class="card-image-placeholder"></div>
                }
                <span class="category-badge">{{ categoryLabel(project.data.category) }}</span>
              </div>

              <div class="card-body">
                <h3>{{ project.data.title }}</h3>
                <p class="location">
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a5 5 0 00-5 5c0 3.5 5 9 5 9s5-5.5 5-9a5 5 0 00-5-5zm0 6.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/></svg>
                  {{ project.data.location }}
                </p>
                <p class="summary">{{ project.data.summary }}</p>
              </div>

            </div>
          }
        }

      </div>
    }

    <!-- MAP (split + map modes) -->
    @if (viewMode() !== 'list') {
      <div class="map-container">
        <div #mapEl class="leaflet-map"></div>

        <!-- Floating active card (map mode only) -->
        @if (viewMode() === 'map' && activeProject()) {
          <div class="map-float-card" (click)="modalOpen.set(true)">
            <div class="float-card-image">
              @if (firstImage(activeProject()!)) {
                <img [src]="firstImage(activeProject()!)" [alt]="activeProject()!.data.title" />
              }
            </div>
            <div class="float-card-body">
              <span class="category-badge small">{{ categoryLabel(activeProject()!.data.category) }}</span>
              <h4>{{ activeProject()!.data.title }}</h4>
              <p>{{ activeProject()!.data.location }}</p>
              <span class="view-more">View details →</span>
            </div>
            <button
              class="float-card-close"
              (click)="$event.stopPropagation(); activeProject.set(null); refreshMarkerStyles()">
              ✕
            </button>
          </div>
        }

      </div>
    }

  </div>

</div>

<!-- MODAL -->
@if (modalOpen() && activeProject()) {
  <app-project-modal
    [project]="activeProject()!"
    (close)="closeModal()" />
}
```

---

## project-modal.component.ts

```typescript
import { Component, Input, Output, EventEmitter, signal, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import * as L from 'leaflet'
import { MarkdownPipe } from '../../../shared/pipes/markdown.pipe'
import { SafeUrlPipe } from '../../../shared/pipes/safe-url.pipe'

@Component({
  selector: 'app-project-modal',
  standalone: true,
  imports: [CommonModule, MarkdownPipe, SafeUrlPipe],
  templateUrl: './project-modal.component.html',
  styleUrls: ['./project-modal.component.scss'],
})
export class ProjectModalComponent implements AfterViewInit, OnDestroy {
  @Input()  project!: Project
  @Output() close = new EventEmitter<void>()

  @ViewChild('miniMapEl') miniMapEl!: ElementRef<HTMLDivElement>

  activeImageIndex = signal(0)
  private miniMap?: L.Map

  get hasMultipleImages() { return this.project.data.images?.length > 1 }

  ngAfterViewInit() {
    // Small delay to ensure the modal has rendered before initialising the map
    setTimeout(() => this.initMiniMap(), 100)
  }

  ngOnDestroy() {
    this.miniMap?.remove()
  }

  private initMiniMap() {
    if (!this.miniMapEl?.nativeElement) return
    const { lat, lng } = this.project.data.coordinates

    this.miniMap = L.map(this.miniMapEl.nativeElement, {
      center:          [lat, lng],
      zoom:            12,
      zoomControl:     false,
      scrollWheelZoom: false,
      dragging:        false,
      doubleClickZoom: false,
    })

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      { subdomains: 'abcd', maxZoom: 19 }
    ).addTo(this.miniMap)

    L.circleMarker([lat, lng], {
      radius:      10,
      fillColor:   '#12a89b',
      fillOpacity: 1,
      color:       '#0e7c72',
      weight:      3,
    }).addTo(this.miniMap)
  }

  prevImage() {
    this.activeImageIndex.update(i =>
      i === 0 ? this.project.data.images.length - 1 : i - 1
    )
  }

  nextImage() {
    this.activeImageIndex.update(i =>
      (i + 1) % this.project.data.images.length
    )
  }

  isYoutube(url: string): boolean { return url?.includes('youtube') || url?.includes('youtu.be') }
  isVimeo(url: string):   boolean { return url?.includes('vimeo') }

  getYoutubeEmbedUrl(url: string): string {
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    return match ? `https://www.youtube.com/embed/${match[1]}` : url
  }

  getVimeoEmbedUrl(url: string): string {
    const match = url.match(/vimeo\.com\/(\d+)/)
    return match ? `https://player.vimeo.com/video/${match[1]}` : url
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit()
    }
  }
}
```

---

## project-modal.component.html

```html
<div class="modal-backdrop" (click)="onBackdropClick($event)">
  <div class="modal-panel">

    <button class="modal-close" (click)="close.emit()">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M15 5L5 15M5 5l10 10"/>
      </svg>
    </button>

    <!-- MEDIA -->
    <div class="modal-media">

      @if (project.data.videoUrl) {
        <div class="video-wrapper">
          @if (isYoutube(project.data.videoUrl)) {
            <iframe [src]="getYoutubeEmbedUrl(project.data.videoUrl) | safeUrl" frameborder="0" allowfullscreen></iframe>
          } @else if (isVimeo(project.data.videoUrl)) {
            <iframe [src]="getVimeoEmbedUrl(project.data.videoUrl) | safeUrl" frameborder="0" allowfullscreen></iframe>
          }
        </div>

      } @else if (project.data.images?.length) {
        <div class="gallery">
          <img
            [src]="project.data.images[activeImageIndex()]"
            [alt]="project.data.title"
            class="gallery-image" />

          @if (hasMultipleImages) {
            <button class="gallery-btn prev" (click)="prevImage()">‹</button>
            <button class="gallery-btn next" (click)="nextImage()">›</button>
            <div class="gallery-dots">
              @for (img of project.data.images; track $index) {
                <span
                  class="dot"
                  [class.active]="activeImageIndex() === $index"
                  (click)="activeImageIndex.set($index)">
                </span>
              }
            </div>
          }
        </div>
      }

    </div>

    <!-- CONTENT -->
    <div class="modal-content">

      <div class="modal-header">
        <div>
          <span class="category-badge">{{ categoryLabel(project.data.category) }}</span>
          <h2>{{ project.data.title }}</h2>
          <p class="location">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a5 5 0 00-5 5c0 3.5 5 9 5 9s5-5.5 5-9a5 5 0 00-5-5zm0 6.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/></svg>
            {{ project.data.location }}
          </p>
        </div>
        @if (project.data.projectUrl) {
          <a [href]="project.data.projectUrl" target="_blank" rel="noopener" class="external-link">
            Visit Project →
          </a>
        }
      </div>

      <div class="modal-description prose" [innerHTML]="project.data.description | markdown"></div>

      <!-- Mini map -->
      <div class="modal-map-wrap">
        <div #miniMapEl class="modal-mini-map"></div>
      </div>

    </div>

  </div>
</div>
```

---

## projects.component.scss

```scss
:host { display: block; }

.projects-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px); // subtract nav height
  overflow: hidden;
}

// --- Filter bar ---
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1.5rem;
  background: var(--white);
  border-bottom: 1px solid var(--warm-grey);
  flex-shrink: 0;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-pills { display: flex; gap: 0.4rem; }

.pill {
  padding: 0.4rem 1rem;
  border-radius: 100px;
  border: 1px solid var(--warm-grey);
  background: transparent;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;

  &:hover  { border-color: var(--teal); color: var(--teal); }
  &.active { background: var(--navy); border-color: var(--navy); color: white; }
}

.category-select {
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--warm-grey);
  border-radius: 6px;
  font-size: 0.8rem;
  color: var(--text);
  background: white;
  cursor: pointer;
  outline: none;
  &:focus { border-color: var(--teal); }
}

// --- View toggle ---
.view-toggle {
  display: flex;
  border: 1px solid var(--warm-grey);
  border-radius: 6px;
  overflow: hidden;

  button {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.875rem;
    background: white;
    border: none;
    border-right: 1px solid var(--warm-grey);
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--muted);
    cursor: pointer;
    transition: all 0.15s;

    &:last-child { border-right: none; }
    &:hover  { background: var(--off-white); color: var(--text); }
    &.active { background: var(--navy); color: white; }
  }
}

// --- Results count ---
.results-count {
  padding: 0.5rem 1.5rem;
  font-size: 0.8rem;
  color: var(--muted);
  background: var(--off-white);
  border-bottom: 1px solid var(--warm-grey);
  flex-shrink: 0;
}

// --- Content area ---
.content-area {
  flex: 1;
  overflow: hidden;
  display: flex;

  &.mode-list {
    .project-list {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      padding: 1.5rem;
      overflow-y: auto;
      align-content: start;
    }
    .map-container { display: none; }
  }

  &.mode-split {
    .project-list {
      width: 38%;
      min-width: 300px;
      border-right: 1px solid var(--warm-grey);
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }
    .map-container { flex: 1; }
  }

  &.mode-map {
    .project-list  { display: none; }
    .map-container { width: 100%; }
  }
}

// --- Split mode: compact list cards ---
.mode-split .project-list .project-card {
  display: flex;
  gap: 0.875rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--warm-grey);
  cursor: pointer;
  transition: background 0.15s;
  border-left: 3px solid transparent;

  &:hover  { background: var(--off-white); }
  &.active { background: #e8f4f3; border-left-color: var(--teal); }

  .card-image {
    width: 80px; height: 80px; min-width: 80px;
    border-radius: 6px;
    overflow: hidden;
    background: var(--warm-grey);

    img { width: 100%; height: 100%; object-fit: cover; }
    .category-badge { display: none; }
  }

  .card-body {
    flex: 1; min-width: 0;

    h3 {
      font-size: 0.875rem; font-weight: 600; color: var(--navy);
      margin-bottom: 0.2rem;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    .location {
      display: flex; align-items: center; gap: 0.3rem;
      font-size: 0.75rem; color: var(--muted); margin-bottom: 0.3rem;
    }

    .summary {
      font-size: 0.8rem; color: var(--muted); line-height: 1.4;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
  }
}

// --- List mode: grid cards ---
.mode-list .project-card {
  background: white;
  border: 1px solid var(--warm-grey);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(10,22,40,0.1); }

  .card-image {
    height: 200px; position: relative; overflow: hidden; background: var(--warm-grey);
    img { width: 100%; height: 100%; object-fit: cover; }
    .category-badge { position: absolute; top: 0.75rem; left: 0.75rem; }
  }

  .card-body {
    padding: 1.25rem;
    h3 { font-size: 1rem; font-weight: 600; color: var(--navy); margin-bottom: 0.4rem; }
    .location { display: flex; align-items: center; gap: 0.3rem; font-size: 0.8rem; color: var(--muted); margin-bottom: 0.5rem; }
    .summary { font-size: 0.875rem; color: var(--muted); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  }
}

// --- Category badge ---
.category-badge {
  background: var(--teal);
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;

  &.small { font-size: 0.65rem; padding: 0.2rem 0.5rem; }
}

// --- Map container ---
.map-container {
  position: relative;
  height: 100%;
}

.leaflet-map {
  width: 100%;
  height: 100%;
}

// --- Floating card (map mode) ---
.map-float-card {
  position: absolute;
  bottom: 2rem; left: 1.5rem;
  width: 300px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(10,22,40,0.25);
  display: flex;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
  z-index: 1000; // above Leaflet tiles

  &:hover { transform: translateY(-2px); }

  .float-card-image {
    width: 90px; min-width: 90px;
    background: var(--warm-grey);
    img { width: 100%; height: 100%; object-fit: cover; }
  }

  .float-card-body {
    padding: 0.875rem; flex: 1; min-width: 0;
    h4 { font-size: 0.875rem; font-weight: 600; color: var(--navy); margin: 0.3rem 0 0.2rem; }
    p  { font-size: 0.75rem; color: var(--muted); }
    .view-more { font-size: 0.75rem; color: var(--teal); font-weight: 500; margin-top: 0.4rem; display: block; }
  }

  .float-card-close {
    position: absolute; top: 0.5rem; right: 0.5rem;
    width: 20px; height: 20px;
    background: var(--warm-grey); border: none; border-radius: 50%;
    font-size: 0.65rem; cursor: pointer; color: var(--muted);
    display: flex; align-items: center; justify-content: center;
    &:hover { background: var(--navy); color: white; }
  }
}

// --- Skeleton loaders ---
.skeleton {
  height: 280px;
  background: linear-gradient(90deg, var(--warm-grey) 25%, var(--off-white) 50%, var(--warm-grey) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 12px;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

// --- Empty state ---
.empty-state {
  padding: 3rem; text-align: center; color: var(--muted);
  grid-column: 1 / -1;

  p { margin-bottom: 1rem; }
  button {
    background: var(--navy); color: white; border: none;
    padding: 0.6rem 1.25rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem;
  }
}

// --- Responsive ---
@media (max-width: 1024px) {
  .mode-list .project-list { grid-template-columns: repeat(2, 1fr) !important; }
}

@media (max-width: 768px) {
  .filter-pills { display: none; }

  .mode-split {
    flex-direction: column !important;

    .project-list {
      width: 100% !important;
      max-height: 40vh;
      border-right: none !important;
      border-bottom: 1px solid var(--warm-grey);
    }

    .map-container { height: 60vh; }
  }

  .mode-list .project-list { grid-template-columns: 1fr !important; }

  .map-float-card { width: calc(100% - 3rem); }
}
```

---

## project-modal.component.scss

```scss
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 22, 40, 0.72);
  backdrop-filter: blur(4px);
  z-index: 2000; // above Leaflet z-index (1000)
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  animation: fadeIn 0.2s ease;
}

.modal-panel {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 860px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: slideUp 0.25s ease;
}

.modal-close {
  position: absolute; top: 1rem; right: 1rem;
  width: 36px; height: 36px;
  background: rgba(10,22,40,0.55);
  border: none; border-radius: 50%;
  color: white; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  z-index: 10; transition: background 0.2s;
  &:hover { background: var(--navy); }
}

// --- Media ---
.gallery {
  position: relative; height: 360px;
  background: var(--navy);
  border-radius: 16px 16px 0 0;
  overflow: hidden;

  .gallery-image { width: 100%; height: 100%; object-fit: cover; display: block; }

  .gallery-btn {
    position: absolute; top: 50%; transform: translateY(-50%);
    background: rgba(255,255,255,0.9); border: none;
    width: 40px; height: 40px; border-radius: 50%;
    font-size: 1.25rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s;
    &:hover { background: white; }
    &.prev { left: 1rem; }
    &.next { right: 1rem; }
  }

  .gallery-dots {
    position: absolute; bottom: 1rem; left: 50%; transform: translateX(-50%);
    display: flex; gap: 0.4rem;

    .dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: rgba(255,255,255,0.45); cursor: pointer; transition: background 0.15s;
      &.active { background: white; }
    }
  }
}

.video-wrapper {
  position: relative; padding-top: 56.25%;
  background: black;
  border-radius: 16px 16px 0 0; overflow: hidden;

  iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: none; }
}

// --- Content ---
.modal-content { padding: 2rem; }

.modal-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  gap: 1rem; margin-bottom: 1.5rem;

  h2 {
    font-size: 1.6rem; font-weight: 700; color: var(--navy);
    margin: 0.4rem 0 0.3rem; letter-spacing: -0.02em;
  }

  .location {
    display: flex; align-items: center; gap: 0.4rem;
    font-size: 0.875rem; color: var(--muted);
  }
}

.external-link {
  background: var(--navy); color: white;
  padding: 0.6rem 1.25rem; border-radius: 6px;
  text-decoration: none; font-size: 0.875rem; font-weight: 500;
  white-space: nowrap; transition: background 0.2s;
  &:hover { background: var(--teal); }
}

.modal-description {
  font-size: 0.95rem; color: var(--text); line-height: 1.75; margin-bottom: 2rem;
}

.modal-map-wrap {
  border-radius: 10px; overflow: hidden; border: 1px solid var(--warm-grey);
}

.modal-mini-map {
  height: 200px; width: 100%;
}

@keyframes fadeIn  { from { opacity: 0; }                         to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

@media (max-width: 768px) {
  .modal-panel  { max-height: 95vh; border-radius: 12px; }
  .gallery      { height: 220px; }
  .modal-content { padding: 1.25rem; }
  .modal-header { flex-direction: column; }
  .modal-header h2 { font-size: 1.25rem; }
}
```

---

## Additional Pipes

```typescript
// src/app/shared/pipes/safe-url.pipe.ts
import { Pipe, PipeTransform } from '@angular/core'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'

@Pipe({ name: 'safeUrl', standalone: true })
export class SafeUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url)
  }
}
```

```typescript
// src/app/shared/pipes/markdown.pipe.ts — should already exist from build step 5
// Confirm it is imported into project-modal.component.ts
```

---

## Important Notes for Agent

**1. NgZone usage**
All Leaflet event listeners (`marker.on('click', ...)`) must call `this.zone.run()` to re-enter Angular's change detection zone. Without this, Signal updates from marker clicks will not trigger view updates.

**2. Map invalidateSize**
When switching between view modes, the Leaflet map container changes size. Always call `this.map.invalidateSize()` after a mode switch (with a small `setTimeout` delay to allow the DOM to update first).

**3. Modal z-index**
Leaflet sets its own z-index stack. The modal backdrop must be `z-index: 2000` or higher to render above all Leaflet layers. The floating card must be `z-index: 1000`.

**4. Tile attribution**
The CARTO tile layer requires the attribution string included in `TILE_OPTIONS`. Do not remove it — it is a licence requirement.

**5. AfterViewInit timing**
The map must be initialised in `ngAfterViewInit`, not `ngOnInit`. The `#mapEl` template reference is not available until the view is rendered. Use a `setTimeout(() => ..., 0)` wrapper to avoid ExpressionChangedAfterChecked errors.

---

## Checklist

```
[ ] Discard existing projects page implementation entirely
[ ] leaflet + @asymmetrik/ngx-leaflet + @types/leaflet installed
[ ] Leaflet CSS added to angular.json styles array
[ ] CARTO DarkMatter tile layer applied
[ ] Three view modes working: List / Split / Map — toggle in filter bar
[ ] Split mode: list 38% left, map 62% right, both fill full height below filter bar
[ ] List mode: 3-column card grid, full width
[ ] Map mode: full width/height map, floating active card bottom-left
[ ] Signals used throughout — no async pipe, no Observable template vars
[ ] NgZone.run() wraps all Leaflet event callbacks
[ ] map.invalidateSize() called on view mode switch
[ ] Marker click → opens modal + flyTo + scrolls sidebar card into view
[ ] Card click → opens modal + flyTo (if not list mode)
[ ] Active marker: teal fill, larger radius, brought to front
[ ] Inactive markers: white fill, navy stroke
[ ] Filters re-render markers (old markers cleared first)
[ ] ProjectModalComponent: image gallery with prev/next + dots
[ ] Modal: video embed (YouTube + Vimeo) if videoUrl present
[ ] Modal: mini Leaflet map (non-interactive, CARTO dark tiles, teal marker)
[ ] Modal: external link button if projectUrl present
[ ] Modal: backdrop click closes it
[ ] Modal z-index above Leaflet (2000+)
[ ] Skeleton loaders while fetching
[ ] Empty state with "Clear filters" button
[ ] SafeUrlPipe created for iframe src sanitisation
[ ] Mobile: split stacks vertically (list 40vh top, map 60vh bottom)
[ ] Mobile: region pills hidden on small screens
[ ] Modal: responsive, full width on mobile
```
