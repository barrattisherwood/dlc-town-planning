import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Service } from '../../models/project.model';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './service-detail.component.html',
  styleUrl: './service-detail.component.scss'
})
export class ServiceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);

  service = signal<Service | null>(null);
  loading = signal(true);

  private servicesData: { [key: string]: Service } = {
    'master-planning': {
      id: '1', slug: 'master-planning', title: 'Master Planning',
      summary: 'Comprehensive master plans for large-scale integrated developments',
      description: 'We develop holistic spatial master plans for large-scale mixed-use developments, estates, and urban growth nodes. From conceptual vision through to stakeholder approvals, our master plans provide a framework for phased development that is financially viable, spatially coherent, and regulatory compliant.',
      icon: 'masterplan',
      features: [
        'Conceptual layout and spatial planning',
        'Mixed-use integration strategies',
        'Phased development frameworks',
        'Infrastructure and bulk services planning',
        'Stakeholder engagement and approvals',
        'Development rights optimisation',
        'Urban design guidelines',
        'Economic feasibility input',
      ]
    },
    'land-use-planning': {
      id: '7', slug: 'land-use-planning', title: 'Land Use Planning',
      summary: 'Comprehensive land use and zoning solutions for sustainable development',
      description: 'Our land use planning services provide comprehensive solutions for property development, zoning advice, and regulatory compliance. We guide clients from initial land use assessment through to approved development rights, navigating the complexity of municipal planning frameworks.',
      icon: 'land',
      features: [
        'Land use rights assessment',
        'Zoning scheme interpretation',
        'Spatial planning compliance advice',
        'Development rights optimisation',
        'Municipal policy engagement',
        'Land use management applications',
        'Land capability and suitability studies',
        'Due diligence assessments',
      ]
    },
    'township-establishment': {
      id: '2', slug: 'township-establishment', title: 'Township Establishment',
      summary: 'Full-service township development from concept to proclamation',
      description: 'We guide clients through the full township establishment process — from initial site analysis and layout design through to municipal and provincial approval and final proclamation. Our team coordinates all required technical disciplines to ensure a smooth and compliant process.',
      icon: 'township',
      features: [
        'Site analysis and feasibility studies',
        'Township layout and design',
        'SPLUMA and Ordinance applications',
        'Engineering coordination',
        'Environmental authorisation management',
        'Public participation processes',
        'Subdivision and consolidation applications',
        'Proclamation and title deed registration',
      ]
    },
    'rezoning': {
      id: '3', slug: 'rezoning', title: 'Rezoning Applications',
      summary: 'Section 56 applications and rezoning under various legislative frameworks',
      description: 'We manage the full rezoning application process to unlock the development potential of your land. Our team prepares and motivates applications under SPLUMA, LUPA, and applicable town-planning schemes, liaising with municipalities to achieve favourable outcomes.',
      icon: 'rezoning',
      features: [
        'Rezoning application preparation',
        'Motivated planning reports',
        'Municipal liaison and representation',
        'Section 56 and LUPA applications',
        'Objection management',
        'Appeal processes',
        'Zoning certificate applications',
        'Land use motivation reports',
      ]
    },
    'consent-use': {
      id: '4', slug: 'consent-use', title: 'Consent Use Applications',
      summary: 'Applications for land uses that require consent within existing zoning',
      description: 'Consent use applications allow compatible land uses that fall outside the primary rights of a zone. We prepare, motivate and submit consent use applications in terms of applicable town-planning schemes, guiding clients through the municipal process from submission to approval.',
      icon: 'consent',
      features: [
        'Consent use planning reports',
        'Town-planning scheme interpretation',
        'Municipal application management',
        'Neighbour notification coordination',
        'Objection and appeal handling',
        'Conditions of approval compliance',
        'Site development plan support',
        'Mixed-use consents',
      ]
    },
    'subdivision-consolidation': {
      id: '5', slug: 'subdivision-consolidation', title: 'Subdivision & Consolidation',
      summary: 'Land subdivision and consolidation for optimal development outcomes',
      description: 'We manage applications for the subdivision of land and consolidation of erven under applicable legislation, including the Agricultural Land Act, the Division of Land Ordinance, and Section 92 of the Town-Planning Ordinance. Our team handles the full process from layout design to conditions compliance.',
      icon: 'subdivision',
      features: [
        'Subdivision layout design',
        'Agricultural land subdivision (ALAct)',
        'Division of Land Ordinance applications',
        'Consolidation of erven (Sec 92)',
        'Conditions of establishment compliance',
        'Servitude and easement management',
        'Survey and registration coordination',
        'Re-subdivision applications',
      ]
    },
    'removal-of-restrictions': {
      id: '6', slug: 'removal-of-restrictions', title: 'Removal of Restrictions',
      summary: 'Clearing title deed conditions that limit your development potential',
      description: 'Restrictive title deed conditions and servitudes can significantly limit what you can do with your property. We manage the application process for the removal of restrictions under the Gauteng Removal of Restrictions Act and other applicable legislation, freeing up your land for its intended use.',
      icon: 'restrictions',
      features: [
        'Title deed condition analysis',
        'Removal of Restrictions Act applications',
        'Servitude cancellations',
        'Building line relaxations',
        'Site coverage and FAR relaxations',
        'Neighbour notification and mediation',
        'Municipal approval management',
        'Conveyancer coordination',
      ]
    },
    'municipal-planning': {
      id: '8', slug: 'municipal-planning', title: 'Municipal Planning',
      summary: 'Strategic spatial planning support for local government',
      description: 'We partner with municipalities and local government to develop spatial planning frameworks that guide sustainable urban growth, stimulate investment, and protect community interests. Our municipal planning team brings both technical excellence and practical implementation experience.',
      icon: 'municipal',
      features: [
        'Spatial Development Frameworks (SDF)',
        'Integrated Development Plans (IDP)',
        'Land Use Management Schemes (LUMS)',
        'Urban design frameworks',
        'Policy development and review',
        'Development facilitation',
        'Capacity building and training',
        'Settlement planning',
      ]
    },
    'project-management': {
      id: '9', slug: 'project-management', title: 'Project Management',
      summary: 'End-to-end development project coordination from inception to completion',
      description: 'Our project management services ensure your development progresses smoothly from concept through to completion, coordinating all technical disciplines and administrative processes. We apply proven methodologies to deliver projects on time, within budget, and to specification.',
      icon: 'project',
      features: [
        'Project planning and programming',
        'Multi-disciplinary team coordination',
        'Budget and cost management',
        'Timeline and schedule management',
        'Stakeholder communication',
        'Risk identification and mitigation',
        'Quality control and compliance',
        'Reporting and documentation',
      ]
    },
    'heritage-impact': {
      id: '6',
      slug: 'heritage-impact',
      title: 'Heritage Impact Assessments',
      summary: 'Cultural heritage evaluation and compliance with national legislation',
      description: 'We conduct comprehensive heritage impact assessments to identify, evaluate, and mitigate impacts on cultural and historical resources in development areas. Our network of heritage specialists ensures compliance with the National Heritage Resources Act and all applicable legislation.',
      icon: 'heritage',
      features: [
        'Phase 1 heritage impact assessments',
        'Archaeological impact assessments',
        'Paleontological impact assessments',
        'SAHRA and provincial authority liaison',
        'Heritage permit applications',
        'Heritage management plans',
        'Mitigation strategy development',
        'Built environment heritage assessments',
      ]
    },
    'social-housing': {
      id: '11', slug: 'social-housing', title: 'Social Housing & Tenure',
      summary: 'Planning support for sustainable social housing and tenure upgrading',
      description: 'We provide town planning and project management support for social housing developments, informal settlement upgrades, and tenure enhancement projects. Our team brings experience in community consultation, regulatory compliance, and governmental programme requirements.',
      icon: 'social',
      features: [
        'Social housing site planning',
        'Informal settlement upgrades',
        'Tenure upgrading applications',
        'Community engagement support',
        'NHFC and SHRA programme alignment',
        'Housing chapter input (IDP)',
        'RDP and BNG project management',
        'Community facility integration',
      ]
    },
    'land-reform': {
      id: '12', slug: 'land-reform', title: 'Land Reform',
      summary: 'Facilitating land reform, redistributive development, and community planning',
      description: 'We support land reform initiatives through professional town planning, project management, and community engagement services. Our team works closely with government, communities, and private sector partners to achieve equitable and productive land reform outcomes.',
      icon: 'reform',
      features: [
        'Land reform project planning',
        'Redistribution programme support',
        'Agricultural land subdivision',
        'Community settlement planning',
        'Land claims processing support',
        'Restitution development planning',
        'Spatial planning for land reform areas',
        'Stakeholder engagement',
      ]
    },
  };

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.loadService(params['slug']);
    });
  }

  loadService(slug: string) {
    this.loading.set(true);
    this.service.set(this.servicesData[slug] ?? null);
    this.loading.set(false);
  }
}
