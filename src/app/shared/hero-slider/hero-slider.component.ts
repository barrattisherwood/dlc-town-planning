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
      description: 'Professional planning solutions from inception to delivery - residential, commercial, industrial and municipal projects'
    },
    {
      image: '/assets/images/hero/sustainable-cities.jpg',
      title: '30\u00A0Years of Expertise',
      subtitle: 'Building the Future',
      description: 'Three decades of collective experience delivering exceptional planning services across Africa'
    },
    {
      image: '/assets/images/hero/infrastructure.jpg',
      title: 'Comprehensive Services',
      subtitle: 'Complete Solutions',
      description: 'Township establishment, rezoning, environmental assessments, and complete project management'
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
    this.stopAutoPlay();
    this.startAutoPlay(); // Restart auto-play timer after manual navigation
  }

  previousSlide() {
    this.currentSlide.set(
      this.currentSlide() === 0 ? this.slides.length - 1 : this.currentSlide() - 1
    );
    this.stopAutoPlay();
    this.startAutoPlay(); // Restart auto-play timer after manual navigation
  }

  goToSlide(index: number) {
    this.currentSlide.set(index);
    this.stopAutoPlay();
    this.startAutoPlay(); // Restart auto-play after manual navigation
  }
}
