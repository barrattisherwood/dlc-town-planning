# Hero Slider Images

This directory contains hero slider background images for the homepage.

## Required Images

The slider expects 3 images with these filenames:

1. **urban-development.jpg** - Main hero image showing urban planning/development
2. **sustainable-cities.jpg** - Image depicting sustainable city planning
3. **infrastructure.jpg** - Infrastructure or construction planning image

## Image Specifications

- **Dimensions**: 1920x1080px or higher (16:9 aspect ratio)
- **Format**: JPG or PNG
- **File size**: Optimize to under 500KB each for fast loading
- **Content**: High-quality professional photography
  - Urban landscapes
  - City skylines
  - Development projects
  - Planning activities
  - Infrastructure

## Recommended Sources

- **Unsplash**: https://unsplash.com/s/photos/urban-planning
- **Pexels**: https://www.pexels.com/search/city%20planning/
- **Your own projects**: High-quality photos from actual DLC projects

## Image Optimization

Use tools like:
- TinyPNG (https://tinypng.com/)
- ImageOptim (Mac)
- Squoosh (https://squoosh.app/)

## Placeholder

Currently using gradient backgrounds. Once you add images:

1. Place images in this directory
2. Uncomment the `<img>` tag in `hero-slider.component.html`
3. Comment out the gradient `<div>` placeholder

## Example HTML (in hero-slider.component.html)

```html
<!-- Replace this placeholder gradient: -->
<div class="absolute inset-0 bg-gradient-to-br from-navy via-teal/80 to-navy"></div>

<!-- With this image: -->
<img [src]="slide.image" [alt]="slide.title" class="w-full h-full object-cover" />
```
