import { Component, input, output, signal, effect, NgZone, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { Project } from '../../services/cms.service';
import { SafeUrlPipe } from '../pipes/safe-url.pipe';

@Component({
  selector: 'app-project-modal',
  standalone: true,
  imports: [CommonModule, SafeUrlPipe],
  templateUrl: './project-modal.component.html',
  styleUrl: './project-modal.component.scss'
})
export class ProjectModalComponent implements AfterViewInit, OnDestroy {
  project = input.required<Project>();
  close = output<void>();
  
  currentImageIndex = signal(0);
  
  private miniMap?: L.Map;
  private miniMapMarker?: L.CircleMarker;
  
  constructor(private zone: NgZone) {
    effect(() => {
      const proj = this.project();
      if (proj && this.miniMap) {
        this.updateMiniMap(proj);
      }
    });
  }
  
  ngAfterViewInit(): void {
    setTimeout(() => this.initMiniMap(), 0);
  }
  
  ngOnDestroy(): void {
    if (this.miniMap) {
      this.miniMap.remove();
    }
  }
  
  private initMiniMap(): void {
    const proj = this.project();
    if (!proj.latitude || !proj.longitude) return;
    
    const mapEl = document.getElementById('modal-mini-map');
    if (!mapEl) return;
    
    this.miniMap = L.map(mapEl, {
      center: [proj.latitude, proj.longitude],
      zoom: 12,
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      boxZoom: false,
      keyboard: false,
      attributionControl: true
    });
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(this.miniMap);
    
    this.miniMapMarker = L.circleMarker([proj.latitude, proj.longitude], {
      radius: 10,
      fillColor: '#0e7c72',
      color: '#0e7c72',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8
    }).addTo(this.miniMap);
    
    setTimeout(() => this.miniMap?.invalidateSize(), 100);
  }
  
  private updateMiniMap(proj: Project): void {
    if (!this.miniMap || !proj.latitude || !proj.longitude) return;
    
    this.miniMap.setView([proj.latitude, proj.longitude], 12);
    
    if (this.miniMapMarker) {
      this.miniMapMarker.setLatLng([proj.latitude, proj.longitude]);
    }
  }
  
  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
  
  onCloseClick(): void {
    this.close.emit();
  }
  
  prevImage(): void {
    const images = this.project().images || [];
    if (images.length > 0) {
      this.currentImageIndex.update(idx => (idx - 1 + images.length) % images.length);
    }
  }
  
  nextImage(): void {
    const images = this.project().images || [];
    if (images.length > 0) {
      this.currentImageIndex.update(idx => (idx + 1) % images.length);
    }
  }
  
  goToImage(index: number): void {
    this.currentImageIndex.set(index);
  }
  
  getVideoEmbedUrl(): string | null {
    const videoUrl = this.project().videoUrl;
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
  
  hasGallery(): boolean {
    return (this.project().images?.length || 0) > 0;
  }
  
  hasVideo(): boolean {
    return !!this.getVideoEmbedUrl();
  }
  
  hasMap(): boolean {
    return !!(this.project().latitude && this.project().longitude);
  }
}
