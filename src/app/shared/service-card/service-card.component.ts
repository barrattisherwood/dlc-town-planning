import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Service } from '../../services/cms.service';

@Component({
  selector: 'app-service-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './service-card.component.html',
  styleUrl: './service-card.component.scss'
})
export class ServiceCardComponent {
  @Input({ required: true }) service!: Service;
}
