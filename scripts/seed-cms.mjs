/**
 * DLC Town Planning — Arclink CMS Seed Script
 *
 * Seeds the Arclink CMS with the current site content (projects, services, site settings).
 *
 * Usage:
 *   ARCLINK_API_KEY=your_key node scripts/seed-cms.mjs
 *
 * Options:
 *   --dry-run   Print payloads without sending requests
 *   --delete    Delete existing entries before seeding (default: skip if slug exists)
 */

const API_KEY = process.env.ARCLINK_API_KEY;
const BASE_URL = 'https://content.arclink.dev';
const SITE_ID = 'dlc-townplanning';

const DRY_RUN = process.argv.includes('--dry-run');
const DELETE_FIRST = process.argv.includes('--delete');

if (!API_KEY && !DRY_RUN) {
  console.error('Error: ARCLINK_API_KEY environment variable is required.');
  console.error('Usage: ARCLINK_API_KEY=your_key node scripts/seed-cms.mjs');
  process.exit(1);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function apiGet(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  return res.json();
}

async function apiPost(path, body) {
  if (DRY_RUN) {
    console.log('[DRY RUN] POST', path);
    console.log(JSON.stringify(body, null, 2));
    return { ok: true, dry: true };
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`POST ${path} → ${res.status}: ${JSON.stringify(json)}`);
  return json;
}

async function apiDelete(path) {
  if (DRY_RUN) {
    console.log('[DRY RUN] DELETE', path);
    return { ok: true };
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: { 'x-api-key': API_KEY },
  });
  return res.ok;
}

async function seedContentType(contentType, entries) {
  console.log(`\n── Seeding ${contentType} (${entries.length} entries) ──`);

  // Fetch existing slugs
  const existing = await apiGet(`/entries/${SITE_ID}/${contentType}?published=true`);
  const existingSlugs = new Set((existing.entries || []).map(e => e.slug));

  for (const entry of entries) {
    if (existingSlugs.has(entry.slug)) {
      if (DELETE_FIRST) {
        console.log(`  [DELETE] ${entry.slug}`);
        await apiDelete(`/entries/${SITE_ID}/${contentType}/${entry.slug}`);
      } else {
        console.log(`  [SKIP]   ${entry.slug} (already exists — use --delete to replace)`);
        continue;
      }
    }
    try {
      const result = await apiPost(`/entries/${SITE_ID}/${contentType}`, entry);
      if (!result.dry) console.log(`  [OK]     ${entry.slug}`);
    } catch (err) {
      console.error(`  [FAIL]   ${entry.slug}: ${err.message}`);
    }
  }
}

// ─── PROJECTS ────────────────────────────────────────────────────────────────

const projects = [
  {
    slug: 'tatu-city',
    published: true,
    data: {
      title: 'Tatu City',
      location: 'Nairobi, Kenya',
      region: 'East Africa',
      country: 'Kenya',
      category: 'Master Planning',
      description: 'DLC Town Plan takes immense pride in its integral role in shaping and orchestrating the development of TATU City. The essence of Tatu City\'s aspiration lies in the conception of an unparalleled, world-class mixed-use urban center—a pioneering endeavor within the African landscape. At its core, this vision revolves around the "live-work-play" concept, aimed at cultivating a dynamic, decentralized hub to the north of Nairobi City.',
      latitude: -1.1300733303582884,
      longitude: 36.90225918872897,
      projectUrl: 'https://www.tatucity.com/',
      featured: true,
      completionDate: 'Ongoing',
    }
  },
  {
    slug: 'sandton-mixed-use-development',
    published: true,
    data: {
      title: 'Sandton Mixed-Use Development',
      location: 'Sandton, Johannesburg',
      region: 'Southern Africa',
      country: 'South Africa',
      category: 'Township Establishment',
      description: 'Large-scale urban renewal project combining residential, commercial, and retail components in the heart of Johannesburg\'s financial district. This development brings together world-class amenities and sustainable design principles.',
      latitude: -26.107734,
      longitude: 28.056847,
      featured: true,
      completionDate: '2023',
    }
  },
  {
    slug: 'cape-town-waterfront-residential',
    published: true,
    data: {
      title: 'Cape Town Waterfront Residential',
      location: 'V&A Waterfront, Cape Town',
      region: 'Southern Africa',
      country: 'South Africa',
      category: 'Rezoning',
      description: 'Luxury residential development with 200+ units and world-class amenities overlooking Table Bay. Features include a rooftop pool, gym, concierge services, and direct access to the waterfront promenade.',
      latitude: -33.9031,
      longitude: 18.4200,
      featured: true,
      completionDate: '2024',
    }
  },
  {
    slug: 'durban-industrial-park',
    published: true,
    data: {
      title: 'Durban Industrial Park',
      location: 'Durban South, KwaZulu-Natal',
      region: 'Southern Africa',
      country: 'South Africa',
      category: 'Township Establishment',
      description: 'Strategic industrial zone development with modern logistics facilities designed to support the growing manufacturing and export sectors in the region.',
      latitude: -29.9844,
      longitude: 30.9292,
      featured: true,
      completionDate: '2022',
    }
  },
  {
    slug: 'pretoria-office-park',
    published: true,
    data: {
      title: 'Pretoria Office Park',
      location: 'Centurion, Pretoria',
      region: 'Southern Africa',
      country: 'South Africa',
      category: 'Rezoning',
      description: 'Grade-A office park development with sustainable design features including solar panels, rainwater harvesting, and green building certifications.',
      latitude: -25.8646,
      longitude: 28.1829,
      completionDate: '2023',
    }
  },
  {
    slug: 'stellenbosch-residential-estate',
    published: true,
    data: {
      title: 'Stellenbosch Residential Estate',
      location: 'Stellenbosch, Western Cape',
      region: 'Southern Africa',
      country: 'South Africa',
      category: 'Consent Use',
      description: 'Boutique estate development in the heart of the Winelands, featuring Mediterranean-inspired architecture and vineyard views.',
      latitude: -33.9321,
      longitude: 18.8602,
      completionDate: '2024',
    }
  },
  {
    slug: 'port-elizabeth-township',
    published: true,
    data: {
      title: 'Port Elizabeth Township',
      location: 'Port Elizabeth, Eastern Cape',
      region: 'Southern Africa',
      country: 'South Africa',
      category: 'Municipal Planning',
      description: 'Social housing township development with community facilities including schools, clinics, and recreational spaces designed to foster community development.',
      latitude: -33.9608,
      longitude: 25.6022,
      completionDate: '2022',
    }
  },
  {
    slug: 'midrand-logistics-hub',
    published: true,
    data: {
      title: 'Midrand Logistics Hub',
      location: 'Midrand, Gauteng',
      region: 'Southern Africa',
      country: 'South Africa',
      category: 'Subdivision',
      description: 'Modern logistics and warehousing facility development strategically located between Johannesburg and Pretoria with access to major highways.',
      latitude: -25.9953,
      longitude: 28.1288,
      completionDate: '2023',
    }
  },
  {
    slug: 'umhlanga-retail-centre',
    published: true,
    data: {
      title: 'Umhlanga Retail Centre',
      location: 'Umhlanga, KwaZulu-Natal',
      region: 'Southern Africa',
      country: 'South Africa',
      category: 'Project Management',
      description: 'Regional shopping centre with entertainment and dining precinct, featuring over 150 stores, cinema complex, and family entertainment facilities.',
      latitude: -29.7286,
      longitude: 31.0821,
      completionDate: '2024',
    }
  },
];

// ─── SERVICES ────────────────────────────────────────────────────────────────

const services = [
  {
    slug: 'master-planning',
    published: true,
    data: {
      title: 'Master Planning',
      summary: 'Comprehensive master plans for large-scale integrated developments',
      description: 'We develop holistic spatial master plans for large-scale mixed-use developments, estates, and urban growth nodes. From conceptual vision through to stakeholder approvals, our master plans provide a framework for phased development that is financially viable, spatially coherent, and regulatory compliant.',
      icon: 'masterplan',
      order: 1,
      featured: true,
      features: [
        'Conceptual layout and spatial planning',
        'Mixed-use integration strategies',
        'Phased development frameworks',
        'Infrastructure and bulk services planning',
        'Stakeholder engagement and approvals',
        'Development rights optimisation',
        'Urban design guidelines',
        'Economic feasibility input',
      ],
    }
  },
  {
    slug: 'township-establishment',
    published: true,
    data: {
      title: 'Township Establishment',
      summary: 'Full-service township development from concept to proclamation',
      description: 'We guide clients through the full township establishment process — from initial site analysis and layout design through to municipal and provincial approval and final proclamation. Our team coordinates all required technical disciplines to ensure a smooth and compliant process.',
      icon: 'township',
      order: 2,
      featured: true,
      features: [
        'Site analysis and feasibility studies',
        'Township layout and design',
        'SPLUMA and Ordinance applications',
        'Engineering coordination',
        'Environmental authorisation management',
        'Public participation processes',
        'Subdivision and consolidation applications',
        'Proclamation and title deed registration',
      ],
    }
  },
  {
    slug: 'rezoning',
    published: true,
    data: {
      title: 'Rezoning Applications',
      summary: 'Section 56 applications and rezoning under various legislative frameworks',
      description: 'We manage the full rezoning application process to unlock the development potential of your land. Our team prepares and motivates applications under SPLUMA, LUPA, and applicable town-planning schemes, liaising with municipalities to achieve favourable outcomes.',
      icon: 'rezoning',
      order: 3,
      featured: false,
      features: [
        'Rezoning application preparation',
        'Motivated planning reports',
        'Municipal liaison and representation',
        'Section 56 and LUPA applications',
        'Objection management',
        'Appeal processes',
        'Zoning certificate applications',
        'Land use motivation reports',
      ],
    }
  },
  {
    slug: 'consent-use',
    published: true,
    data: {
      title: 'Consent Use Applications',
      summary: 'Applications for land uses that require consent within existing zoning',
      description: 'Consent use applications allow compatible land uses that fall outside the primary rights of a zone. We prepare, motivate and submit consent use applications in terms of applicable town-planning schemes, guiding clients through the municipal process from submission to approval.',
      icon: 'consent',
      order: 4,
      featured: false,
      features: [
        'Consent use planning reports',
        'Town-planning scheme interpretation',
        'Municipal application management',
        'Neighbour notification coordination',
        'Objection and appeal handling',
        'Conditions of approval compliance',
        'Site development plan support',
        'Mixed-use consents',
      ],
    }
  },
  {
    slug: 'subdivision-consolidation',
    published: true,
    data: {
      title: 'Subdivision & Consolidation',
      summary: 'Land subdivision and consolidation for optimal development outcomes',
      description: 'We manage applications for the subdivision of land and consolidation of erven under applicable legislation, including the Agricultural Land Act, the Division of Land Ordinance, and Section 92 of the Town-Planning Ordinance. Our team handles the full process from layout design to conditions compliance.',
      icon: 'subdivision',
      order: 5,
      featured: false,
      features: [
        'Subdivision layout design',
        'Agricultural land subdivision (ALAct)',
        'Division of Land Ordinance applications',
        'Consolidation of erven (Sec 92)',
        'Conditions of establishment compliance',
        'Servitude and easement management',
        'Survey and registration coordination',
        'Re-subdivision applications',
      ],
    }
  },
  {
    slug: 'removal-of-restrictions',
    published: true,
    data: {
      title: 'Removal of Restrictions',
      summary: 'Clearing title deed conditions that limit your development potential',
      description: 'Restrictive title deed conditions and servitudes can significantly limit what you can do with your property. We manage the application process for the removal of restrictions under the Gauteng Removal of Restrictions Act and other applicable legislation, freeing up your land for its intended use.',
      icon: 'restrictions',
      order: 6,
      featured: false,
      features: [
        'Title deed condition analysis',
        'Removal of Restrictions Act applications',
        'Servitude cancellations',
        'Building line relaxations',
        'Site coverage and FAR relaxations',
        'Neighbour notification and mediation',
        'Municipal approval management',
        'Conveyancer coordination',
      ],
    }
  },
  {
    slug: 'land-use-planning',
    published: true,
    data: {
      title: 'Land Use Planning',
      summary: 'Comprehensive land use and zoning solutions for sustainable development',
      description: 'Our land use planning services provide comprehensive solutions for property development, zoning advice, and regulatory compliance. We guide clients from initial land use assessment through to approved development rights, navigating the complexity of municipal planning frameworks.',
      icon: 'land',
      order: 7,
      featured: true,
      features: [
        'Land use rights assessment',
        'Zoning scheme interpretation',
        'Spatial planning compliance advice',
        'Development rights optimisation',
        'Municipal policy engagement',
        'Land use management applications',
        'Land capability and suitability studies',
        'Due diligence assessments',
      ],
    }
  },
  {
    slug: 'municipal-planning',
    published: true,
    data: {
      title: 'Municipal Planning',
      summary: 'Strategic spatial planning support for local government',
      description: 'We partner with municipalities and local government to develop spatial planning frameworks that guide sustainable urban growth, stimulate investment, and protect community interests. Our municipal planning team brings both technical excellence and practical implementation experience.',
      icon: 'municipal',
      order: 8,
      featured: false,
      features: [
        'Spatial Development Frameworks (SDF)',
        'Integrated Development Plans (IDP)',
        'Land Use Management Schemes (LUMS)',
        'Urban design frameworks',
        'Policy development and review',
        'Development facilitation',
        'Capacity building and training',
        'Settlement planning',
      ],
    }
  },
  {
    slug: 'project-management',
    published: true,
    data: {
      title: 'Project Management',
      summary: 'End-to-end development project coordination from inception to completion',
      description: 'Our project management services ensure your development progresses smoothly from concept through to completion, coordinating all technical disciplines and administrative processes. We apply proven methodologies to deliver projects on time, within budget, and to specification.',
      icon: 'project',
      order: 9,
      featured: false,
      features: [
        'Project planning and programming',
        'Multi-disciplinary team coordination',
        'Budget and cost management',
        'Timeline and schedule management',
        'Stakeholder communication',
        'Risk identification and mitigation',
        'Quality control and compliance',
        'Reporting and documentation',
      ],
    }
  },
  {
    slug: 'heritage-impact',
    published: true,
    data: {
      title: 'Heritage Impact Assessments',
      summary: 'Cultural heritage evaluation and compliance with national legislation',
      description: 'We conduct comprehensive heritage impact assessments to identify, evaluate, and mitigate impacts on cultural and historical resources in development areas. Our network of heritage specialists ensures compliance with the National Heritage Resources Act and all applicable legislation.',
      icon: 'heritage',
      order: 10,
      featured: false,
      features: [
        'Phase 1 heritage impact assessments',
        'Archaeological impact assessments',
        'Paleontological impact assessments',
        'SAHRA and provincial authority liaison',
        'Heritage permit applications',
        'Heritage management plans',
        'Mitigation strategy development',
        'Built environment heritage assessments',
      ],
    }
  },
  {
    slug: 'social-housing',
    published: true,
    data: {
      title: 'Social Housing & Tenure',
      summary: 'Planning support for sustainable social housing and tenure upgrading',
      description: 'We provide town planning and project management support for social housing developments, informal settlement upgrades, and tenure enhancement projects. Our team brings experience in community consultation, regulatory compliance, and governmental programme requirements.',
      icon: 'social',
      order: 11,
      featured: false,
      features: [
        'Social housing site planning',
        'Informal settlement upgrades',
        'Tenure upgrading applications',
        'Community engagement support',
        'NHFC and SHRA programme alignment',
        'Housing chapter input (IDP)',
        'RDP and BNG project management',
        'Community facility integration',
      ],
    }
  },
  {
    slug: 'land-reform',
    published: true,
    data: {
      title: 'Land Reform',
      summary: 'Facilitating land reform, redistributive development, and community planning',
      description: 'We support land reform initiatives through professional town planning, project management, and community engagement services. Our team works closely with government, communities, and private sector partners to achieve equitable and productive land reform outcomes.',
      icon: 'reform',
      order: 12,
      featured: false,
      features: [
        'Land reform project planning',
        'Redistribution programme support',
        'Agricultural land subdivision',
        'Community settlement planning',
        'Land claims processing support',
        'Restitution development planning',
        'Spatial planning for land reform areas',
        'Stakeholder engagement',
      ],
    }
  },
];

// ─── SITE SETTINGS ───────────────────────────────────────────────────────────

const siteSettings = [
  {
    slug: 'main',
    published: true,
    data: {
      companyName: 'DLC Town Planning',
      companyStory: 'With the depth of 30 years collective expertise, skills and resources embodied in the consultancy, we have the capabilities to successfully undertake - from inception to final delivery - the town-planning and project management aspects of any venture, from large sophisticated multi-disciplinary programs to small community projects. We have successfully dealt with the town-planning requirements of a wide range of projects, including residential, industrial, commercial, business as well as various other developments such as Life Style Estates, Eco Estates, Golf Estates and "Development & Reconstruction and Development Program" (RDP), Master Plans.',
      companyStoryExtended: 'DLC Town Plan Services have expanded, resulting in a comprehensive capability of delivering services, not only in Gauteng and in South-Africa, but also into Africa and beyond. Clients range from individuals to large corporations including private landowners, developers, local and regional governments, mining and industrial sector companies.',
      mission: 'To deliver professional town planning and project management services across Africa, ensuring efficient, sustainable, and compliant development solutions from inception to completion.',
      vision: 'To be recognized as Africa\'s most trusted and comprehensive town planning consultancy, known for technical excellence, professional integrity, and successful project delivery.',
      yearsEstablished: '30',
      contactEmail: 'fj@dlcgroup.co.za',
      contactPhone: '',
      address: '',
      accreditations: ['SACPLAN', 'SACLAP', 'Professional Membership'],
      pillars: [
        {
          title: '30 Years of Expertise',
          description: 'Three decades of collective experience in town planning, township establishment, and project management across South Africa and the African continent.',
        },
        {
          title: 'Comprehensive Services',
          description: 'A full spectrum of planning and project management services covering every stage of the development lifecycle, from concept through to completion.',
        },
        {
          title: 'Pan-African Reach',
          description: 'Active projects across South Africa and into Africa, with the capability to deliver complex multi-disciplinary programmes in diverse regulatory environments.',
        },
      ],
      teamMembers: [
        {
          name: 'Frikkie de Lange',
          title: 'Owner & Town Planner',
          credentials: 'Pr. Pln | SACPLAN Registered',
          email: 'fj@dlcgroup.co.za',
          image: '',
        },
        {
          name: 'Nandré du Toit',
          title: 'Town Planner',
          image: '',
        },
        {
          name: 'DC Pretorius',
          title: 'Town Planner',
          image: '',
        },
        {
          name: 'Janée Bresler',
          title: 'Town Planner',
          image: '',
        },
        {
          name: 'Sabrina Mon',
          title: 'Town Planner',
          image: '',
        },
      ],
    }
  }
];

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`DLC Town Planning — Arclink CMS Seed`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'} | Delete first: ${DELETE_FIRST}`);
  console.log(`Target: ${BASE_URL}/entries/${SITE_ID}/`);

  await seedContentType('project', projects);
  await seedContentType('service', services);
  await seedContentType('site-settings', siteSettings);

  console.log('\n✓ Seed complete.');
}

main().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
