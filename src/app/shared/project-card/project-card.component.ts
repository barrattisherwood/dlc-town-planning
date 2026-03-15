import { Component, Input } from '@angular/core';
import { Project } from '../../services/cms.service';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [],
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.scss'
})
export class ProjectCardComponent {
  @Input({ required: true }) project!: Project;

  onImageError(event: Event) {
    // Hide broken image, fallback will show
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
