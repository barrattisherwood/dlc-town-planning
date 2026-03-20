import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CmsService } from '../../services/cms.service';
import { Project, Service, Pillar } from '../../models/project.model';
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
      { id: '3', slug: 'master-planning', title: 'Master Planning', summary: 'Comprehensive master plans for integrated large-scale developments', description: '', icon: 'masterplan' }
    ]);

    // Featured projects with real data
    this.featuredProjects.set([
      {
        id: '1',
        slug: 'tatu-city',
        title: 'Tatu City',
        location: 'Nairobi, Kenya', 
        region: 'East Africa',
        country: 'Kenya',
        category: 'Mixed-Use', 
        description: 'Large-scale master-planned community spanning 2,500 acres with residential, commercial, and industrial components', 
        image: '/assets/images/projects/tatu-city.jpg',
        featured: true,
        latitude: -1.166667,
        longitude: 36.916667,
        completionDate: '2014'
      },
      {
        id: '2',
        slug: 'cape-town-waterfront-residential',
        title: 'Cape Town Waterfront Development',
        location: 'V&A Waterfront, Cape Town', 
        region: 'Southern Africa',
        country: 'South Africa',
        category: 'Commercial', 
        description: 'Strategic commercial and retail development in the iconic V&A Waterfront precinct', 
        image: '/assets/images/projects/cape-town-waterfront.jpg',
        featured: true,
        latitude: -33.907444,
        longitude: 18.419222,
        completionDate: '2018'
      },
      {
        id: '3',
        slug: 'durban-industrial-park',
        title: 'Durban Industrial Park',
        location: 'Durban South, KwaZulu-Natal', 
        region: 'Southern Africa',
        country: 'South Africa',
        category: 'Industrial', 
        description: 'Comprehensive industrial park development with strategic logistics and manufacturing zones', 
        image: '/assets/images/projects/durban-industrial.jpg',
        featured: true,
        latitude: -29.9611,
        longitude: 30.9467,
        completionDate: '2019'
      }
    ]);

    this.loading.set(false);
  }
}
