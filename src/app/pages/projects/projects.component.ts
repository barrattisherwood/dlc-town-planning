import { Component, OnInit, AfterViewInit, OnDestroy, inject, signal, computed, effect, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CmsService } from '../../services/cms.service';
import { Project } from '../../models/project.model';
import { SafeUrlPipe } from '../../shared/pipes/safe-url.pipe';
import * as L from 'leaflet';

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
  private zone = inject(NgZone);

  // State signals
  projects = signal<Project[]>([]);
  loading = signal(true);
  activeProject = signal<Project | null>(null);
  viewMode = signal<ViewMode>('split');
  regionFilter = signal<string>('all');
  categoryFilter = signal<string>('all');

  // Leaflet map
  private map?: L.Map;
  private markers: Map<string, L.CircleMarker> = new Map();

  // Available filters
  regions = ['all', 'East Africa', 'Southern Africa', 'West Africa', 'Central Africa'];
  categories = ['all', 'Residential', 'Commercial', 'Industrial', 'Mixed-Use', 'Municipal'];

  // Computed filtered projects
  filteredProjects = computed(() => {
    let filtered = this.projects();

    const region = this.regionFilter();
    if (region !== 'all') {
      filtered = filtered.filter(p => p.region === region);
    }

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
  }

  ngOnInit() {
    this.loadProjects();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initMap(), 0);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    const mapEl = document.getElementById('projects-map');
    if (!mapEl) return;

    this.map = L.map(mapEl, {
      center: [-1.286389, 36.817223], // Nairobi
      zoom: 6,
      zoomControl: true,
      attributionControl: true
    });

    // CARTO DarkMatter tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(this.map);

    this.refreshMarkers();
  }

  private refreshMarkers(): void {
    if (!this.map) return;

    // Clear existing markers
    this.markers.forEach(marker => marker.remove());
    this.markers.clear();

    const filtered = this.filteredProjects();
    const bounds = L.latLngBounds([]);

    // Add markers for filtered projects
    filtered.forEach(project => {
      if (project.latitude && project.longitude) {
        const isActive = this.activeProject()?.id === project.id;
        const latLng: L.LatLngExpression = [project.latitude, project.longitude];

        const marker = L.circleMarker(latLng, {
          radius: isActive ? 12 : 8,
          fillColor: isActive ? '#0e7c72' : '#ffffff',
          color: '#0e7c72',
          weight: 2,
          opacity: 1,
          fillOpacity: isActive ? 1 : 0.8
        });

        marker.on('click', () => {
          this.zone.run(() => {
            this.onMarkerClick(project);
          });
        });

        marker.addTo(this.map!);
        this.markers.set(project.id, marker);
        bounds.extend(latLng);

        // Bring active marker to front
        if (isActive) {
          marker.bringToFront();
        }
      }
    });

    // Fit bounds to show all markers if there are any
    if (bounds.isValid() && !this.activeProject()) {
      try {
        this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
      } catch (e) {
        console.warn('Could not fit bounds:', e);
      }
    }
  }

  onMarkerClick(project: Project): void {
    this.activeProject.set(project);

    // Switch to split view if in map mode
    if (this.viewMode() === 'map') {
      this.viewMode.set('split');
      // First resize the map
      setTimeout(() => {
        this.map?.invalidateSize();
      }, 200);
      // Then center after resize completes
      setTimeout(() => {
        if (project.latitude && project.longitude) {
          this.map?.setView([project.latitude, project.longitude], 10, { animate: true });
        }
      }, 400);
    } else if (this.map && project.latitude && project.longitude) {
      this.map.setView([project.latitude, project.longitude], 10, { animate: true });
    }

    // Markers will refresh automatically via effect

    // Scroll detail panel to top
    setTimeout(() => {
      const detailPanel = document.querySelector('.project-detail-panel');
      if (detailPanel) {
        detailPanel.scrollTop = 0;
      }
    }, 100);
  }

  onCardClick(project: Project): void {
    this.activeProject.set(project);

    // Switch to split view if in list mode
    if (this.viewMode() === 'list') {
      this.viewMode.set('split');
      // First resize the map
      setTimeout(() => {
        this.map?.invalidateSize();
      }, 200);
      // Then center after resize completes
      setTimeout(() => {
        if (project.latitude && project.longitude) {
          this.map?.setView([project.latitude, project.longitude], 10, { animate: true });
        }
      }, 400);
    } else if (this.map && project.latitude && project.longitude) {
      this.map.setView([project.latitude, project.longitude], 10, { animate: true });
    }

    // Markers will refresh automatically via effect
  }

  closeDetail(): void {
    this.activeProject.set(null);
    // Zoom back out to show all markers
    setTimeout(() => this.refreshMarkers(), 100);
    // Markers will refresh automatically via effect
  }

  setView(mode: ViewMode): void {
    // Clear active project when switching views
    if (mode === 'list') {
      this.activeProject.set(null);
    }
    this.viewMode.set(mode);
    setTimeout(() => {
      this.map?.invalidateSize();
    }, 100);
  }

  setRegion(region: string): void {
    this.regionFilter.set(region);
    // Markers will refresh automatically via effect
  }

  setCategory(category: string): void {
    this.categoryFilter.set(category);
    // Markers will refresh automatically via effect
  }

  clearFilters(): void {
    this.regionFilter.set('all');
    this.categoryFilter.set('all');
    // Markers will refresh automatically via effect
  }

  categoryLabel(cat: string): string {
    return cat === 'all' ? 'All Categories' : cat;
  }

  regionLabel(reg: string): string {
    return reg === 'all' ? 'All Regions' : reg;
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
        category: 'Mixed-Use',
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
        category: 'Mixed-Use',
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
        category: 'Residential',
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
        category: 'Industrial',
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
        category: 'Commercial',
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
        category: 'Residential',
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
        category: 'Municipal',
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
        category: 'Industrial',
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
        category: 'Commercial',
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
