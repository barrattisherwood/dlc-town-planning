import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CmsService, AboutContent, Pillar } from '../../services/cms.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit {
  private cmsService = inject(CmsService);

  aboutContent = signal<AboutContent | null>(null);
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
    // Placeholder data - in production would call CMS service
    this.aboutContent.set({
      id: '1',
      companyStory: 'Founded in 2000, DLC Town Planning has grown from a boutique consultancy into one of Southern Africa\'s leading town planning and project management firms. Our journey has been defined by a commitment to sustainable development, professional excellence, and meaningful partnerships with communities across the continent.',
      mission: 'To deliver innovative and sustainable town planning solutions that create lasting value for communities, clients, and the environment.',
      vision: 'To be Africa\'s most trusted town planning consultancy, recognized for excellence, integrity, and transformative urban development.',
      yearsEstablished: '2000',
      accreditations: ['SACPLAN', 'SACLAP']
    });

    this.pillars.set([
      { 
        id: '1', 
        title: 'Decades of Experience', 
        description: 'With over 20 years in the industry, our team has navigated complex planning challenges across hundreds of projects. From small-scale residential developments to large industrial zones, our experience spans the full spectrum of town planning and project management.'
      },
      { 
        id: '2', 
        title: 'Registered Professionals', 
        description: 'All our planners are registered with SACPLAN and adhere to strict professional standards. Our qualifications and ongoing professional development ensure that clients receive expert guidance backed by industry-recognized credentials.'
      },
      { 
        id: '3', 
        title: 'Pan-African Reach', 
        description: 'While rooted in South Africa, we have successfully executed projects across multiple African countries. Our understanding of diverse regulatory environments and cultural contexts makes us the ideal partner for cross-border development initiatives.'
      }
    ]);

    this.loading.set(false);
  }
}
