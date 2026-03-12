import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { ServicesComponent } from './pages/services/services.component';
import { ServiceDetailComponent } from './pages/service-detail/service-detail.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { ContactComponent } from './pages/contact/contact.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'DLC Town Planning | Professional Town Planning Services Across Africa' },
  { path: 'about', component: AboutComponent, title: 'About Us | DLC Town Planning' },
  { path: 'services', component: ServicesComponent, title: 'Services | DLC Town Planning' },
  { path: 'services/:slug', component: ServiceDetailComponent, title: 'Service Details | DLC Town Planning' },
  { path: 'projects', component: ProjectsComponent, title: 'Our Projects | DLC Town Planning' },
  { path: 'contact', component: ContactComponent, title: 'Contact Us | DLC Town Planning' },
  { path: '404', component: NotFoundComponent, title: 'Page Not Found | DLC Town Planning' },
  { path: '**', component: NotFoundComponent, title: 'Page Not Found | DLC Town Planning' }
];
