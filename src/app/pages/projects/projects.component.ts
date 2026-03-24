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
      {
        id: '1',
        slug: 'tatu-city',
        title: 'Tatu City',
        location: 'Nairobi, Kenya',
        region: 'East Africa',
        country: 'Kenya',
        category: 'Master Planning',
        description: 'DLC Town Plan takes immense pride in its integral role in shaping and orchestrating the development of TATU City. The essence of Tatu City\'s aspiration lies in the conception of an unparalleled, world-class mixed-use urban center—a pioneering endeavor within the African landscape. At its core, this vision revolves around the "live-work-play" concept, aimed at cultivating a dynamic, decentralized hub to the north of Nairobi City.',
        latitude: -1.1300733303582884,
        longitude: 36.90225918872897,
        projectUrl: 'https://www.tatucity.com/',
        featured: true,
        completionDate: 'Ongoing',
        image: ''
      },
      {
        id: '2',
        slug: 'sandton-mixed-use-development',
        title: 'Sandton Mixed-Use Development',
        location: 'Sandton, Johannesburg',
        region: 'Southern Africa',
        country: 'South Africa',
        category: 'Township Establishment',
        description: 'Large-scale urban renewal project combining residential, commercial, and retail components in the heart of Johannesburg\'s financial district. This development brings together world-class amenities and sustainable design principles.',
        latitude: -26.107734,
        longitude: 28.056847,
        featured: true,
        completionDate: '2023',
        image: ''
      },
      {
        id: '3',
        slug: 'cape-town-waterfront-residential',
        title: 'Cape Town Waterfront Residential',
        location: 'V&A Waterfront, Cape Town',
        region: 'Southern Africa',
        country: 'South Africa',
        category: 'Rezoning',
        description: 'Luxury residential development with 200+ units and world-class amenities overlooking Table Bay. Features include a rooftop pool, gym, concierge services, and direct access to the waterfront promenade.',
        latitude: -33.9031,
        longitude: 18.4200,
        featured: true,
        completionDate: '2024',
        image: ''
      },
      {
        id: '4',
        slug: 'durban-industrial-park',
        title: 'Durban Industrial Park',
        location: 'Durban South, KwaZulu-Natal',
        region: 'Southern Africa',
        country: 'South Africa',
        category: 'Township Establishment',
        description: 'Strategic industrial zone development with modern logistics facilities designed to support the growing manufacturing and export sectors in the region.',
        latitude: -29.9844,
        longitude: 30.9292,
        featured: true,
        completionDate: '2022'
      },
      {
        id: '5',
        slug: 'pretoria-office-park',
        title: 'Pretoria Office Park',
        location: 'Centurion, Pretoria',
        region: 'Southern Africa',
        country: 'South Africa',
        category: 'Rezoning',
        description: 'Grade-A office park development with sustainable design features including solar panels, rainwater harvesting, and green building certifications.',
        latitude: -25.8646,
        longitude: 28.1829,
        completionDate: '2023'
      },
      {
        id: '6',
        slug: 'stellenbosch-residential-estate',
        title: 'Stellenbosch Residential Estate',
        location: 'Stellenbosch, Western Cape',
        region: 'Southern Africa',
        country: 'South Africa',
        category: 'Consent Use',
        description: 'Boutique estate development in the heart of the Winelands, featuring Mediterranean-inspired architecture and vineyard views.',
        latitude: -33.9321,
        longitude: 18.8602,
        completionDate: '2024'
      },
      {
        id: '7',
        slug: 'port-elizabeth-township',
        title: 'Port Elizabeth Township',
        location: 'Port Elizabeth, Eastern Cape',
        region: 'Southern Africa',
        country: 'South Africa',
        category: 'Municipal Planning',
        description: 'Social housing township development with community facilities including schools, clinics, and recreational spaces designed to foster community development.',
        latitude: -33.9608,
        longitude: 25.6022,
        completionDate: '2022'
      },
      {
        id: '8',
        slug: 'midrand-logistics-hub',
        title: 'Midrand Logistics Hub',
        location: 'Midrand, Gauteng',
        region: 'Southern Africa',
        country: 'South Africa',
        category: 'Subdivision',
        description: 'Modern logistics and warehousing facility development strategically located between Johannesburg and Pretoria with access to major highways.',
        latitude: -25.9953,
        longitude: 28.1288,
        completionDate: '2023'
      },
      {
        id: '9',
        slug: 'umhlanga-retail-centre',
        title: 'Umhlanga Retail Centre',
        location: 'Umhlanga, KwaZulu-Natal',
        region: 'Southern Africa',
        country: 'South Africa',
        category: 'Project Management',
        description: 'Regional shopping centre with entertainment and dining precinct, featuring over 150 stores, cinema complex, and family entertainment facilities.',
        latitude: -29.7286,
        longitude: 31.0821,
        completionDate: '2024'
      }
    ]);

    this.loading.set(false);
    // Markers will refresh automatically via effect
  }
}
