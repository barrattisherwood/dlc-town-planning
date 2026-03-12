import { Component, OnInit, OnDestroy, signal, HostListener } from '@angular/core';

@Component({
  selector: 'app-back-to-top',
  standalone: true,
  imports: [],
  templateUrl: './back-to-top.component.html',
  styleUrl: './back-to-top.component.scss'
})
export class BackToTopComponent {
  isVisible = signal(false);

  @HostListener('window:scroll')
  onWindowScroll() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.isVisible.set(scrollPosition > 300);
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
