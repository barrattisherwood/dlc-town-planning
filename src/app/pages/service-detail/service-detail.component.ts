import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CmsService, Service } from '../../services/cms.service';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './service-detail.component.html',
  styleUrl: './service-detail.component.scss'
})
export class ServiceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private cmsService = inject(CmsService);

  service = signal<Service | null>(null);
  loading = signal(true);
  slug = signal('');

  // Mock services data
  private servicesData: { [key: string]: Service } = {
    'land-use-planning': {
      id: '1',
      slug: 'land-use-planning',
      title: 'Land Use Planning',
      summary: 'Comprehensive land use and zoning solutions for sustainable development',
      description: `<h3>Expert Land Use Planning Services</h3>
        <p>Our land use planning services provide comprehensive solutions for property development, rezoning applications, and land use management. We work closely with clients to navigate municipal regulations and ensure compliance with spatial planning frameworks.</p>
        <h4>Key Services Include:</h4>
        <ul>
          <li>Rezoning applications and appeals</li>
          <li>Land use management applications</li>
          <li>Spatial planning and zoning advice</li>
          <li>Municipal liaison and representation</li>
          <li>Development feasibility studies</li>
        </ul>
        <p>Our team has extensive experience working with municipalities across South Africa, ensuring efficient processing and favorable outcomes for our clients.</p>`,
      icon: 'land'
    },
    'township-establishment': {
      id: '2',
      slug: 'township-establishment',
      title: 'Township Establishment',
      summary: 'Full-service township development from concept to approval',
      description: `<h3>Township Establishment & Subdivision</h3>
        <p>We guide clients through the complex process of township establishment, from initial concept through to final proclamation. Our comprehensive service covers all aspects of the development process.</p>
        <h4>Our Process:</h4>
        <ul>
          <li>Feasibility studies and site analysis</li>
          <li>Township layout and engineering design coordination</li>
          <li>Environmental authorization management</li>
          <li>Municipal and provincial application processes</li>
          <li>Public participation coordination</li>
          <li>Subdivision and consolidation applications</li>
        </ul>
        <p>With decades of experience in township development, we ensure your project meets all regulatory requirements while optimizing development potential.</p>`,
      icon: 'township'
    },
    'environmental-planning': {
      id: '3',
      slug: 'environmental-planning',
      title: 'Environmental Planning',
      summary: 'Sustainable environmental impact assessments and management',
      description: `<h3>Environmental Planning & Authorization</h3>
        <p>Our environmental planning services ensure your development complies with environmental legislation while promoting sustainable development practices.</p>
        <h4>Services Offered:</h4>
        <ul>
          <li>Environmental Impact Assessments (EIA)</li>
          <li>Basic Assessments (BA)</li>
          <li>Environmental Management Programmes (EMPr)</li>
          <li>Water use license applications</li>
          <li>Environmental compliance auditing</li>
          <li>Sustainability consulting</li>
        </ul>
        <p>We work with qualified environmental consultants to deliver comprehensive assessments that meet NEMA requirements and support sustainable development goals.</p>`,
      icon: 'environment'
    },
    'municipal-planning': {
      id: '4',
      slug: 'municipal-planning',
      title: 'Municipal Planning',
      summary: 'Strategic planning support for local government',
      description: `<h3>Municipal & Strategic Planning</h3>
        <p>We partner with municipalities and local government to develop spatial planning frameworks and strategic development plans that guide sustainable urban growth.</p>
        <h4>Municipal Services:</h4>
        <ul>
          <li>Spatial Development Frameworks (SDF)</li>
          <li>Integrated Development Plans (IDP)</li>
          <li>Land Use Management Schemes (LUMS)</li>
          <li>Urban design frameworks</li>
          <li>Policy development and review</li>
          <li>Capacity building and training</li>
        </ul>
        <p>Our municipal planning expertise helps local government create enabling environments for investment while protecting community interests.</p>`,
      icon: 'municipal'
    },
    'project-management': {
      id: '5',
      slug: 'project-management',
      title: 'Project Management',
      summary: 'End-to-end development project coordination',
      description: `<h3>Development Project Management</h3>
        <p>Our project management services ensure your development progresses smoothly from conception through to completion, coordinating all technical and administrative aspects.</p>
        <h4>What We Manage:</h4>
        <ul>
          <li>Project planning and programming</li>
          <li>Multi-disciplinary team coordination</li>
          <li>Budget and timeline management</li>
          <li>Stakeholder communication</li>
          <li>Risk identification and mitigation</li>
          <li>Quality control and compliance monitoring</li>
        </ul>
        <p>With proven project management methodologies, we deliver developments on time, within budget, and to specification.</p>`,
      icon: 'project'
    },
    'heritage-impact': {
      id: '6',
      slug: 'heritage-impact',
      title: 'Heritage Impact Assessments',
      summary: 'Cultural heritage evaluation and compliance',
      description: `<h3>Heritage Impact Assessments</h3>
        <p>We conduct comprehensive heritage impact assessments to identify and protect cultural and historical resources in development areas.</p>
        <h4>Assessment Services:</h4>
        <ul>
          <li>Phase 1 heritage impact assessments</li>
          <li>Archaeological impact assessments</li>
          <li>Paleontological impact assessments</li>
          <li>Heritage permit applications</li>
          <li>SAHRA and provincial heritage authority liaison</li>
          <li>Heritage management plans</li>
        </ul>
        <p>Our network of heritage specialists ensures compliance with national heritage legislation while respecting cultural significance.</p>`,
      icon: 'heritage'
    }
  };

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.slug.set(params['slug']);
      this.loadService(params['slug']);
    });
  }

  loadService(slug: string) {
    this.loading.set(true);
    
    // In production, this would call: this.cmsService.getServiceBySlug(slug)
    const serviceData = this.servicesData[slug];
    
    if (serviceData) {
      this.service.set(serviceData);
    } else {
      this.service.set(null);
    }
    
    this.loading.set(false);
  }
}
