# Carousel

Rows = slides `[image, content]`. Put the section header (eyebrow + H2) as default content above
the block; the H2 labels the carousel region.

Testimonial content: blockquote, **Name** paragraph, role paragraph, list of stats
(`**12 Years** Public Service`). Name and role are overlaid on the image.

Accessibility: `aria-roledescription` carousel / slide, `aria-live=polite`, previous / next
buttons, dot buttons (`aria-current`), slide counter, Arrow Left / Right while focus is inside,
hidden slides are `inert`. No autoplay; the fade is disabled for reduced motion.

## Variants

- `testimonials`: portrait 1/3, quote 2/3 with a decorative quote icon and a stats row.
