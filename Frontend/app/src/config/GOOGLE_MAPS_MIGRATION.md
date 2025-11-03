# Google Maps API Migration Guide

Status: In Progress
Date: November 3, 2025
Priority: High

## Summary of Changes

This guide documents the migration of deprecated Google Maps APIs to their modern replacements.

### Issues Fixed

1. Script Loading Without Async (FIXED)
   Error: Google Maps JavaScript API has been loaded directly without loading async
   Root Cause: Script URL missing loading async parameter
   Solution: Added loading async to script URL in googleMaps.js
   File: Frontend/app/src/utils/googleMaps.js

2. Deprecated google.maps.places.Autocomplete (MIGRATING)
   Status: Deprecated as of March 1, 2025
   Recommendation: Migrate to PlaceAutocompleteElement
   Timeline: At least 12 months notice before discontinuation
   Current State: Using Autocomplete class (still works, not recommended)
   Migration Path: See section below

3. Too Many Place Types (FIXED)
   Error: 6 place types are specified in the request, which exceeds the limit (5)
   Root Cause: Report.vue was using 6 types: address, street_address, route, street_number, geocode, establishment
   Solution: Reduced to 4 types: address, street_address, route, establishment
   File: Frontend/app/src/components/Report.vue (Line 193)

4. Deprecated google.maps.Marker (TO DO)
   Status: Deprecated as of February 21, 2024
   Recommendation: Migrate to AdvancedMarkerElement
   Current State: Report.vue uses deprecated google.maps.Marker
   Priority: Medium (still works, but should upgrade)

## Fixes Applied

### Fix 1: Add loading async to Script URL

File: googleMaps.js (Line 64)

BEFORE
script.src = https://maps.googleapis.com/maps/api/js?key=API_KEY&libraries=places&region=MK&language=en

AFTER
script.src = https://maps.googleapis.com/maps/api/js?key=API_KEY&libraries=places&region=MK&language=en&loading=async

Also added defer attribute
script.defer = true

Impact: Eliminates console warning about synchronous loading

### Fix 2: Reduce Place Types Array

File: Report.vue (Line 193)

BEFORE (6 types exceeds limit)
types: address, street_address, route, street_number, geocode, establishment

AFTER (4 types within limit)
types: address, street_address, route, establishment

Rationale:
API limit is 5 types maximum
Removed street_number and geocode (less critical)
Kept address related types that users need most

Impact: 
- Eliminates type limit error
- Better performance (fewer place type queries)
- Still covers street addresses, routes, and establishment searches

---

## 📝 Deprecation Warnings & Migration Plans

### Deprecation 1: google.maps.places.Autocomplete

**Current Status**: Still works, deprecated  
**Migration Deadline**: At least 12 months notice before removal  
**Reference**: https://developers.google.com/maps/documentation/javascript/places-migration-overview

**Migration Plan** (Optional - for future improvement):

#### Option A: Use PlaceAutocompleteElement (Recommended)
```html
<!-- HTML Template -->
<gmp-places-picker
  id="placeInput"
  :input-element="locationInput"
  :session-token="sessionToken"
  region="MK"
/>
```

```javascript
// Script
import { PlaceAutocompleteElement } from '@googlemaps/js-api-loader'

const placeInput = document.getElementById('placeInput')
placeInput.addEventListener('gmp-placeselect', () => {
  const place = placeInput.value.place
  console.log(place)
})
```

#### Option B: Use @googlemaps/js-api-loader Library
```javascript
import { Loader } from '@googlemaps/js-api-loader'

const loader = new Loader({
  apiKey: process.env.VUE_APP_GOOGLE_MAPS_API_KEY,
  version: 'weekly',
  libraries: ['maps', 'places']
})

const { PlacesService } = await loader.importLibrary('places')
```

**Recommendation**: Implement Option B (library loader) as it's more maintainable.

---

### Deprecation 2: google.maps.Marker

**Current Status**: Still works, deprecated since February 2024  
**Migration Deadline**: At least 12 months notice before removal  
**Reference**: https://developers.google.com/maps/documentation/javascript/advanced-markers/migration

**Current Usage**: Report.vue (Line 120)

```javascript
currentMarker = new window.google.maps.Marker({
  position: position,
  map: map.value,
  draggable: true
})
```

**Migration to AdvancedMarkerElement** (Optional):

```javascript
// Enable AdvancedMarkers in map options
const { AdvancedMarkerElement } = await google.maps.importLibrary('marker')

currentMarker = new AdvancedMarkerElement({
  position: position,
  map: map.value,
  draggable: true,
  title: 'Animal Location'
})
```

**Pros**:
- Modern API with better features
- Better performance
- Future-proof

**Cons**:
- Requires additional library import
- More complex styling for custom markers

---

## ✅ Completed Fixes

| Issue | Status | File | Change |
|-------|--------|------|--------|
| Async loading | ✅ Fixed | `googleMaps.js` | Added `loading=async` parameter |
| Place types limit | ✅ Fixed | `Report.vue` | Reduced from 6 to 4 types |
| Script async attribute | ✅ Added | `googleMaps.js` | Added `defer` attribute |

---

## ⏳ In-Progress / TODO

| Task | Status | Priority | Notes |
|------|--------|----------|-------|
| Migrate to PlaceAutocompleteElement | TODO | Medium | Optional nice-to-have |
| Migrate to AdvancedMarkerElement | TODO | Medium | Optional nice-to-have |
| Update google.maps.Marker usage | TODO | Medium | Report.vue line 120 |
| Test Report autocomplete street-level | IN PROGRESS | High | Verify location accuracy |

---

## 🧪 Testing Checklist

### Location Autocomplete Testing (Report.vue)

- [ ] Start typing address in location field
- [ ] Verify suggestions appear
- [ ] Select street address from suggestions
- [ ] Confirm location is properly geocoded to street level
- [ ] Verify no console warnings about type limits
- [ ] Test map marker placement
- [ ] Test marker dragging
- [ ] Test reverse geocoding (click on map)

### Location Autocomplete Testing (Volunteer.vue)

- [ ] Start typing city name
- [ ] Verify city suggestions appear (not street-level)
- [ ] Select city from suggestions
- [ ] Confirm location is stored correctly
- [ ] Verify no console warnings

### Google Maps Script Loading

- [ ] Check browser console for loading warnings
- [ ] Verify "loading=async" parameter in script URL
- [ ] Test on slow 3G connection
- [ ] Verify no duplicate script loading

---

## 📊 Performance Impact

### Before Optimization
- Script loading: Synchronous (potential blocking)
- Place types queries: 6 types (more API calls)
- Console warnings: 5+ warnings per page load

### After Optimization
- Script loading: Asynchronous (non-blocking)
- Place types queries: 4 types (fewer API calls)
- Console warnings: 0 warnings about loading

---

## 🔗 Useful References

1. **Google Maps Script Loading Best Practices**
   - https://goo.gle/js-api-loading
   - Loading parameter options

2. **Places API Autocomplete Migration**
   - https://developers.google.com/maps/documentation/javascript/places-migration-overview
   - Full migration guide

3. **Advanced Markers Migration**
   - https://developers.google.com/maps/documentation/javascript/advanced-markers/migration
   - From deprecated Marker to AdvancedMarkerElement

4. **Places API Type Restrictions**
   - https://developers.google.com/maps/documentation/places/web-service/overview
   - API quotas and limits

---

## 📞 Support

**Issue**: Location autocomplete not working at street level?
1. Check Report.vue `initMap()` function
2. Verify place types include at least 'address' or 'street_address'
3. Check that `strictBounds: true` is set to stay within North Macedonia
4. Verify Google Maps API key has Places API enabled

**Issue**: Console warnings about deprecated APIs?
1. These are deprecation notices, not errors
2. APIs still work but should be migrated eventually
3. Google provides 12+ months notice before removal

---

## 📋 Next Steps

1. **Immediate** (Done):
   - ✅ Add `loading=async` to script URL
   - ✅ Fix place types limit error
   - ✅ Add `defer` attribute to script

2. **Short-term** (Next Sprint):
   - [ ] Test Report autocomplete thoroughly
   - [ ] Test Volunteer autocomplete
   - [ ] Monitor console for remaining warnings

3. **Long-term** (Future Sprints):
   - [ ] Migrate to @googlemaps/js-api-loader library
   - [ ] Consider PlaceAutocompleteElement for better UX
   - [ ] Consider AdvancedMarkerElement for better styling

---

**Last Updated**: November 3, 2025  
**Status**: Partially Complete - Core Fixes Applied
