import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CmsService, Project } from '../../services/cms.service';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { ProjectCardComponent } from '../../shared/project-card/project-card.component';
import { ProjectMapComponent } from '../../shared/project-map/project-map.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, ProjectCardComponent, ProjectMapComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent implements OnInit {
  private cmsService = inject(CmsService);
  private http = inject(HttpClient);

  allProjects = signal<Project[]>([]);
  selectedCategory = signal<string>('all');
  loading = signal(true);
  apiLoaded = signal(false);

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
    this.loadGoogleMapsScript();
    this.loadProjects();
  }

  loadGoogleMapsScript() {
    if (typeof google !== 'undefined' && google.maps) {
      this.apiLoaded.set(true);
      return;
    }

    this.http
      .jsonp(`https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}`, 'callback')
      .subscribe({
        next: () => {
          this.apiLoaded.set(true);
        },
        error: (error) => {
          console.error('Error loading Google Maps script:', error);
          // Set to true anyway to show the placeholder
          this.apiLoaded.set(true);
        }
      });
  }

  loadProjects() {
    // Placeholder data - in production would call CMS service
    this.allProjects.set([
      {
        id: '1',
        title: 'Tatu City',
        location: 'Nairobi, Kenya',
        category: 'Mixed-Use',
        description: 'DLC Town Plan takes immense pride in its integral role in shaping and orchestrating the development of TATU City.',
        detailedDescription: 'The essence of Tatu City\'s aspiration lies in the conception of an unparalleled, world-class mixed-use urban center—a pioneering endeavor within the African landscape. At its core, this vision revolves around the "live-work-play" concept, aimed at cultivating a dynamic, decentralized hub to the north of Nairobi City. The realization of Tatu City\'s dream has materialized into a tangible achievement, luring both local and international enterprises to its premises. Moreover, over the past six years, Tatu City has yielded the fruition of its ambitions, generating tens of thousands of employment opportunities directly and indirectly.',
        latitude: -1.1300733303582884,
        longitude: 36.90225918872897,
        website: 'https://www.tatucity.com/',
        featured: true,
        completionDate: 'Ongoing'
      },
      {
        id: '2',
        title: 'Sandton Mixed-Use Development',
        location: 'Sandton, Johannesburg',
        category: 'Mixed-Use',
        description: 'Large-scale urban renewal project combining residential, commercial, and retail components',
        featured: true,
        completionDate: '2023'
      },
      {
        id: '3',
        title: 'Cape Town Waterfront Residential',
        location: 'V&A Waterfront, Cape Town',
        category: 'Residential',
        description: 'Luxury residential development with 200+ units and world-class amenities',
        featured: true,
        completionDate: '2024'
      },
      {
        id: '4',
        title: 'Durban Industrial Park',
        location: 'Durban South, KwaZulu-Natal',
        category: 'Industrial',
        description: 'Strategic industrial zone development with modern logistics facilities',
        featured: true,
        completionDate: '2022'
      },
      {
        id: '5',
        title: 'Pretoria Office Park',
        location: 'Centurion, Pretoria',
        category: 'Commercial',
        description: 'Grade-A office park development with sustainable design features',
        completionDate: '2023'
      },
      {
        id: '6',
        title: 'Stellenbosch Residential Estate',
        location: 'Stellenbosch, Western Cape',
        category: 'Residential',
        description: 'Boutique estate development in the heart of the Winelands',
        completionDate: '2024'
      },
      {
        id: '7',
        title: 'Port Elizabeth Township',
        location: 'Port Elizabeth, Eastern Cape',
        category: 'Municipal',
        description: 'Social housing township development with community facilities',
        completionDate: '2022'
      },
      {
        id: '8',
        title: 'Midrand Logistics Hub',
        location: 'Midrand, Gauteng',
        category: 'Industrial',
        description: 'Modern logistics and warehousing facility development',
        completionDate: '2023'
      },
      {
        id: '9',
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
