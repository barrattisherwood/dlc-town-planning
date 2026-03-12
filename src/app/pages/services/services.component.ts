import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CmsService, Service } from '../../services/cms.service';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent implements OnInit {
  private cmsService = inject(CmsService);

  services = signal<Service[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    // Placeholder data - in production would call CMS service
    this.services.set([
      {
        id: '1',
        slug: 'land-use-planning',
        title: 'Land Use Planning',
        summary: 'Comprehensive land use and zoning solutions for sustainable development',
        description: 'Expert guidance on land use applications, rezoning, and spatial planning compliance.',
        icon: 'land'
      },
      {
        id: '2',
        slug: 'township-establishment',
        title: 'Township Establishment',
        summary: 'Full-service township development from concept to approval',
        description: 'Navigate complex regulatory requirements for township establishment and subdivision.',
        icon: 'township'
      },
      {
        id: '3',
        slug: 'environmental-planning',
        title: 'Environmental Planning',
        summary: 'Sustainable environmental impact assessments and management',
        description: 'Environmental authorization, impact studies, and sustainability consulting.',
        icon: 'environment'
      },
      {
        id: '4',
        slug: 'municipal-planning',
        title: 'Municipal Planning',
        summary: 'Strategic planning support for local government',
        description: 'Spatial development frameworks, integrated development plans, and policy formulation.',
        icon: 'municipal'
      },
      {
        id: '5',
        slug: 'project-management',
        title: 'Project Management',
        summary: 'End-to-end development project coordination',
        description: 'Professional project management from inception through to completion.',
        icon: 'project'
      },
      {
        id: '6',
        slug: 'heritage-impact',
        title: 'Heritage Impact Assessments',
        summary: 'Cultural heritage evaluation and compliance',
        description: 'Heritage impact studies and compliance with national heritage legislation.',
        icon: 'heritage'
      }
    ]);

    this.loading.set(false);
  }
}
