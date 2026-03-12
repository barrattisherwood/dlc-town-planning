import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, AfterViewInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { Project } from '../../services/cms.service';

@Component({
  selector: 'app-project-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-map.component.html',
  styleUrl: './project-map.component.scss'
})
export class ProjectMapComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() projects: Project[] = [];
  @Input() set focusedProjectId(id: string | null) {
    if (id && this.map) {
      this.focusOnProject(id);
    }
  }
  @Output() projectClicked = new EventEmitter<string>();

  private map?: L.Map;
  private markers: Map<string, L.Marker> = new Map();
  private polygons: L.Polygon[] = [];

  mapReady = signal(false);
  projectCount = signal(0);
  boundaryCount = signal(0);

  // Custom icon for project markers in brand colors
  private customIcon = L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div class="marker-pin">
        <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.163 0 0 7.163 0 16C0 24.837 16 42 16 42C16 42 32 24.837 32 16C32 7.163 24.837 0 16 0Z" fill="#0e7c72"/>
          <circle cx="16" cy="16" r="6" fill="white"/>
        </svg>
      </div>
    `,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42]
  });

  constructor() {
    effect(() => {
      if (this.map && this.projects.length > 0) {
        this.updateMapMarkers();
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    // Component initialization
  }

  ngAfterViewInit() {
    this.initializeMap();
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  private initializeMap() {
    // Initialize map centered on Tatu City, Kenya
    this.map = L.map('project-map', {
      center: [-1.13, 36.902],
      zoom: 6,
      zoomControl: true,
      scrollWheelZoom: true
    });

    // Add custom styled tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Add custom CSS filter for brand-colored map
    const mapContainer = document.getElementById('project-map');
    if (mapContainer) {
      mapContainer.style.filter = 'hue-rotate(165deg) saturate(0.7) brightness(1.1)';
    }

    this.mapReady.set(true);
    this.updateMapMarkers();
  }

  private updateMapMarkers() {
    if (!this.map) return;

    // Clear existing markers and polygons
    this.markers.forEach(marker => marker.remove());
    this.polygons.forEach(polygon => polygon.remove());
    this.markers.clear();
    this.polygons = [];

    const projectsWithCoords = this.projects.filter(p => p.latitude && p.longitude);
    this.projectCount.set(projectsWithCoords.length);

    if (projectsWithCoords.length === 0) return;

    // Add markers for each project
    projectsWithCoords.forEach(project => {
      const marker = L.marker([project.latitude!, project.longitude!], {
        icon: this.customIcon,
        title: project.title
      }).addTo(this.map!);

      // Create popup content
      const popupContent = `
        <div class="map-popup">
          <h3 class="popup-title">${project.title}</h3>
          <p class="popup-location">${project.location}</p>
          <p class="popup-description">${project.description}</p>
          ${project.projectUrl ? `<a href="${project.projectUrl}" target="_blank" class="popup-link">Visit Website →</a>` : ''}
          ${project.completionDate ? `<p class="popup-date">Completed: ${project.completionDate}</p>` : ''}
        </div>
      `;

      marker.bindPopup(popupContent);
      
      // Emit project click event
      marker.on('click', () => {
        this.projectClicked.emit(project.id);
      });

      this.markers.set(project.id, marker);

      // Add boundary polygon if available
      if (project.boundary && project.boundary.length > 0) {
        const latLngs: L.LatLngExpression[] = project.boundary.map(coord => [coord.lat, coord.lng]);
        const polygon = L.polygon(latLngs, {
          color: '#0e7c72',
          fillColor: '#0e7c72',
          fillOpacity: 0.2,
          weight: 2
        }).addTo(this.map!);

        polygon.bindPopup(`<div class="map-popup"><h3>${project.title}</h3><p>Project Boundary</p></div>`);
        this.polygons.push(polygon);
      }
    });

    this.boundaryCount.set(this.polygons.length);

    // Fit map bounds to show all markers
    if (this.markers.size > 0) {
      const group = L.featureGroup(Array.from(this.markers.values()));
      this.map.fitBounds(group.getBounds().pad(0.1));
    }
  }

  private focusOnProject(projectId: string) {
    const marker = this.markers.get(projectId);
    if (marker && this.map) {
      this.map.setView(marker.getLatLng(), 14, { animate: true });
      marker.openPopup();
    }
  }
}
