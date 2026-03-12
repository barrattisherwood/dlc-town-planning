import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Slide {
  image: string;
  title: string;
  subtitle: string;
  description: string;
}

@Component({
  selector: 'app-hero-slider',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './hero-slider.component.html',
  styleUrl: './hero-slider.component.scss'
})
export class HeroSliderComponent implements OnInit, OnDestroy {
  currentSlide = signal(0);
  private autoPlayInterval?: ReturnType<typeof setInterval>;
  
  slides: Slide[] = [
    {
      image: '/assets/images/hero/urban-development.jpg',
      title: 'Expert Town Planning',
      subtitle: 'Across Africa',
      description: 'Professional planning solutions for sustainable urban development and project management'
    },
    {
      image: '/assets/images/hero/sustainable-cities.jpg',
      title: 'Sustainable Development',
      subtitle: 'For Tomorrow',
      description: 'Creating thriving communities through innovative urban planning and environmental stewardship'
    },
    {
      image: '/assets/images/hero/infrastructure.jpg',
      title: '20+\u00A0Years Experience',
      subtitle: 'Building the Future',
      description: 'Delivering exceptional planning services across residential, commercial, and municipal projects'
    }
  ];

  ngOnInit() {
    this.startAutoPlay();
  }

  ngOnDestroy() {
    this.stopAutoPlay();
    this.currentSlide.set(0); // Reset to first slide
  }

  startAutoPlay() {
    // Clear any existing interval first
    this.stopAutoPlay();
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, 5000); // Change slide every 5 seconds
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  nextSlide() {
    this.currentSlide.set((this.currentSlide() + 1) % this.slides.length);
  }

  previousSlide() {
    this.currentSlide.set(
      this.currentSlide() === 0 ? this.slides.length - 1 : this.currentSlide() - 1
    );
  }

  goToSlide(index: number) {
    this.currentSlide.set(index);
    this.stopAutoPlay();
    this.startAutoPlay(); // Restart auto-play after manual navigation
  }
}
