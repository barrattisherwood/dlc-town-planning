import { Component, Input } from '@angular/core';

// Local interface for project card (works with both placeholder and CMS data)
export interface ProjectCardData {
  title: string;
  location: string;
  category: string;
  description: string;
  image?: string;
  completionDate?: string;
}

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [],
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.scss'
})
export class ProjectCardComponent {
  @Input({ required: true }) project!: ProjectCardData;

  onImageError(event: Event) {
    // Hide broken image, fallback will show
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
