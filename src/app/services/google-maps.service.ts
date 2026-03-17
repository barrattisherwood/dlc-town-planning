import { Injectable } from '@angular/core';
import { Loader } from '@googlemaps/js-api-loader';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GoogleMapsService {
  private loader = new Loader({
    apiKey: environment.googleMapsApiKey,
    version: 'weekly',
    libraries: ['maps', 'marker']
  });

  /** Returns after the Maps JS API is ready. Safe to call multiple times. */
  load(): Promise<typeof google> {
    return this.loader.load();
  }
}
