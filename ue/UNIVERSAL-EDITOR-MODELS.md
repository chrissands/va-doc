# Universal Editor Models for USWDS Blocks

This directory contains model definitions for all USWDS blocks to enable authoring in Adobe Universal Editor.

## Overview

Universal Editor models define:
- **Definitions**: How blocks appear in the component picker
- **Models**: Field configurations for editing block content
- **Filters**: Which components can be used within container blocks

## File Structure

```
ue/
├── models/
│   ├── blocks/          # Individual block model definitions
│   │   ├── alert.json
│   │   ├── banner.json
│   │   ├── card.json
│   │   ├── collection.json
│   │   ├── ... (35 total)
│   ├── component-definition.json  # Auto-registers all blocks via wildcard
│   ├── component-models.json      # Auto-registers all models via wildcard
│   ├── component-filters.json     # Filter definitions
│   ├── image.json
│   ├── page.json
│   ├── section.json
│   └── text.json
├── scripts/
│   ├── ue-utils.js
│   └── ue.js
└── README.md
```

## Build System

The project uses a **source → build** workflow:

### Source Files (Edit These)
- `/ue/models/blocks/*.json` - Individual block models
- `/ue/models/component-models.json` - Wildcard references
- `/ue/models/component-definition.json` - Wildcard references
- `/ue/models/component-filters.json` - Filter definitions

### Build Command
```bash
npm run build:json
```

### Output Files (Generated, Don't Edit)
- `/component-models.json` - Fully expanded models
- `/component-definition.json` - Fully expanded definitions
- `/component-filters.json` - Fully expanded filters

**Universal Editor reads the root-level (built) files**, so you must run `npm run build:json` after creating or modifying any models!

## Automatic Registration via Wildcards

The source files use wildcard patterns to automatically include all block models:

**`component-definition.json`:**
```json
{
  "groups": [
    {
      "title": "Blocks",
      "id": "blocks",
      "components": [
        {
          "...": "./blocks/*.json#/definitions"
        }
      ]
    }
  ]
}
```

**`component-models.json`:**
```json
[
  {
    "...": "./blocks/*.json#/models"
  }
]
```

This means **any new JSON file** added to `ue/models/blocks/` is automatically included when you run `npm run build:json`!

## Available Block Models

### Core USWDS Components

**Layout & Structure:**
- `alert.json` - Info, warning, success, error, emergency alerts
- `banner.json` - Government website banner
- `breadcrumb.json` - Navigation breadcrumbs
- `collection.json` - Lists of articles/content with metadata
- `columns.json` - Multi-column layouts
- `hero.json` - Large hero sections with images and callouts
- `section.json` - Content sections

**Navigation:**
- `header.json` - Site header (managed via `/nav/header`)
- `footer.json` - Site footer (managed via `/nav/footer`)
- `in-page-nav.json` - Jump links within a page
- `side-nav.json` - Hierarchical side navigation
- `pagination.json` - Page navigation controls

**Content Display:**
- `card.json` - Content cards with images, text, and actions
- `prose.json` - Long-form text with USWDS typography
- `summary-box.json` - Key information highlights
- `table.json` - Data tables with variants
- `accordion.json` - Expandable content sections
- `tabs.json` - Tabbed content
- `carousel.json` - Image/content carousel
- `quote.json` - Blockquotes with attribution
- `modal.json` - Dialog overlays

**Lists & Steps:**
- `list.json` - Styled and unstyled lists
- `icon-list.json` - Lists with icons
- `process-list.json` - Step-by-step processes
- `step-indicator.json` - Progress through multi-step flows

**Actions:**
- `button-group.json` - Grouped buttons
- `link.json` - Styled links with external indicators
- `tag.json` - Content tags/labels

**Media:**
- `video.json` - Video embeds
- `embed.json` - Generic embeds (YouTube, Vimeo, etc.)
- `icon.json` - USWDS icons

**Forms:**
- `form.json` - Form definitions
- `search.json` - Search functionality

**Utilities:**
- `fragment.json` - Reusable content fragments
- `identifier.json` - Agency identification footer

### Legacy/Compatibility:
- `cards.json` - Legacy, use `card.json` instead

## Model Structure

Each block model JSON file contains three main sections:

### 1. Definitions

Defines how the block appears in the Universal Editor component picker:

```json
{
  "definitions": [
    {
      "title": "Alert",
      "id": "alert",
      "plugins": {
        "da": {
          "name": "alert",
          "rows": 3,
          "columns": 0
        }
      }
    }
  ]
}
```

**Key properties:**
- `title`: Display name in component picker
- `id`: Unique identifier
- `plugins.da`: Document Authoring plugin configuration
  - `name`: Block name (creates `class="blockname"`)
  - `rows`: Initial number of rows
  - `columns`: Initial number of columns
  - `unsafeHTML`: Custom HTML template (alternative to name/rows/columns)

### 2. Models

Defines editable fields for the block:

```json
{
  "models": [
    {
      "id": "alert",
      "fields": [
        {
          "component": "select",
          "name": "classes",
          "label": "Alert Type",
          "valueType": "string",
          "options": [
            {
              "name": "Info (default)",
              "value": ""
            },
            {
              "name": "Warning",
              "value": "warning"
            }
          ]
        },
        {
          "component": "richtext",
          "name": "div:nth-child(1)",
          "label": "Content",
          "valueType": "string"
        }
      ]
    }
  ]
}
```

**Field types:**
- `text`: Single-line text input
- `richtext`: WYSIWYG editor
- `reference`: File/image picker
- `select`: Dropdown menu
- `multiselect`: Multiple choice dropdown
- `boolean`: Checkbox (adds class when checked)
- `number`: Numeric input

**Field properties:**
- `component`: Field type
- `name`: CSS selector or property name
  - `classes`: Adds CSS classes to block
  - `div:nth-child(1)`: Targets specific element
  - `img[src]`: Targets attribute
- `label`: Display label
- `valueType`: Data type (string, number, boolean)
- `value`: Default value
- `description`: Help text
- `required`: Whether field is mandatory
- `multi`: Allow multiple values (for reference fields)

### 3. Filters

Defines which components can be nested within container blocks:

```json
{
  "filters": [
    {
      "id": "collection",
      "components": [
        "collection-item"
      ]
    }
  ]
}
```

## Creating a New Model

### Step 1: Create JSON File

Create `/ue/models/blocks/yourblock.json`:

```json
{
  "definitions": [
    {
      "title": "Your Block",
      "id": "yourblock",
      "plugins": {
        "da": {
          "name": "yourblock",
          "rows": 2,
          "columns": 0
        }
      }
    }
  ],
  "models": [
    {
      "id": "yourblock",
      "fields": [
        {
          "component": "text",
          "name": "div:nth-child(1)>h2:nth-child(1)",
          "label": "Heading",
          "valueType": "string",
          "value": "Default Heading"
        },
        {
          "component": "richtext",
          "name": "div:nth-child(1)>div:nth-child(2)",
          "label": "Content",
          "valueType": "string"
        }
      ]
    }
  ],
  "filters": []
}
```

### Step 2: Build the JSON files

Run the build command to merge your models into the root JSON files:

```bash
npm run build:json
```

This runs `merge-json-cli` which:
- Resolves the wildcard pattern `./blocks/*.json#/models`
- Expands all JSON references
- Generates the root-level `component-models.json`, `component-definition.json`, and `component-filters.json`
- These root files are what Universal Editor actually reads

### Step 3: Test

1. Reload Universal Editor
2. Your block should appear in the component picker
3. Insert it and verify fields are editable

## Model Patterns

### Block with Variants

Use `select` with `classes` to add variant classes:

```json
{
  "component": "select",
  "name": "classes",
  "label": "Variant",
  "valueType": "string",
  "options": [
    {
      "name": "Default",
      "value": ""
    },
    {
      "name": "Large",
      "value": "large"
    },
    {
      "name": "Centered",
      "value": "centered"
    }
  ]
}
```

### Boolean Options

Use `boolean` to add optional classes:

```json
{
  "component": "boolean",
  "name": "classes",
  "label": "Dark mode",
  "valueType": "string",
  "value": "dark"
}
```

When checked, adds `dark` class to block.

### Image with Alt Text

```json
{
  "component": "reference",
  "name": "picture>img[src]",
  "label": "Image",
  "multi": false
},
{
  "component": "text",
  "name": "picture>img[alt]",
  "label": "Alt Text",
  "valueType": "string"
}
```

### Container Blocks

For blocks that contain other components:

```json
{
  "definitions": [
    {
      "title": "Container",
      "id": "container",
      "plugins": {
        "da": {
          "name": "container",
          "rows": 1,
          "columns": 0
        }
      },
      "model": "container",
      "filter": "container"
    },
    {
      "title": "Container Item",
      "id": "container-item",
      "plugins": {
        "da": {
          "name": "container-item",
          "rows": 1,
          "columns": 0
        }
      },
      "model": "container-item"
    }
  ],
  "filters": [
    {
      "id": "container",
      "components": [
        "container-item"
      ]
    }
  ]
}
```

### Fragment Blocks

For blocks managed elsewhere (like header/footer):

```json
{
  "definitions": [
    {
      "title": "Header",
      "id": "header",
      "plugins": {
        "da": {
          "unsafeHTML": "<div class=\"header\"><div><div>Header content managed via /nav/header</div></div></div>"
        }
      }
    }
  ],
  "models": [
    {
      "id": "header",
      "fields": [
        {
          "component": "text",
          "name": "div:nth-child(1)>div:nth-child(1)",
          "label": "Note",
          "valueType": "string",
          "value": "Header content is managed via /nav/header",
          "description": "Edit /nav/header to change header content"
        }
      ]
    }
  ]
}
```

## CSS Selector Targeting

The `name` field uses CSS selectors to target elements:

| Pattern | Description | Example |
|---------|-------------|---------|
| `classes` | Adds CSS classes to block element | `"name": "classes"` |
| `div:nth-child(1)` | First div child | `<div><div>...</div></div>` |
| `img[src]` | Image src attribute | `<img src="...">` |
| `a[href]` | Link href attribute | `<a href="...">` |
| `div>p:nth-child(2)` | Second p within div | `<div><p></p><p>...</p></div>` |
| `picture>img:nth-child(3)` | Third child img in picture | For responsive images |

## Best Practices

### 1. Use Descriptive Labels
```json
{
  "label": "Button Text",          // Good
  "label": "Text",                 // Less clear
}
```

### 2. Provide Help Text
```json
{
  "description": "Path to form definition JSON file"
}
```

### 3. Set Sensible Defaults
```json
{
  "value": "Learn more"
}
```

### 4. Use Appropriate Field Types
- `text` for short strings
- `richtext` for formatted content
- `reference` for images/files
- `select` for predefined choices
- `boolean` for toggles

### 5. Mark Required Fields
```json
{
  "required": true
}
```

### 6. Hide Internal Fields
```json
{
  "hidden": true
}
```

## Validation

### Number Ranges
```json
{
  "component": "number",
  "validation": {
    "numberMin": 1,
    "numberMax": 12
  }
}
```

## Testing Models

1. **Validate JSON**: Ensure valid JSON syntax
2. **Test in Universal Editor**: 
   - Can you insert the block?
   - Do all fields appear?
   - Do edits persist?
3. **Verify Output**: Check generated HTML matches expectations
4. **Test Variants**: Verify all select options work
5. **Check Accessibility**: Ensure proper ARIA attributes

## Troubleshooting

### Block Doesn't Appear in Picker
- Check JSON syntax is valid
- Ensure file is in `ue/models/blocks/`
- Verify `definitions` section exists
- Reload Universal Editor

### Fields Don't Update
- Check CSS selectors match actual DOM structure
- Use browser DevTools to verify element paths
- Ensure `name` paths use `:nth-child()` correctly

### Classes Don't Apply
- Use `"name": "classes"` for class additions
- For boolean fields, set `"value": "classname"`
- For select fields, set `"value"` in options

### Images Don't Load
- Use `reference` component type
- Target with `img[src]` for src attribute
- Provide separate field for `img[alt]`

## Resources

- [AEM Universal Editor Documentation](https://experienceleague.adobe.com/docs/experience-manager-cloud-service/content/implementing/developing/universal-editor/introduction.html)
- [USWDS Component Documentation](https://designsystem.digital.gov/components/)
- [Block README files](../../blocks/) - Authoring guidance for each block

## Support

For questions or issues:
1. Check block README in `blocks/blockname/README.md`
2. Review existing models for similar patterns
3. Test in Universal Editor with browser DevTools open
4. Validate JSON syntax

---

**Last Updated**: January 2024
**Model Count**: 35 blocks
**Status**: ✅ Complete for all implemented USWDS components
