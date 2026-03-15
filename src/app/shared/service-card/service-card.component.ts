import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

// Local interface for service card (works with both placeholder and CMS data)
export interface ServiceCardData {
  slug: string;
  title: string;
  summary: string;
  icon?: string;
}

@Component({
  selector: 'app-service-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './service-card.component.html',
  styleUrl: './service-card.component.scss'
})
export class ServiceCardComponent {
  @Input({ required: true }) service!: ServiceCardData;
}
