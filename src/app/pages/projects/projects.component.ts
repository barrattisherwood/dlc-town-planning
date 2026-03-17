import { Component, OnInit, AfterViewInit, OnDestroy, inject, signal, computed, effect, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  // State signals
  projects = signal<Project[]>([]);
  loading = signal(true);
  activeProject = signal<Project | null>(null);
  viewMode = signal<ViewMode>('split');
  categoryFilter = signal<string>('all');

  // Google Maps
  private map?: google.maps.Map;
  private markers = new Map<string, google.maps.Marker>();
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
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initMap(), 0);
  }

  ngOnDestroy(): void {
    this.clearMapInstance();
  }

  private clearMapInstance(): void {
    this.markers.forEach(m => m.setMap(null));
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
    this.markers.forEach(m => m.setMap(null));
    this.markers.clear();

    const filtered = this.filteredProjects();
    const bounds = new google.maps.LatLngBounds();
    let hasPositions = false;

    filtered.forEach(project => {
      if (project.latitude && project.longitude) {
        const isActive = this.activeProject()?.id === project.id;
        const position = { lat: project.latitude, lng: project.longitude };

        const marker = new google.maps.Marker({
          position,
          map: this.map!,
          icon: this.markerIcon(isActive),
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

  private markerIcon(isActive: boolean): google.maps.Icon {
    const r = isActive ? 14 : 10;
    const fill = isActive ? '#0e7c72' : '#ffffff';
    const stroke = '#0e7c72';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${r * 2}" height="${r * 2}"><circle cx="${r}" cy="${r}" r="${r - 2}" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/></svg>`;
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
      scaledSize: new google.maps.Size(r * 2, r * 2),
      anchor: new google.maps.Point(r, r),
    };
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
    return project.images?.[0] || project.image || '/assets/images/placeholder-project.jpg';
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
    // Placeholder data - in production would call CMS service
    this.projects.set([
      {
        id: '1',
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
        image: '/assets/images/urban-development.jpg'
      },
      {
        id: '2',
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
        image: '/assets/images/sustainable-cities.jpg'
      },
      {
        id: '3',
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
        image: '/assets/images/infrastructure.jpg'
      },
      {
        id: '4',
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
