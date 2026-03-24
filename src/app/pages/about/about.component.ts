import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CmsService } from '../../services/cms.service';
import { Pillar } from '../../models/project.model';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit {
  private cmsService = inject(CmsService);

  pillars = signal<Pillar[]>([]);
  loading = signal(true);

  values = [
    { title: 'Excellence', description: 'We strive for the highest standards in all our planning solutions', icon: 'star' },
    { title: 'Integrity', description: 'Professional ethics and transparency guide every project we undertake', icon: 'shield' },
    { title: 'Innovation', description: 'Forward-thinking approaches to urban development challenges', icon: 'lightbulb' },
    { title: 'Sustainability', description: 'Environmental responsibility at the core of our planning philosophy', icon: 'leaf' }
  ];

  accreditations = [
    { name: 'SACPLAN', description: 'South African Council for Planners - Registered Professional Planners' },
    { name: 'SACLAP', description: 'South African Council for the Landscape Architectural Profession' },
    { name: 'Professional Membership', description: 'Active members of key industry bodies and associations' }
  ];

  ngOnInit() {
    this.loadContent();
  }

  loadContent() {
    this.cmsService.getSiteSettings().subscribe({
      next: (entry) => {
        if (entry?.data?.pillars?.length) {
          this.pillars.set(entry.data.pillars.map((p, i) => ({
            id: String(i + 1),
            title: p.title,
            description: p.description,
          })));
        } else {
          this.loadFallbackPillars();
        }
        this.loading.set(false);
      },
      error: () => {
        this.loadFallbackPillars();
        this.loading.set(false);
      },
    });
  }

  loadFallbackPillars() {
    this.pillars.set([
      {
        id: '1',
        title: '30 Years of Expertise',
        description: 'With three decades of collective expertise, skills and resources, we have the capabilities to successfully undertake - from inception to final delivery - the town-planning and project management aspects of any venture, from large sophisticated multi-disciplinary programs to small community projects.'
      },
      {
        id: '2',
        title: 'Comprehensive Services',
        description: 'Our services span the full spectrum of town planning including township establishment, rezoning applications, consent use applications, subdivision of land, consolidation of erven, environmental impact assessments, and complete project management and advisory services.'
      },
      {
        id: '3',
        title: 'Pan-African Reach',
        description: 'DLC Town Plan Services have expanded, resulting in a comprehensive capability of delivering services, not only in Gauteng and South-Africa, but also into Africa and beyond. Clients range from individuals to large corporations including private landowners, developers, local and regional governments, mining and industrial sector companies.'
      }
    ]);
  }
}
