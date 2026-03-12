import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CmsService, Pillar, Service, Project } from '../../services/cms.service';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { ServiceCardComponent } from '../../shared/service-card/service-card.component';
import { ProjectCardComponent } from '../../shared/project-card/project-card.component';
import { HeroSliderComponent } from '../../shared/hero-slider/hero-slider.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, ServiceCardComponent, ProjectCardComponent, HeroSliderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private cmsService = inject(CmsService);

  pillars = signal<Pillar[]>([]);
  services = signal<Service[]>([]);
  featuredProjects = signal<Project[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.loadContent();
  }

  loadContent() {
    // For now, use placeholder data until CMS is connected
    // In production, these would call the CMS service
    this.pillars.set([
      { id: '1', title: 'Experience', description: 'Over 20 years of town planning expertise across Africa', icon: 'experience' },
      { id: '2', title: 'Professional', description: 'SACPLAN registered and SACLAP accredited planners', icon: 'professional' },
      { id: '3', title: 'Comprehensive', description: 'Full spectrum of planning and project management services', icon: 'comprehensive' }
    ]);

    this.services.set([
      { id: '1', slug: 'land-use-planning', title: 'Land Use Planning', summary: 'Comprehensive land use and zoning solutions', description: '', icon: 'land' },
      { id: '2', slug: 'township-establishment', title: 'Township Establishment', summary: 'Expert guidance through township development processes', description: '', icon: 'township' },
      { id: '3', slug: 'environmental-planning', title: 'Environmental Planning', summary: 'Sustainable environmental impact assessments', description: '', icon: 'environment' }
    ]);

    this.featuredProjects.set([
      { id: '1', title: 'Gauteng Mixed-Use Development', location: 'Johannesburg, South Africa', category: 'Mixed-Use', description: 'Large-scale urban development project', featured: true },
      { id: '2', title: 'Coastal Residential Estate', location: 'Cape Town, South Africa', category: 'Residential', description: 'Luxury coastal estate development', featured: true },
      { id: '3', title: 'Industrial Park Expansion', location: 'Durban, South Africa', category: 'Industrial', description: 'Strategic industrial zone planning', featured: true }
    ]);

    this.loading.set(false);
  }
}
