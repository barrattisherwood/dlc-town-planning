import { Component, OnInit, AfterViewInit, OnDestroy, inject, signal, computed, effect, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CmsService } from '../../services/cms.service';
import { GoogleMapsService } from '../../services/google-maps.service';
import { Project } from '../../models/project.model';
import { SafeUrlPipe } from '../../shared/pipes/safe-url.pipe';

type ViewMode = 'list' | 'split' | 'map';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, SafeUrlPipe],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent implements OnInit, AfterViewInit, OnDestroy {
  private cmsService = inject(CmsService);
  private googleMapsService = inject(GoogleMapsService);
  private zone = inject(NgZone);
  private route = inject(ActivatedRoute);

  // State signals
  projects = signal<Project[]>([]);
  loading = signal(true);
  activeProject = signal<Project | null>(null);
  viewMode = signal<ViewMode>('split');
  categoryFilter = signal<string>('all');

  // Google Maps
  private map?: google.maps.Map;
  private markers = new Map<string, google.maps.marker.AdvancedMarkerElement>();
  private mapContainerEl?: HTMLElement;
  private pendingCenter: { lat: number; lng: number } | null = null;

  // Service-based categories
  categories = ['all', 'Master Planning', 'Township Establishment', 'Rezoning', 'Consent Use', 'Subdivision', 'Project Management', 'Municipal Planning'];

  // Computed filtered projects
  filteredProjects = computed(() => {
    let filtered = this.projects();

    const category = this.categoryFilter();
    if (category !== 'all') {
      filtered = filtered.filter(p => p.category === category);
    }

    return filtered;
  });

  constructor() {
    // Auto-refresh markers when filtered projects or active project changes
    effect(() => {
      this.filteredProjects(); // Track dependency
      this.activeProject(); // Track dependency
      // Use setTimeout to ensure effect runs after render
      setTimeout(() => this.refreshMarkers(), 0);
    });

    // Reinitialize map when switching to a view mode that needs it
    effect(() => {
      const mode = this.viewMode(); // Track dependency
      if (mode === 'split' || mode === 'map') {
        // Wait for Angular to render the new DOM element before initializing
        setTimeout(() => this.initMap(), 150);
      }
    });
  }

  ngOnInit() {
    this.loadProjects();

    // Check for slug in route to deep-link to a specific project
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        const project = this.projects().find(p => p.slug === slug);
        if (project) {
          this.activeProject.set(project);
          if (this.viewMode() === 'list') {
            this.setView('split');
          }
          if (project.latitude && project.longitude) {
            this.pendingCenter = { lat: project.latitude, lng: project.longitude };
          }
        }
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initMap(), 0);
  }

  ngOnDestroy(): void {
    this.clearMapInstance();
  }

  private clearMapInstance(): void {
    this.markers.forEach(m => m.map = null);
    this.markers.clear();
    this.map = undefined;
    this.mapContainerEl = undefined;
  }

  private async initMap(): Promise<void> {
    const mapEl = document.getElementById('projects-map') as HTMLElement | null;
    if (!mapEl) return;

    this.clearMapInstance();

    // Load the Maps JS API (cached after first call)
    await this.googleMapsService.load();

    // Guard: view may have changed while loading
    if (this.viewMode() === 'list') return;
    // Guard: element may have been removed from DOM
    if (!document.body.contains(mapEl)) return;

    this.mapContainerEl = mapEl;
    this.map = new google.maps.Map(mapEl, {
      center: { lat: -25.7479, lng: 28.2293 }, // Pretoria
      zoom: 6,
      mapId: 'dlc-projects-map',
      mapTypeId: 'roadmap',
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
      zoomControl: true,
    });

    this.refreshMarkers();

    if (this.pendingCenter) {
      this.map.panTo(this.pendingCenter);
      this.map.setZoom(10);
      this.pendingCenter = null;
    }
  }

  private refreshMarkers(): void {
    if (!this.map) {
      const mode = this.viewMode();
      if (mode === 'split' || mode === 'map') {
        this.initMap();
      }
      return;
    }

    // Detect stale map container (DOM element removed)
    if (this.mapContainerEl && !document.body.contains(this.mapContainerEl)) {
      this.clearMapInstance();
      const mode = this.viewMode();
      if (mode === 'split' || mode === 'map') {
        this.initMap();
      }
      return;
    }

    // Remove existing markers
    this.markers.forEach(m => m.map = null);
    this.markers.clear();

    const filtered = this.filteredProjects();
    const bounds = new google.maps.LatLngBounds();
    let hasPositions = false;

    filtered.forEach(project => {
      if (project.latitude && project.longitude) {
        const isActive = this.activeProject()?.id === project.id;
        const position = { lat: project.latitude, lng: project.longitude };

        const marker = new google.maps.marker.AdvancedMarkerElement({
          position,
          map: this.map!,
          content: this.markerContent(isActive),
          zIndex: isActive ? 10 : 1,
        });

        marker.addListener('click', () => {
          this.zone.run(() => this.onMarkerClick(project));
        });

        this.markers.set(project.id, marker);
        bounds.extend(position);
        hasPositions = true;
      }
    });

    if (hasPositions && !this.activeProject()) {
      this.map.fitBounds(bounds);
      google.maps.event.addListenerOnce(this.map, 'bounds_changed', () => {
        if ((this.map?.getZoom() ?? 0) > 10) this.map?.setZoom(10);
      });
    }
  }

  private markerContent(isActive: boolean): HTMLElement {
    const size = isActive ? 40 : 32;
    const fill = isActive ? '#0e7c72' : '#0e9e92';
    const div = document.createElement('div');
    div.style.cursor = 'pointer';
    div.style.filter = isActive ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))';
    div.style.transition = 'transform 0.2s, filter 0.2s';
    div.style.transform = isActive ? 'scale(1.15)' : 'scale(1)';
    div.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${fill}" stroke="#fff" stroke-width="1.5"/>
      <circle cx="12" cy="9" r="3" fill="#fff"/>
    </svg>`;
    return div;
  }

  onMarkerClick(project: Project): void {
    this.activeProject.set(project);

    if (this.viewMode() === 'map') {
      // Switch to split — centre map after map reinitialises
      if (project.latitude && project.longitude) {
        this.pendingCenter = { lat: project.latitude, lng: project.longitude };
      }
      this.setView('split');
    } else if (this.map && project.latitude && project.longitude) {
      this.map.panTo({ lat: project.latitude, lng: project.longitude });
      this.map.setZoom(10);
    }

    setTimeout(() => {
      document.querySelector('.project-detail-panel')?.scrollTo({ top: 0 });
    }, 100);
  }

  onCardClick(project: Project): void {
    this.activeProject.set(project);

    if (this.viewMode() === 'list') {
      if (project.latitude && project.longitude) {
        this.pendingCenter = { lat: project.latitude, lng: project.longitude };
      }
      this.setView('split');
    } else if (this.map && project.latitude && project.longitude) {
      this.map.panTo({ lat: project.latitude, lng: project.longitude });
      this.map.setZoom(10);
    }
  }

  closeDetail(): void {
    this.activeProject.set(null);
    // Zoom back out to show all markers
    setTimeout(() => this.refreshMarkers(), 100);
    // Markers will refresh automatically via effect
  }

  setView(mode: ViewMode): void {
    if (mode === 'list') {
      this.activeProject.set(null);
    }
    this.clearMapInstance();
    this.viewMode.set(mode);
    // Effect will reinitialize the map when mode is split or map
  }

  setCategory(category: string): void {
    this.categoryFilter.set(category);
    // Markers will refresh automatically via effect
  }

  clearFilters(): void {
    this.categoryFilter.set('all');
    // Markers will refresh automatically via effect
  }

  categoryLabel(cat: string): string {
    return cat === 'all' ? 'All Projects' : cat;
  }

  firstImage(project: Project): string {
    return project.images?.[0] || project.image || '';
  }

  getVideoEmbedUrl(project: Project): string | null {
    const videoUrl = project.videoUrl;
    if (!videoUrl) return null;

    // YouTube
    const ytMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (ytMatch) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }

    // Vimeo
    const vimeoMatch = videoUrl.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    return null;
  }

  loadProjects() {
    this.loading.set(true);
    this.cmsService.getProjects().subscribe({
      next: (entries) => {
        if (entries.length > 0) {
          this.projects.set(entries.map(e => ({
            id: e._id,
            slug: e.slug,
            title: e.data.title,
            location: e.data.location,
            region: e.data.region,
            country: e.data.country,
            category: e.data.category,
            description: e.data.description,
            image: e.data.image ?? '',
            images: e.data.images,
            videoUrl: e.data.videoUrl,
            projectUrl: e.data.projectUrl,
            latitude: e.data.latitude,
            longitude: e.data.longitude,
            featured: e.data.featured,
            completionDate: e.data.completionDate,
          })));
          this.loading.set(false);
        } else {
          this.loadFallbackProjects();
        }
      },
      error: () => this.loadFallbackProjects(),
    });
  }

  loadFallbackProjects() {
    this.projects.set([
      // ── African Continent ─────────────────────────────────────────────
      {
        id: '1',
        slug: 'tatu-city',
        title: 'Tatu City',
        location: 'Nairobi, Kenya',
        region: 'East Africa',
        country: 'Kenya',
        category: 'Master Planning',
        description: 'DLC Town Plan takes immense pride in its integral role in shaping and orchestrating the development of TATU City — an unparalleled, world-class mixed-use urban centre north of Nairobi built around the "live-work-play" concept. Master Plan area: 1 193 ha | Phase 1: 127 ha. Retail: 374 775 m² GFA | Residential: 22 390 units | Offices: 832 328 m² GFA | Light Industrial: 191 413 m².',
        latitude: -1.1301,
        longitude: 36.9023,
        projectUrl: 'https://www.tatucity.com/',
        featured: true,
        completionDate: 'Ongoing',
      },
      {
        id: '2',
        slug: 'kpone-apolonia-accra',
        title: 'Kpone-Apolonia Master Plan',
        location: 'Greater Accra, Ghana',
        region: 'West Africa',
        country: 'Ghana',
        category: 'Master Planning',
        description: 'Master plan and detailed design for Phase 1 of a new planned satellite town with mixed-use development in Greater Accra. Master Plan area: 941 ha | Phase 1: 248 ha. Retail: 261 230 m² GFA | Residential: 22 000 units | Offices: 246 410 m² GFA | Light Industrial: 275 400 m².',
        latitude: 5.7167,
        longitude: 0.0333,
        featured: true,
        completionDate: 'Ongoing',
      },
      {
        id: '3',
        slug: 'kings-city-sekondi-takoradi',
        title: "King's City Master Plan",
        location: 'Sekondi-Takoradi, Ghana',
        region: 'West Africa',
        country: 'Ghana',
        category: 'Master Planning',
        description: "Master plan and detailed design for Phase 1 of a new planned satellite town in Sekondi-Takoradi. Master Plan area: 1 231 ha | Phase 1: 250 ha. Retail: 280 000 m² GFA | Residential: 24 500 units | Offices: 760 000 m² GFA | Light Industrial: 660 000 m².",
        latitude: 4.9333,
        longitude: -1.7500,
        projectUrl: 'http://www.kingcity.com.gh/',
        featured: false,
        completionDate: 'Ongoing',
      },
      {
        id: '4',
        slug: 'kiswishi-lubumbashi',
        title: 'Kiswishi Master Plan',
        location: 'Lubumbashi, DRC',
        region: 'Central Africa',
        country: 'Democratic Republic of Congo',
        category: 'Master Planning',
        description: 'Master plan and detailed design for Phase 1 of a new planned satellite town in Lubumbashi. Master Plan area: 4 414 ha | Phase 1: 340 ha. Retail: 141 426 m² GFA | Residential: 18 532 units | Offices: 724 025 m² GFA | Light Industrial: 76 355 m².',
        latitude: -11.6647,
        longitude: 27.4794,
        featured: false,
        completionDate: 'Ongoing',
      },
      // ── South Africa ──────────────────────────────────────────────────
      {
        id: '5',
        slug: 'sibanye-stillwater-slims',
        title: 'Sibanye-Stillwater Land Master Plan (SLIMS)',
        location: 'Marikana & Kloof, North West',
        region: 'Southern Africa',
        country: 'South Africa',
        category: 'Master Planning',
        description: "Development of an Integrated Land Information Management System and Land Master Plan (SLIMS) Phases I, II & III for Sibanye-Stillwater's Gold and PGM operations. The project consolidated a diverse portfolio of property assets acquired from Cooke, Anglo American, Lonmin and Gold Fields into a single coherent land management framework.",
        latitude: -25.7003,
        longitude: 27.3811,
        featured: false,
        completionDate: 'Completed',
      },
      {
        id: '6',
        slug: 'refilwe-ext-10-township',
        title: 'Refilwe Ext 10 Township Establishment',
        location: 'Cullinan, City of Tshwane',
        region: 'Southern Africa',
        country: 'South Africa',
        category: 'Township Establishment',
        description: 'Gauteng Department of Housing township establishment on Portion 80 of the farm Oog van Boekenhoutskloof alias Tweefontein 288-JR. Size: 44.56 ha. Development potential: 820 residential units, retail GFA 4 893.6 m², educational and community facilities.',
        latitude: -25.6769,
        longitude: 28.5243,
        featured: false,
        completionDate: 'Completed',
      },
      {
        id: '7',
        slug: 'impumelelo-ext-3-township',
        title: 'Impumelelo Ext 3 Township Establishment',
        location: 'Lesedi Local Municipality, Gauteng',
        region: 'Southern Africa',
        country: 'South Africa',
        category: 'Township Establishment',
        description: 'Gauteng Department of Housing township establishment on Portion 23 of the farm Nooitgedacht 294-IR. Size: 73.91 ha. Development potential: 955 residential units, retail GFA 13 941 m², educational and community facilities.',
        latitude: -26.4000,
        longitude: 28.3500,
        featured: false,
        completionDate: 'Completed',
      },
      {
        id: '8',
        slug: 'sikhunyani-b-township',
        title: 'Sikhunyani B Township Development',
        location: 'Giyani Local Municipality, Limpopo',
        region: 'Southern Africa',
        country: 'South Africa',
        category: 'Township Establishment',
        description: 'Coghsta township development on a portion of the farm Greater Giyani 891LT. Size: 80.40 ha. Development potential: 758 residential units, retail GFA 36 969 m², educational and community facilities.',
        latitude: -23.3017,
        longitude: 30.7162,
        featured: false,
        completionDate: 'Completed',
      },
      {
        id: '9',
        slug: 'bhongweni-township',
        title: 'Bhongweni Township Establishment',
        location: 'Randfontein Local Municipality, Gauteng',
        region: 'Southern Africa',
        country: 'South Africa',
        category: 'Township Establishment',
        description: 'Gold 1 / Sibanye Gold formalisation project: Township establishment on portions of the farms Rietvalei 241-IQ and Uitvalfontein 244-IQ. Size: 65.85 ha. Development potential: 1 326 residential units, retail GFA 27 332 m², educational and community facilities.',
        latitude: -26.1750,
        longitude: 27.7000,
        featured: false,
        completionDate: 'Completed',
      },
      {
        id: '10',
        slug: 'toekomsrus-ext-4-township',
        title: 'Toekomsrus Ext 4 Township Establishment',
        location: 'Randfontein Local Municipality, Gauteng',
        region: 'Southern Africa',
        country: 'South Africa',
        category: 'Township Establishment',
        description: 'Gold 1 / Sibanye Gold housing project: Township establishment on portions of the farms Randfontein 247-IQ and Uitvalfontein 244-IQ. Size: 65.85 ha. Development potential: 1 848 residential units, retail GFA 77 957 m², educational and community facilities.',
        latitude: -26.1970,
        longitude: 27.6980,
        featured: false,
        completionDate: 'Completed',
      },
      {
        id: '11',
        slug: 'makosha-b9-township',
        title: 'Makosha B9 Township Development',
        location: 'Giyani Local Municipality, Limpopo',
        region: 'Southern Africa',
        country: 'South Africa',
        category: 'Township Establishment',
        description: 'Coghsta township development on a portion of the farm Greater Giyani 891LT. Size: 110.95 ha. Development potential: 690 residential units, retail GFA 3 239 m², educational and community facilities.',
        latitude: -23.2800,
        longitude: 30.7300,
        featured: false,
        completionDate: 'Completed',
      },
      {
        id: '12',
        slug: 'waste-disposal-facility-rustenburg',
        title: 'Waste Disposal Facility Rezoning',
        location: 'Rustenburg Local Municipality, North West',
        region: 'Southern Africa',
        country: 'South Africa',
        category: 'Rezoning',
        description: 'Rezoning for Golder Associates Africa on Portions 3, 8 and 16 of the Farm Waterval 303-JQ from "Agricultural" to "Special" for a waste disposal facility with ancillary uses. Size: 430.36 ha.',
        latitude: -25.6670,
        longitude: 27.2410,
        featured: false,
        completionDate: 'Completed',
      },
      {
        id: '13',
        slug: 'nieuw-muckleneuk-residential-rezoning',
        title: 'Nieuw Muckleneuk Residential Rezoning',
        location: 'Nieuw Muckleneuk, Pretoria',
        region: 'Southern Africa',
        country: 'South Africa',
        category: 'Rezoning',
        description: 'Rezoning of Erven 1/200, 2/200 & 1/199 Nieuw Muckleneuk for higher density residential rights. Size: 3 828 m². Development potential: 44 residential units at 60 units per hectare.',
        latitude: -25.7830,
        longitude: 28.2240,
        featured: false,
        completionDate: 'Completed',
      },
      {
        id: '14',
        slug: 'queenswood-medical-offices',
        title: 'Queenswood Medical Consulting Rooms',
        location: 'Queenswood, Pretoria',
        region: 'Southern Africa',
        country: 'South Africa',
        category: 'Rezoning',
        description: 'Rezoning of Erven 920, 922 & 923 Queenswood to obtain rights for medical consulting rooms. Size: 5 788 m². FSR: 0.6 | Coverage: 30%.',
        latitude: -25.7260,
        longitude: 28.2370,
        featured: false,
        completionDate: 'Completed',
      },
      {
        id: '15',
        slug: 'alexandra-heritage-centre',
        title: 'Alexandra Heritage Centre',
        location: 'Alexandra, City of Johannesburg',
        region: 'Southern Africa',
        country: 'South Africa',
        category: 'Rezoning',
        description: 'Rezoning of Erven 4694 & 4695 Alexandra Ext 47 for a heritage centre. Size: 724 m². FSR: 0.5 | Coverage: 50%.',
        latitude: -26.1010,
        longitude: 28.1050,
        featured: false,
        completionDate: 'Completed',
      },
      {
        id: '16',
        slug: 'brooklyn-residential-rezoning',
        title: 'Brooklyn Residential Rezoning',
        location: 'Brooklyn, Pretoria',
        region: 'Southern Africa',
        country: 'South Africa',
        category: 'Rezoning',
        description: 'Rezoning of Erven 498 & 500 Brooklyn for higher density residential rights. Size: 5 104 m². Residential density: 60 units per hectare. Development potential: 30 dwelling units.',
        latitude: -25.7730,
        longitude: 28.2280,
        featured: false,
        completionDate: 'Completed',
      },
      {
        id: '17',
        slug: 'menlo-park-residential-rezoning',
        title: 'Menlo Park Residential Rezoning',
        location: 'Menlo Park, Pretoria',
        region: 'Southern Africa',
        country: 'South Africa',
        category: 'Rezoning',
        description: 'Rezoning of Erven 528 & 529 Menlo Park for higher density residential rights. Size: 3 856 m². Residential density: 60 units per hectare. Development potential: 20 dwelling units.',
        latitude: -25.7730,
        longitude: 28.2760,
        featured: false,
        completionDate: 'Completed',
      },
      {
        id: '18',
        slug: 'rustenburg-urban-hub',
        title: 'Rustenburg CBD Urban Hub',
        location: 'Rustenburg Local Municipality, North West',
        region: 'Southern Africa',
        country: 'South Africa',
        category: 'Municipal Planning',
        description: 'National Treasury Transport Orientated Development — Urban Hub Project for Rustenburg CBD. DLC appointed as part of the Glad Africa project team to deliver transport-oriented urban hub planning services.',
        latitude: -25.6670,
        longitude: 27.2420,
        featured: false,
        completionDate: 'Completed',
      },
      {
        id: '19',
        slug: 'kimberley-urban-hub',
        title: 'Kimberley CBD Urban Hub',
        location: 'Sol Plaatje Local Municipality, Northern Cape',
        region: 'Southern Africa',
        country: 'South Africa',
        category: 'Municipal Planning',
        description: 'National Treasury Transport Orientated Development — Urban Hub Project for Kimberley CBD. DLC appointed as part of the Maxlo project team to deliver transport-oriented urban hub planning services.',
        latitude: -28.7323,
        longitude: 24.7623,
        featured: false,
        completionDate: 'Completed',
      },
      {
        id: '20',
        slug: 'dpw-border-patrol-road',
        title: 'RSA Border Patrol Road Upgrade',
        location: 'Limpopo / Botswana Border Region',
        region: 'Southern Africa',
        country: 'South Africa',
        category: 'Project Management',
        description: 'DPW project HP13/133: Town planning services for the maintenance and upgrade of approximately 416 km of patrol road and fencing on the RSA border with Zimbabwe and Mozambique. DLC formed part of the Endecon project team.',
        latitude: -22.3000,
        longitude: 30.0000,
        featured: false,
        completionDate: 'Completed',
      },
    ]);

    this.loading.set(false);
    // Markers will refresh automatically via effect
  }
}
