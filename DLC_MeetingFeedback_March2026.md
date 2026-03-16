# DLC Town Planning — Meeting Feedback & Action Items
**Date:** March 2026  
**Status:** In Progress

---

## ✅ Completed

- [x] Project categories changed from regions to service-based (Master Planning, Township Establishment, Rezonings, etc.)
- [x] Services list removed from About Us page (redundant)
- [x] Company structure updated on About page (Frikkie as owner + Town Planners team)
- [x] Services: Removed "Building Approvals" and "Environmental Assessments"
- [x] Services: Added "Master Planning" as a category
- [x] Home page: replaced "Environmental Planning" block with "Master Planning"
- [x] Services: Removed "Planning & Documentation"
- [x] Contact form: recipient updated to fj@dlcgroup.co.za (Frikkie only)

---

## 🔄 In Progress / Pending

### Maps: Google Maps Migration
- [ ] Swap Leaflet map for Google Maps API on the Projects page
- Frikkie has a paid Google Maps / Google Earth Pro account
- Need: Google Maps API key from Frikkie's account
- Replace Leaflet markers with Google Maps markers
- Investigate whether the paid tier enables any Earth Pro features on the web

### KML / KMZ File Integration *(Phase 2)*
- Frikkie uses Google Earth Pro locally with KML/KMZ project boundary files
- **Investigation:** Google Maps JS API supports loading KML layers via `KmlLayer` class — this could work for project boundaries
- Requirements:
  - KML/KMZ files would need to be hosted at a publicly accessible URL
  - `google.maps.KmlLayer(url)` renders them natively on a Google Map
  - Complex KMZ (with embedded assets) may need conversion to KML first
  - **This is achievable** — not out of reach — but depends on having the KML files accessible
- Recommended approach: host KML files in the CMS (Arclink) alongside project entries, reference URL in project data
- **Phase 2 task**: Add `kmlUrl` field to project CMS schema, render via KmlLayer on project map view

---

## 📋 Content Still Needed

### Team
- Frikkie's details: Owner + Town Planner
- **Nandré** — Surname + photo
- **DC** — Full name + photo
- **Jané** — Surname + photo
- **Sabrina** — Surname + photo

### Services Page
- Final list of service descriptions for:
  - Master Planning *(new)*
  - Township Establishment
  - Rezonings
  - Other retained services

---

## 📌 Notes

- **Frikkie** = Owner and Town Planner — should be presented as both, not redundantly
- Contact form sends to `fj@dlcgroup.co.za` only
- "Planning & Documentation" consolidated into broader services page — no standalone entry
- KML/KMZ integration is a **high value feature** — prioritise getting Google Maps API key first
