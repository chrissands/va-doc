# Card Block

This block implements the [USWDS Card component](https://designsystem.digital.gov/components/card/).

## Usage

Cards display related information in a flexible, scannable format. Multiple adjacent cards in a section are automatically grouped into a `usa-card-group`.

### Basic Card Structure

In your document, create a card block with:
- **Heading** (h2, h3, h4, etc.) - becomes `usa-card__header`
- **Image** (optional) - becomes `usa-card__media`
- **Text content** - becomes `usa-card__body`
- **Call to action link** - becomes `usa-card__footer` with button styling

```
Card
---
Card Title
Lorem ipsum dolor sit amet...
Visit Page (link)
```

### Card with Media

Add an image anywhere in the card content:

```
Card
---
Card with Image
[image]
Lorem ipsum dolor sit amet...
Visit Page (link)
```

### Content Order

The decorator automatically detects element order:

**Default (media then header):**
- Image
- Heading
- Text
- Link

**Header-first (automatically adds `usa-card--header-first`):**
- Heading
- Image
- Text
- Link

## Variants

Add variant classes to the block for different card styles.

### Media Variants

**Inset media** - Image sits inside card padding:
```
Card (inset)
---
[image]
Inset Media
Text content...
```

**Exdent media** - Image extends to card edges:
```
Card (exdent)
---
[image]
Exdent Media
Text content...
```

### Layout Variants

**Flag layout** - Horizontal card with media on left or right:
```
Card (flag)
---
[image]
Default Flag
Text content...
```

**Media right** - Combine with flag for media on right:
```
Card (flag, media-right)
---
[image]
Flag with Media Right
Text content...
```

## Grid Layout

### Default Grid Behavior

Cards automatically get responsive grid classes:
- **Mobile**: Full width (100%)
- **Tablet-lg (1024px+)**: 2 columns (50% width each)
- **Widescreen (1400px+)**: 3 columns (33.333% width each)

### Custom Grid Classes

Override the default by adding your own grid utility classes:

```
Card (tablet-lg:grid-col-4, widescreen:grid-col-3)
---
Card with Custom Grid
This card is 4 columns on tablet-lg, 3 columns on widescreen
```

Available grid classes:
- `tablet-lg:grid-col-6` - 2 columns (50%)
- `tablet-lg:grid-col-4` - 3 columns (33.333%)
- `tablet-lg:grid-col-3` - 4 columns (25%)
- `widescreen:grid-col-6` - 2 columns (50%)
- `widescreen:grid-col-4` - 3 columns (33.333%)
- `widescreen:grid-col-3` - 4 columns (25%)

**Note:** Flag cards don't use grid classes (they use flexbox layout).

## Multiple Cards

Place multiple card blocks in the same section to automatically group them:

```
Card
---
First Card
Content...

Card
---
Second Card
Content...

Card
---
Third Card
Content...
```

This creates a `ul.usa-card-group` containing all cards as `li.usa-card` elements.

## Examples

### Simple Card
```
Card
---
Card Title
Brief description of the card content.
Learn More (link to /page)
```

### Card with Header First
```
Card
---
Header First Card
[image of mountains]
The heading appears above the image automatically.
Explore (link)
```

### Inset Media Card
```
Card (inset)
---
[image]
Inset Media Card
The image has padding around it.
View Details (link)
```

### Flag Card with Media Right
```
Card (flag, media-right)
---
[image]
Flag Layout
This displays as a horizontal card with the image on the right.
Read More (link)
```

## Accessibility

- Use semantic heading levels (h2, h3, h4) appropriate to your page structure
- Provide meaningful alt text for images
- Ensure link text clearly describes the destination
- Maintain adequate color contrast for text

## Technical Details

- **CSS**: `/blocks/card/card.css` (USWDS styles + custom grid utilities)
- **JS**: `/blocks/card/card.js` (Custom EDS decorator)
- **USWDS Component**: `usa-card`

## Related

- [USWDS Card Component](https://designsystem.digital.gov/components/card/)
- [USWDS Grid Utilities](https://designsystem.digital.gov/utilities/layout-grid/)
