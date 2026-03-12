import { Component, Input, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { Project } from '../../services/cms.service';

interface MapMarker {
  position: google.maps.LatLngLiteral;
  title: string;
  project: Project;
}

interface ProjectBoundary {
  paths: google.maps.LatLngLiteral[];
  projectId: string;
}

@Component({
  selector: 'app-project-map',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  templateUrl: './project-map.component.html',
  styleUrl: './project-map.component.scss'
})
export class ProjectMapComponent implements OnInit {
  @Input() projects: Project[] = [];
  @Input() selectedProjectId: string | null = null;

  markers = signal<MapMarker[]>([]);
  boundaries = signal<ProjectBoundary[]>([]);
  center = signal<google.maps.LatLngLiteral>({ lat: -1.13, lng: 36.902 }); // Tatu City default
  zoom = signal(6); // Show wider Africa region initially

  mapOptions: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: false,
    maxZoom: 18,
    minZoom: 4,
    styles: [
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#12a89b' }, { lightness: 17 }]
      },
      {
        featureType: 'landscape',
        elementType: 'geometry',
        stylers: [{ color: '#f5f7f8' }, { lightness: 20 }]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.fill',
        stylers: [{ color: '#ffffff' }, { lightness: 17 }]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#ffffff' }, { lightness: 29 }, { weight: 0.2 }]
      },
      {
        featureType: 'road.arterial',
        elementType: 'geometry',
        stylers: [{ color: '#ffffff' }, { lightness: 18 }]
      },
      {
        featureType: 'road.local',
        elementType: 'geometry',
        stylers: [{ color: '#ffffff' }, { lightness: 16 }]
      },
      {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [{ color: '#f5f7f8' }, { lightness: 21 }]
      }
    ]
  };

  markerOptions: google.maps.MarkerOptions = {
    draggable: false,
    animation: google.maps.Animation.DROP
  };

  polygonOptions: google.maps.PolygonOptions = {
    fillColor: '#0e7c72',
    fillOpacity: 0.2,
    strokeColor: '#0e7c72',
    strokeOpacity: 0.8,
    strokeWeight: 2
  };

  constructor() {
    // React to project changes
    effect(() => {
      this.updateMarkers();
      this.updateBoundaries();
    });
  }

  ngOnInit() {
    this.updateMarkers();
    this.updateBoundaries();
    this.fitMapToBounds();
  }

  private updateMarkers() {
    const newMarkers: MapMarker[] = this.projects
      .filter(p => p.latitude && p.longitude)
      .map(p => ({
        position: { lat: p.latitude!, lng: p.longitude! },
        title: p.title,
        project: p
      }));
    
    this.markers.set(newMarkers);
  }

  private updateBoundaries() {
    const newBoundaries: ProjectBoundary[] = this.projects
      .filter(p => p.boundary && p.boundary.length > 0)
      .map(p => ({
        paths: p.boundary!,
        projectId: p.id
      }));
    
    this.boundaries.set(newBoundaries);
  }

  private fitMapToBounds() {
    if (this.markers().length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    this.markers().forEach(marker => {
      bounds.extend(marker.position);
    });

    // This would need to be called after map is initialized
    // For now, calculate center and zoom manually
    const center = bounds.getCenter();
    this.center.set({ lat: center.lat(), lng: center.lng() });
  }

  onMarkerClick(marker: MapMarker) {
    // Emit event or handle marker click
    console.log('Marker clicked:', marker.project.title);
    // Could emit an event to parent component to highlight the project card
  }

  openInfoWindow(marker: MapMarker) {
    // Info window logic can be added here
  }
}
