import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [RouterModule],
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
