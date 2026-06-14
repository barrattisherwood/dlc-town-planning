import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  contactForm: FormGroup;
  submitted = signal(false);
  submitting = signal(false);
  error = signal<string | null>(null);

  services = [
    'Master Planning',
    'Land Use Planning',
    'Township Establishment',
    'Rezoning Applications',
    'Consent Use Applications',
    'Subdivision & Consolidation',
    'Removal of Restrictions',
    'Municipal Planning',
    'Project Management',
    'Heritage Impact Assessments',
    'Social Housing & Tenure',
    'Land Reform',
    'Other/General Inquiry'
  ];

  constructor() {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      company: [''],
      service: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const service = params['service'];
      if (service && this.services.includes(service)) {
        this.contactForm.patchValue({ service });
      }
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.submitting.set(true);
      this.error.set(null);

      const formData = {
        site: 'dlc-townplanning',
        form: 'contact',
        recipient: 'fj@dlcgroup.co.za',
        data: this.contactForm.value
      };

      this.http.post(`${environment.formsApiUrl}/submit`, formData).subscribe({
        next: () => {
          this.submitting.set(false);
          this.submitted.set(true);
          this.contactForm.reset();

          // Reset success message after 5 seconds
          setTimeout(() => {
            this.submitted.set(false);
          }, 5000);
        },
        error: (err) => {
          console.error('Form submission error:', err);
          this.submitting.set(false);
          this.error.set('Failed to submit form. Please try again or contact us directly via email.');
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.contactForm.controls).forEach(key => {
        this.contactForm.get(key)?.markAsTouched();
      });
    }
  }

  hasError(field: string, error: string): boolean {
    const control = this.contactForm.get(field);
    return !!(control && control.hasError(error) && (control.dirty || control.touched));
  }
}
