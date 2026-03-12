# DLC Town Planning — Sticky Nav & Logo Swap Guide
**Component:** `NavComponent`  
**Assets required:** `dlc-logo-dark.png`, `dlc-logo-white.png`  
**Last updated:** March 2026

---

## 1. Behaviour

- **At page top:** nav is fully transparent, white logo variant, white nav links
- **On scroll past 80px:** nav transitions to solid navy background, dark logo variant, white nav links
- Transition is smooth — CSS `transition` handles the background fade, logo swap is instant on class change
- Nav is always `position: fixed` — never scrolls away

---

## 2. Assets

Place both files in:
```
src/assets/images/dlc-logo-dark.png    ← navy DLC + teal TOWN PLAN (transparent bg)
src/assets/images/dlc-logo-white.png   ← white DLC + teal TOWN PLAN (transparent bg)
```

---

## 3. Component

```typescript
// src/app/shared/components/nav/nav.component.ts
import { Component, HostListener, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink, RouterLinkActive } from '@angular/router'

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent {
  scrolled = signal(false)
  mobileOpen = signal(false)

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 80)
  }

  toggleMobile() {
    this.mobileOpen.update(v => !v)
  }

  closeMobile() {
    this.mobileOpen.set(false)
  }
}
```

---

## 4. Template

```html
<!-- nav.component.html -->
<nav [class.scrolled]="scrolled()">

  <!-- Logo -->
  <a routerLink="/" class="nav-logo">
    <img
      [src]="scrolled()
        ? 'assets/images/dlc-logo-dark.png'
        : 'assets/images/dlc-logo-white.png'"
      alt="DLC Town Plan"
      height="52"
    />
  </a>

  <!-- Desktop links -->
  <ul class="nav-links">
    <li><a routerLink="/services"  routerLinkActive="active" (click)="closeMobile()">Services</a></li>
    <li><a routerLink="/projects"  routerLinkActive="active" (click)="closeMobile()">Projects</a></li>
    <li><a routerLink="/about"     routerLinkActive="active" (click)="closeMobile()">About</a></li>
    <li><a routerLink="/contact"   class="nav-cta"           (click)="closeMobile()">Contact</a></li>
  </ul>

  <!-- Hamburger -->
  <button class="hamburger" (click)="toggleMobile()" [class.open]="mobileOpen()">
    <span></span><span></span><span></span>
  </button>

  <!-- Mobile overlay -->
  <div class="mobile-menu" [class.open]="mobileOpen()">
    <a routerLink="/"         (click)="closeMobile()">Home</a>
    <a routerLink="/services" (click)="closeMobile()">Services</a>
    <a routerLink="/projects" (click)="closeMobile()">Projects</a>
    <a routerLink="/about"    (click)="closeMobile()">About</a>
    <a routerLink="/contact"  (click)="closeMobile()" class="mobile-cta">Contact</a>
  </div>

</nav>
```

---

## 5. Styles

```scss
// nav.component.scss
nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 3rem;
  background: transparent;
  transition: background 0.35s ease, box-shadow 0.35s ease, padding 0.35s ease;

  &.scrolled {
    background: var(--navy);
    box-shadow: 0 2px 24px rgba(0, 0, 0, 0.2);
    padding: 0.75rem 3rem;   // slightly tighter when scrolled
  }
}

.nav-logo img {
  display: block;
  height: 52px;
  width: auto;
  transition: height 0.35s ease;

  nav.scrolled & {
    height: 44px;   // subtly smaller when scrolled
  }
}

// Desktop links
.nav-links {
  display: flex;
  align-items: center;
  gap: 2.5rem;
  list-style: none;

  a {
    color: rgba(255, 255, 255, 0.9);
    text-decoration: none;
    font-size: 0.95rem;
    font-weight: 400;
    letter-spacing: 0.01em;
    position: relative;
    transition: color 0.2s;

    &::after {
      content: '';
      position: absolute;
      bottom: -4px; left: 0; right: 0;
      height: 2px;
      background: var(--teal-l);
      transform: scaleX(0);
      transition: transform 0.2s ease;
    }

    &:hover::after,
    &.active::after {
      transform: scaleX(1);
    }

    &:hover { color: #fff; }
  }
}

// Contact CTA button
.nav-cta {
  background: var(--teal);
  color: #fff !important;
  padding: 0.55rem 1.4rem;
  border-radius: 4px;
  transition: background 0.2s !important;

  &::after { display: none !important; }   // no underline on button
  &:hover { background: var(--teal-l) !important; }
}

// Hamburger
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  z-index: 1100;

  span {
    display: block;
    width: 24px; height: 2px;
    background: #fff;
    border-radius: 2px;
    transition: transform 0.25s ease, opacity 0.25s ease;
  }

  &.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  &.open span:nth-child(2) { opacity: 0; }
  &.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
}

// Mobile menu overlay
.mobile-menu {
  position: fixed;
  inset: 0;
  background: var(--navy);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  z-index: 1050;

  &.open {
    opacity: 1;
    pointer-events: all;
  }

  a {
    color: rgba(255, 255, 255, 0.85);
    text-decoration: none;
    font-size: 1.75rem;
    font-weight: 300;
    letter-spacing: -0.02em;
    transition: color 0.2s;

    &:hover { color: #fff; }
  }

  .mobile-cta {
    margin-top: 1rem;
    background: var(--teal);
    color: #fff !important;
    padding: 0.75rem 2.5rem;
    border-radius: 4px;
    font-size: 1.1rem !important;
  }
}

// Responsive
@media (max-width: 768px) {
  nav { padding: 1rem 1.5rem; }
  nav.scrolled { padding: 0.75rem 1.5rem; }
  .nav-links { display: none; }
  .hamburger { display: flex; }
}
```

---

## 6. Hero Page Offset

The home page hero must be `min-height: 100vh` with no top padding — the nav sits over it. Inner pages (About, Services, etc.) need a top offset so content doesn't hide behind the fixed nav:

```scss
// In each inner page component or globally in styles.scss
.page-hero {
  padding-top: 80px;   // matches nav height
}
```

Or apply globally:
```scss
// styles.scss
main > *:not(app-home) {
  padding-top: 80px;
}
```

The simplest approach is to give every non-home page component a `padding-top: 80px` on its outermost element.

---

## 7. Checklist

```
[ ] Both logo PNGs placed in src/assets/images/
[ ] NavComponent created with HostListener scroll detection
[ ] scrolled signal drives class and logo src binding
[ ] CSS transition on background and padding — not a jump
[ ] Logo swaps correctly: white at top, dark when scrolled
[ ] Mobile hamburger opens full-screen overlay
[ ] All nav links close mobile menu on click
[ ] routerLinkActive applies .active class to current route
[ ] Inner pages have 80px top offset so content isn't hidden behind nav
[ ] Test: scroll down on home page — nav transitions smoothly
[ ] Test: navigate to /about — dark logo visible immediately (page starts scrolled)
[ ] Test: mobile at 375px — hamburger works, overlay opens/closes
```

---

## 8. Note on Inner Pages

On inner pages (`/about`, `/services`, `/projects`, `/contact`) the user lands with `window.scrollY === 0` — which means the nav starts transparent with the white logo. But those pages have a white/light background, so white links and logo are invisible.

**Fix:** add a check for the current route, or simply initialise `scrolled` as `true` on non-home routes:

```typescript
import { Router } from '@angular/router'

constructor(private router: Router) {
  // Start scrolled on any page that isn't home
  this.scrolled.set(this.router.url !== '/')
}
```

This way inner pages always start with the navy nav and dark logo, and the scroll behaviour only kicks in meaningfully on the home page where the full-bleed hero exists.
