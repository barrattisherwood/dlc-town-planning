import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CmsService, Project } from '../../services/cms.service';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent implements OnInit {
  private cmsService = inject(CmsService);

  allProjects = signal<Project[]>([]);
  selectedCategory = signal<string>('all');
  loading = signal(true);

  categories = ['all', 'Residential', 'Commercial', 'Industrial', 'Mixed-Use', 'Municipal'];

  // Computed filtered projects based on category
  filteredProjects = computed(() => {
    const category = this.selectedCategory();
    if (category === 'all') {
      return this.allProjects();
    }
    return this.allProjects().filter(p => p.category === category);
  });

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    // Placeholder data - in production would call CMS service
    this.allProjects.set([
      {
        id: '1',
        title: 'Sandton Mixed-Use Development',
        location: 'Sandton, Johannesburg',
        category: 'Mixed-Use',
        description: 'Large-scale urban renewal project combining residential, commercial, and retail components',
        featured: true,
        completionDate: '2023'
      },
      {
        id: '2',
        title: 'Cape Town Waterfront Residential',
        location: 'V&A Waterfront, Cape Town',
        category: 'Residential',
        description: 'Luxury residential development with 200+ units and world-class amenities',
        featured: true,
        completionDate: '2024'
      },
      {
        id: '3',
        title: 'Durban Industrial Park',
        location: 'Durban South, KwaZulu-Natal',
        category: 'Industrial',
        description: 'Strategic industrial zone development with modern logistics facilities',
        featured: true,
        completionDate: '2022'
      },
      {
        id: '4',
        title: 'Pretoria Office Park',
        location: 'Centurion, Pretoria',
        category: 'Commercial',
        description: 'Grade-A office park development with sustainable design features',
        completionDate: '2023'
      },
      {
        id: '5',
        title: 'Stellenbosch Residential Estate',
        location: 'Stellenbosch, Western Cape',
        category: 'Residential',
        description: 'Boutique estate development in the heart of the Winelands',
        completionDate: '2024'
      },
      {
        id: '6',
        title: 'Port Elizabeth Township',
        location: 'Port Elizabeth, Eastern Cape',
        category: 'Municipal',
        description: 'Social housing township development with community facilities',
        completionDate: '2022'
      },
      {
        id: '7',
        title: 'Midrand Logistics Hub',
        location: 'Midrand, Gauteng',
        category: 'Industrial',
        description: 'Modern logistics and warehousing facility development',
        completionDate: '2023'
      },
      {
        id: '8',
        title: 'Umhlanga Retail Centre',
        location: 'Umhlanga, KwaZulu-Natal',
        category: 'Commercial',
        description: 'Regional shopping centre with entertainment and dining precinct',
        completionDate: '2024'
      }
    ]);

    this.loading.set(false);
  }

  filterByCategory(category: string) {
    this.selectedCategory.set(category);
  }
}
