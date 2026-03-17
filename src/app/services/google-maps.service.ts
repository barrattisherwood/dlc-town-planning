import { Injectable } from '@angular/core';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GoogleMapsService {
  private initialized = false;

  /** Load the Maps JS API. Safe to call multiple times — cached after first load. */
  async load(): Promise<void> {
    if (!this.initialized) {
      setOptions({
        key: environment.googleMapsApiKey,
        v: 'weekly',
      });
      this.initialized = true;
    }
    // importLibrary triggers script injection and returns once the library is ready
    await importLibrary('maps');
  }
}
