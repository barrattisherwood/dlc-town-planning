import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CmsService } from '../../services/cms.service';
import { Service } from '../../models/project.model';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { ServiceCardComponent } from '../../shared/service-card/service-card.component';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, ServiceCardComponent],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent implements OnInit {
  private cmsService = inject(CmsService);

  services = signal<Service[]>([]);
  loading = signal(true);

  // Maps CMS title variations to our canonical routing slugs
  private readonly titleToSlug: Record<string, string> = {
    'master planning': 'master-planning',
    'land use planning': 'land-use-planning',
    'township establishment': 'township-establishment',
    'rezoning': 'rezoning',
    'rezoning applications': 'rezoning',
    'rezoning application': 'rezoning',
    'consent use': 'consent-use',
    'consent use applications': 'consent-use',
    'consent use application': 'consent-use',
    'subdivision & consolidation': 'subdivision-consolidation',
    'subdivision and consolidation': 'subdivision-consolidation',
    'removal of restrictions': 'removal-of-restrictions',
    'municipal planning': 'municipal-planning',
    'project management': 'project-management',
    'heritage impact assessments': 'heritage-impact',
    'heritage impact assessment': 'heritage-impact',
    'social housing & tenure': 'social-housing',
    'social housing and tenure': 'social-housing',
    'land reform': 'land-reform',
  };

  private resolveSlug(cmsSlug: string, title: string): string {
    return this.titleToSlug[title.toLowerCase()] ?? cmsSlug;
  }

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    this.loading.set(true);
    this.cmsService.getServices().subscribe({
      next: (entries) => {
        if (entries.length > 0) {
          this.services.set(entries.map((e, i) => ({
            id: e._id,
            slug: this.resolveSlug(e.slug, e.data.title),
            title: e.data.title,
            summary: e.data.summary,
            description: e.data.body ?? e.data.description ?? '',
            icon: e.data.icon ?? '',
            order: e.data.order ? Number(e.data.order) : i + 1,
            featured: e.data.featured,
          })).sort((a, b) => (a.order ?? 99) - (b.order ?? 99)));
          this.loading.set(false);
        } else {
          this.loadFallbackServices();
        }
      },
      error: () => this.loadFallbackServices(),
    });
  }

  loadFallbackServices() {
    this.services.set([
      {
        id: '1',
        slug: 'master-planning',
        title: 'Master Planning',
        summary: 'Comprehensive master plans for large-scale integrated developments',
        description: 'Holistic spatial planning for mixed-use developments, estates, and urban growth nodes — from concept through to stakeholder approval.',
        icon: 'masterplan'
      },
      {
        id: '2',
        slug: 'township-establishment',
        title: 'Township Establishment',
        summary: 'Full-service township development from concept to approval',
        description: 'Applications in terms of Town-Planning and Townships Ordinance and other legislation, navigating complex regulatory requirements.',
        icon: 'township'
      },
      {
        id: '3',
        slug: 'rezoning',
        title: 'Rezoning Applications',
        summary: 'Section 56 applications and rezoning under various legislative frameworks',
        description: 'Expert management of rezoning applications to unlock the full development potential of your land.',
        icon: 'rezoning'
      },
      {
        id: '4',
        slug: 'consent-use',
        title: 'Consent Use Applications',
        summary: 'Consent use applications in terms of applicable Town-Planning Schemes',
        description: 'Facilitating consent use approvals to enable compatible land uses within existing zoning frameworks.',
        icon: 'consent'
      },
      {
        id: '5',
        slug: 'subdivision-consolidation',
        title: 'Subdivision & Consolidation',
        summary: 'Land subdivision and consolidation of erven for optimal development',
        description: 'Subdivision under the Agricultural Land Act and Division of Land Ordinance, and Section 92 consolidation applications.',
        icon: 'subdivision'
      },
      {
        id: '6',
        slug: 'removal-of-restrictions',
        title: 'Removal of Restrictions',
        summary: 'Title condition removals under the Gauteng Removal of Restrictions Act',
        description: 'Clearing restrictive title deed conditions and servitudes that limit development potential.',
        icon: 'restrictions'
      },
      {
        id: '7',
        slug: 'land-use-planning',
        title: 'Land Use Planning',
        summary: 'Comprehensive land use and zoning solutions for sustainable development',
        description: 'Expert guidance on land use applications and spatial planning compliance.',
        icon: 'land'
      },
      {
        id: '8',
        slug: 'municipal-planning',
        title: 'Municipal Planning',
        summary: 'Strategic planning support for local government',
        description: 'Spatial development frameworks, integrated development plans, and policy formulation.',
        icon: 'municipal'
      },
      {
        id: '9',
        slug: 'project-management',
        title: 'Project Management',
        summary: 'End-to-end development project coordination',
        description: 'Advisory services and complete project management from inception through to completion.',
        icon: 'project'
      },
      {
        id: '10',
        slug: 'heritage-impact',
        title: 'Heritage Impact Assessments',
        summary: 'Cultural heritage evaluation and compliance',
        description: 'Heritage impact studies and compliance with national heritage legislation.',
        icon: 'heritage'
      },
      {
        id: '11',
        slug: 'social-housing',
        title: 'Social Housing & Tenure',
        summary: 'Sustainable settlement and tenure upgrading projects',
        description: 'Planning support for social housing developments and informal settlement upgrades.',
        icon: 'social'
      },
      {
        id: '12',
        slug: 'land-reform',
        title: 'Land Reform',
        summary: 'Comprehensive land reform and development initiatives',
        description: 'Facilitating land reform projects, redistributive land development, and community planning.',
        icon: 'reform'
      }
    ]);

    this.loading.set(false);
  }
}
