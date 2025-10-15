# Maintenance Mode

The Baukasten system includes a robust maintenance mode that allows you to display a custom maintenance page while performing updates or maintenance on your site.

## Overview

Maintenance mode provides:

- **Global site-wide redirection** to a maintenance page
- **Content management** through Kirby CMS
- **Simplified layout** without navigation, footer, or analytics
- **Automatic content synchronization** with cleanup of non-essential files
- **Preview functionality** that bypasses maintenance mode

## How It Works

### 1. CMS Configuration

Maintenance mode is controlled through a dedicated `maintenance` page in Kirby CMS:

- **Page Location**: `/maintenance` in your Kirby CMS
- **Toggle Field**: `maintenanceToggle` (boolean field)
- **Content**: Fully customizable using the block system

### 2. Frontend Detection

The maintenance mode is detected at multiple levels:

#### **Middleware (Primary Control)**

- **File**: `src/middleware.ts`
- **Function**: Intercepts all requests and checks `global.json` for `maintenanceToggle`
- **Behavior**: Redirects to `/maintenance` if active (except excluded paths)

#### **Content Sync Plugin**

- **File**: `plugins/astro-kirby-sync/astro-kirby-sync.js`
- **Function**: Cleans up content files when maintenance mode is active
- **Preserved Files**: `global.json`, `index.json`, `maintenance.json`, `error.json`

## Implementation Details

### Page Structure

```astro
---
// src/pages/maintenance.astro
import PageRenderer from '@components/PageRenderer.astro';
import { getPage } from '@lib/api';

const pageData = await getPage('maintenance');
---

<PageRenderer slug="maintenance" data={pageData} maintenanceMode={true} />
```

### Layout Architecture

#### **MaintenanceLayout.astro**

- **Purpose**: Specialized layout for maintenance mode
- **Features**:
  - ✅ Header with disabled navigation (`headerActive: false`)
  - ❌ No Footer component
  - ❌ No Analytics or tracking scripts
  - ❌ No Cookie consent
  - ✅ All styling, fonts, and CSS variables
  - ✅ Full block system support

#### **PageRenderer Integration**

- **Automatic Layout Selection**: Chooses `MaintenanceLayout` vs `BaseLayout` based on `maintenanceMode` prop
- **Type Safety**: Full TypeScript support with `maintenanceMode?: boolean`
- **Shared Logic**: No code duplication between layouts

### Excluded Paths

The following paths are excluded from maintenance mode redirection:

```typescript
const EXCLUDED_PATHS = [
	'/maintenance',
	'/error',
	'/404',
	'/preview', // Preview functionality bypasses maintenance
	'/favicons',
	'/fonts',
	'/assets',
	'/scripts',
	'/styles',
	'/sitemap-index.xml',
	'/robots.txt',
];
```

## Configuration

### Kirby CMS Setup

1. **Create Maintenance Page**:

   - Add a new page with slug `maintenance` in your CMS
   - Use the maintenance page blueprint
   - Configure content using the block system

2. **Toggle Maintenance Mode**:
   - Edit the maintenance page in Kirby Panel
   - Toggle the `maintenanceToggle` field
   - Save changes

### Blueprint Configuration

The maintenance page uses a dedicated blueprint:

```yaml
# site/blueprints/pages/maintenance.yml
title: Maintenance
preset: page
status:
  listed: true
  unlisted: true

fields:
  maintenanceToggle:
    type: toggle
    label: Maintenance Mode Active
    text:
      - 'Maintenance mode is OFF'
      - 'Maintenance mode is ON'
    help: When enabled, all site traffic will be redirected to this maintenance page

tabs:
  content:
    label: Content
    fields:
      layouts:
        type: layouts
```

## Content Management

### Block System Support

The maintenance page supports all available blocks:

- **Text blocks** for messaging
- **Image blocks** for visual content
- **Button blocks** for actions
- **Custom blocks** for specific maintenance information

### Example Content Structure

```yaml
# Example maintenance page content
layouts:
  - type: blockText
    content:
      text: |
        # Site Under Maintenance

        We're currently performing scheduled maintenance to improve your experience.
        Please check back in a few hours.

  - type: blockImage
    content:
      image: maintenance-illustration.svg
      alt: 'Site maintenance in progress'

  - type: blockButton
    content:
      text: 'Follow Updates'
      link: 'https://twitter.com/yoursite'
      target: '_blank'
```

## Development Workflow

### Testing Maintenance Mode

1. **Enable in CMS**:

   ```
   1. Go to Kirby Panel
   2. Edit the maintenance page
   3. Enable "Maintenance Mode Active"
   4. Save changes
   ```

2. **Content Sync**:

   ```bash
   # The sync plugin will automatically:
   # - Detect maintenance mode from global.json
   # - Clean up non-essential content files
   # - Preserve maintenance and essential files
   ```

3. **Frontend Response**:
   ```
   # All requests (except excluded paths) redirect to:
   # /maintenance
   ```

### Preview Mode Bypass

Preview functionality (`/preview/*`) automatically bypasses maintenance mode:

- Allows content editors to preview changes
- Uses SSR for real-time content updates
- Maintains full site functionality

### Disabling Maintenance Mode

1. **Via CMS**:

   - Edit maintenance page in Kirby Panel
   - Disable "Maintenance Mode Active"
   - Save changes

2. **Emergency Bypass**:
   - Directly edit `content/maintenance/default.txt`
   - Set `Maintenancetoggle: false`

## Technical Architecture

### File Structure

```
src/
├── middleware.ts                    # Global maintenance detection
├── pages/
│   └── maintenance.astro           # Simple 8-line maintenance page
├── layouts/
│   ├── BaseLayout.astro           # Standard site layout
│   └── MaintenanceLayout.astro    # Maintenance-specific layout
├── components/
│   └── PageRenderer.astro         # Smart layout selection
└── types/
    └── components.types.ts        # TypeScript definitions

plugins/
└── astro-kirby-sync/
    └── astro-kirby-sync.js        # Content cleanup logic
```

### API Integration

```php
// cms/site/plugins/baukasten-api/src/Api/GlobalApi.php
"maintenanceToggle" => ($maintenancePage = $site->find('maintenance'))
    ? $maintenancePage->maintenanceToggle()->toBool()
    : false,
```

## Best Practices

### Content Strategy

1. **Clear Communication**:

   - Explain why maintenance is happening
   - Provide estimated completion time
   - Include contact information if needed

2. **Visual Design**:

   - Maintain brand consistency
   - Use appropriate imagery
   - Keep the design clean and focused

3. **User Experience**:
   - Provide alternative ways to reach you
   - Include social media links
   - Consider progress updates

### Technical Considerations

1. **SEO Impact**:

   - Maintenance mode returns 200 status (not 503)
   - Consider using 503 status for extended maintenance
   - Ensure maintenance is temporary

2. **Performance**:

   - Maintenance layout is optimized (no analytics, footer, etc.)
   - Minimal JavaScript and CSS
   - Fast loading times

3. **Monitoring**:
   - Test maintenance mode before major updates
   - Monitor that excluded paths still work
   - Verify content sync behavior

## Troubleshooting

### Common Issues

1. **Maintenance Toggle Not Working**:

   ```
   Check: Global API correctly fetching maintenanceToggle
   Verify: Maintenance page exists in CMS
   Confirm: Content sync is working
   ```

2. **Content Not Displaying**:

   ```
   Check: maintenance.json exists in public/content/
   Verify: Layouts component props are correct
   Confirm: Block content is properly structured
   ```

3. **Redirects Not Working**:
   ```
   Check: Middleware is properly configured
   Verify: global.json contains maintenanceToggle: true
   Confirm: Path is not in EXCLUDED_PATHS
   ```

### Debug Steps

1. **Check Global Data**:

   ```bash
   # Verify maintenance toggle in global data
   curl http://localhost:4321/content/global.json | grep maintenanceToggle
   ```

2. **Test Middleware**:

   ```bash
   # Test redirection behavior
   curl -I http://localhost:4321/any-page
   # Should return 200 with maintenance content
   ```

3. **Verify Content Sync**:
   ```bash
   # Check preserved files during maintenance
   ls public/content/
   # Should show: global.json, index.json, maintenance.json, error.json
   ```

## Related Documentation

- [Content Management](./content-management.md) - Managing content through Kirby CMS
- [Deployment](./deployment.md) - Deployment considerations for maintenance mode
- [Build Plugins](./build-plugins.md) - Content synchronization details
- [Components & Blocks](./components-blocks.md) - Block system usage
