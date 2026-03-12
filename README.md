# DLC Town Planning Website

A professional Angular 17 website for DLC Town Planning, a leading town planning and project management consultancy in southern Africa.

## 🚀 Features

- **Modern Angular 17**: Built with standalone components and Angular Signals
- **Responsive Design**: TailwindCSS 3.4 for mobile-first responsive layouts
- **Professional Branding**: Custom color scheme and typography
- **CMS Integration Ready**: Built-in service layer for Arclink CMS
- **SEO Optimized**: Meta tags, Open Graph, and robots.txt configured
- **Reusable Components**: Project cards, service cards, and utility components
- **Loading States**: Integrated loading spinners for better UX
- **Smooth Animations**: CSS animations for engaging user experience
- **Form Validation**: Reactive forms with comprehensive validation

## 🎨 Brand Colors

- **Navy**: `#0a1628` - Primary brand color
- **Teal**: `#0e7c72` - Action color
- **Teal Light**: `#12a89b` - Accent color
- **Tertiary**: `#6C737B` - Supporting color

## 📦 Tech Stack

- **Angular**: 17.3.x
- **TypeScript**: 5.4.x
- **TailwindCSS**: 3.4.19
- **RxJS**: 7.8.x
- **Google Fonts**: Nunito (headings) & DM Sans (body)

## 🛠️ Development Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Angular CLI (`npm install -g @angular/cli`)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd dlc-town-planning
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   ng serve
   ```
   
   The app will be available at `http://localhost:4200/`

### Alternative Port

If port 4200 is in use:
```bash
ng serve --port 4201
```

## 📁 Project Structure

```
src/
├── app/
│   ├── pages/                    # Page components
│   │   ├── home/                 # Homepage with hero, pillars, services, projects
│   │   ├── about/                # Company story, mission, vision, values
│   │   ├── services/             # Services overview page
│   │   ├── service-detail/       # Individual service pages
│   │   ├── projects/             # Projects with filtering and map
│   │   ├── contact/              # Contact form
│   │   └── not-found/            # 404 error page
│   ├── shared/                   # Shared components
│   │   ├── header/               # Navigation header
│   │   ├── footer/               # Site footer
│   │   ├── loading-spinner/      # Loading indicator
│   │   ├── back-to-top/          # Scroll to top button
│   │   ├── service-card/         # Reusable service card
│   │   └── project-card/         # Reusable project card
│   ├── services/                 # Angular services
│   │   └── cms.service.ts        # CMS API integration
│   ├── app.component.*           # Root component
│   └── app.routes.ts             # Routing configuration
├── environments/                 # Environment configs
├── assets/                       # Static assets
└── styles.scss                   # Global styles
```

## 🔌 CMS Integration

The site is designed to integrate with Arclink CMS:

- **API Base URL**: `https://content.arclink.dev/api/content`
- **Site ID**: `dlc-townplanning`
- **Forms API**: `https://forms.arclink.dev/api/submissions`

### API Endpoints

The `CmsService` provides methods for:
- `getPillars()` - Company pillars/values
- `getServices()` - Service listings
- `getServiceBySlug(slug)` - Individual service details
- `getProjects()` - Project listings
- `getAboutContent()` - About page content

Currently using placeholder data. Connect to live CMS by updating the service methods to use HttpClient calls.

## 🎯 Key Pages

### Home Page
- Hero section with CTAs
- Company pillars (3 cards)
- Services teaser (3 services)
- Featured projects (3 projects)
- About strip
- Contact CTA

### Services
- 6 core services:
  - Land Use Planning
  - Township Establishment
  - Environmental Planning
  - Municipal Planning
  - Project Management
  - Heritage Planning

### Projects
- Interactive map placeholder
- Category filtering
- Project cards with details

### Contact
- Validated contact form
- Company contact details
- Integration with Arclink Forms API

## 🚀 Build & Deployment

### Development Build
```bash
ng build
```

### Production Build
```bash
ng build --configuration production
```

Build artifacts are stored in the `dist/` directory.

### Deployment Options

1. **Static Hosting** (Netlify, Vercel, GitHub Pages):
   - Build the project
   - Deploy the `dist/dlc-town-planning/browser` folder

2. **Cloud Platforms** (AWS, Google Cloud, Azure):
   - Use CI/CD pipelines
   - Deploy build artifacts to hosting service

3. **Server Deployment**:
   - Copy build files to web server
   - Configure server to serve Angular routes

## 📝 Environment Configuration

Two environments are configured:

### Development (`environment.ts`)
```typescript
export const environment = {
  production: false,
  cmsApiUrl: 'https://content.arclink.dev/api/content',
  formsApiUrl: 'https://forms.arclink.dev/api/submissions',
  siteId: 'dlc-townplanning'
};
```

### Production (`environment.prod.ts`)
```typescript
export const environment = {
  production: true,
  cmsApiUrl: 'https://content.arclink.dev/api/content',
  formsApiUrl: 'https://forms.arclink.dev/api/submissions',
  siteId: 'dlc-townplanning'
};
```

## 🧪 Testing

Run unit tests:
```bash
ng test
```

## 🔍 SEO Features

- Meta tags configured in `index.html`
- Open Graph tags for social sharing
- Twitter Card tags
- `robots.txt` for search engine crawlers
- Page titles set in routing configuration
- Semantic HTML structure

## 🎨 Styling Guidelines

### Tailwind Utilities
The project uses custom Tailwind configuration with brand colors:
- `bg-navy`, `text-navy`
- `bg-teal`, `text-teal`
- `bg-teal-light`, `text-teal-light`
- `bg-tertiary`, `text-tertiary`

### Custom Components
Global component classes available:
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-outline`
- `.card` - Card component with shadow
- `.container-custom` - Max-width container
- `.section-padding` - Consistent section spacing

### Animations
CSS animations available:
- `.animate-fade-in`
- `.animate-fade-in-up`
- `.animate-fade-in-down`
- `.animate-fade-in-left`
- `.animate-fade-in-right`
- `.animate-scale-in`

With delay utilities:
- `.animate-delay-100` through `.animate-delay-500`

## 📄 License

Copyright © 2024 DLC Town Planning. All rights reserved.

## 📞 Support

For technical support or questions:
- Email: info@dlctownplanning.co.za
- Website: https://www.dlctownplanning.co.za

## 🔄 Recent Updates

- ✅ Initial Angular 17 setup complete
- ✅ All 6 pages implemented
- ✅ Routing and navigation configured
- ✅ Loading states with spinner component
- ✅ Reusable card components created
- ✅ CSS animations added
- ✅ Back-to-top button implemented
- ✅ SEO optimizations complete
- ⏳ CMS integration pending (placeholder data in use)
- ⏳ Analytics integration pending
- ⏳ Real images pending

---

Built with ❤️ by the development team

