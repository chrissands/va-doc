# Collection Block

This block implements the [USWDS Collection component](https://designsystem.digital.gov/components/collection/). A collection displays a compact list of multiple related items like articles or events. The list links each item to its original source.

## Basic Usage

In your document authoring platform, create a block table with the name `Collection`. Each row represents one item in the collection:

```
| Collection |
|------------|
| ### [Article Title](https://example.com/article) |
| This is a short description of the article content. |
| By: John Doe |
| Date: January 27, 2024 |
| Tags: News, Update, Important |
```

## When to Use

* **Feature content with metadata** - Display content with limited metadata like tags, date/time, or source
* **Group related content** - Provide links to articles, guides, or resources
* **Collect from multiple sources** - Guide users to resources from different locations
* **Limit to 6 or fewer items** - Collections work best with a small number of focused items

## When to Consider Something Else

* **Large content archives** - Use a separate index or archive page for browsing many items
* **Large images or media** - Use the [Card component](../card/) for bigger images and media
* **In-component scrolling needed** - Display all items without forcing scrolling within the component

## Content Structure

### Basic Item

Each collection item can include:

```
| Collection |
|------------|
| ### [Article Title](https://example.com) |
| Brief description of the article. |
| By: Author Name |
| Date: January 27, 2024 |
| Tags: Topic1, Topic2 |
```

**Components:**
1. **Heading with link** (required) - Use h3 (`###`) with a link
2. **Description** (optional) - One or more paragraphs
3. **Metadata** (optional) - Lines starting with "By:" or "Date:"
4. **Tags** (optional) - Line starting with "Tags:" (comma-separated)

### With Thumbnail Image

Add an image before the heading:

```
| Collection |
|------------|
| ![Article thumbnail](https://example.com/image.jpg) |
| ### [Article Title](https://example.com) |
| Description text here. |
| By: Jane Smith |
| Date: January 27, 2024 |
```

### Multiple Items

Add multiple rows for multiple collection items:

```
| Collection |
|------------|
| ### [First Article](https://example.com/1) |
| Description of first article. |
| By: John Doe |
| Date: January 27, 2024 |
| Tags: News, Update |
|  |
| ### [Second Article](https://example.com/2) |
| Description of second article. |
| By: Jane Smith |
| Date: January 26, 2024 |
| Tags: Research, Data |
```

## Variants

### Condensed

Add the `condensed` class for tighter spacing:

```
| Collection (condensed) |
|------------------------|
| ### [First Item](https://example.com/1) |
| ### [Second Item](https://example.com/2) |
| ### [Third Item](https://example.com/3) |
```

This variant is useful for simple lists without descriptions or metadata.

## Examples

### Default Collection

```
| Collection |
|------------|
| ### [Gears of Government President's Award winners](https://performance.gov/awards) |
| Today, the Administration announces the winners of the Gears of Government President's Award. This program recognizes the contributions of individuals and teams across the federal workforce. |
| By: Sondra Ainsworth and Constance Lu |
| Date: September 30, 2020 |
| Tags: New, PMA, OMB |
|  |
| ### [Women-owned small business dashboard](https://sba.gov/wosb) |
| In honor of National Women's Small Business Month, we've partnered with SBA to highlight the Women-Owned Small Businesses (WOSBs) data dashboard! |
| By: Constance Lu |
| Date: September 30, 2020 |
| Tags: SBA |
```

### With Media Thumbnails

```
| Collection |
|------------|
| ![Government awards logo](https://example.com/award-logo.png) |
| ### [Gears of Government President's Award winners](https://performance.gov/awards) |
| Today, the Administration announces the winners of the Gears of Government President's Award. |
| By: Sondra Ainsworth and Constance Lu |
| Date: September 30, 2020 |
| Tags: New, PMA, OMB |
|  |
| ![Dashboard screenshot](https://example.com/dashboard.jpg) |
| ### [Women-owned small business dashboard](https://sba.gov/wosb) |
| In honor of National Women's Small Business Month, we highlight the WOSB data dashboard! |
| By: Constance Lu |
| Date: September 30, 2020 |
| Tags: SBA |
```

### Headings Only (Condensed)

```
| Collection (condensed) |
|------------------------|
| ### [The eight principles of mobile-friendliness](https://digital.gov/mobile) |
| ### [The USWDS maturity model](https://designsystem.digital.gov/maturity-model/) |
| ### [A news item on our site](#news) |
```

### With External Links

```
| Collection |
|------------|
| ### [External Resource](https://external-site.com) |
| This link goes to an external website. |
| By: External Author |
```

**Note:** Consider adding visual indicators for external links per USWDS guidance.

## Metadata Format

### By Line

Starts with "By:" followed by author name(s):

```
By: Author Name
By: First Author and Second Author
```

### Date

Starts with "Date:" followed by date in any recognizable format:

```
Date: January 27, 2024
Date: 2024-01-27
Date: Jan 27, 2024
Date: September 30, 2020
```

The component will attempt to parse dates and add proper `<time>` elements with `datetime` attributes.

### Tags

Starts with "Tags:" or "Tag:" followed by comma-separated values:

```
Tags: News, Update, Important
Tags: Research
Tag: Single Topic
```

Each tag becomes a styled `usa-tag` element.

## Best Practices

### Content

* **Use clear, unique headings** - Each heading should be concise and descriptive
* **Limit items** - Keep collections to 6 or fewer items for scannability
* **Be consistent** - If using images, use them for all items
* **Provide context** - Use descriptions and metadata to help users decide what to click
* **Avoid "Read more"** - Let headings themselves be the call to action

### Images

* **Use consistent widths** - All thumbnails should be the same width
* **Choose meaningful images** - Icons/illustrations should add value
* **Avoid placeholders** - Don't repeat generic placeholder images

### Metadata

* **Use descriptive titles** - Collection title should explain the theme (e.g., "Recent posts")
* **Link to archives** - If there are more items, link to a comprehensive index
* **Indicate external links** - Make it clear when links leave your site
* **Provide strong "scent"** - Help users understand value before clicking

## Accessibility

The collection component follows USWDS accessibility standards:

* **Uses semantic list markup** - `<ul>` for collection, `<li>` for items
* **Screen reader enumeration** - Assistive tech can count and navigate items
* **Unique link names** - Each link should be distinguishable
* **Proper heading levels** - Update heading levels based on page outline
* **Metadata labels** - `aria-label` attributes on metadata lists

### Heading Levels

The component uses `<h4>` for collection item headings. Adjust your page structure so collection headings fit the logical outline:

* If your page heading is `<h1>`, section headings are `<h2>`, and subsections are `<h3>`, then collection items at `<h4>` fit correctly
* If collections appear at a different level, you may need to update the component or page structure

### Link Uniqueness

Ensure each link in a collection has a unique, descriptive name:
- ✅ Good: "Guide to mobile design", "Process for form validation"
- ❌ Bad: "Read more", "Click here", "Learn more"

## Technical Details

### Generated HTML Structure

The block transforms your content into the USWDS collection structure:

```html
<ul class="usa-collection">
  <li class="usa-collection__item">
    <img class="usa-collection__img" src="..." alt="...">
    <div class="usa-collection__body">
      <h4 class="usa-collection__heading">
        <a class="usa-link" href="...">Heading</a>
      </h4>
      <p class="usa-collection__description">
        Description text.
      </p>
      <ul class="usa-collection__meta" aria-label="More information">
        <li class="usa-collection__meta-item">By Author</li>
        <li class="usa-collection__meta-item">
          <time datetime="...">Date</time>
        </li>
      </ul>
      <ul class="usa-collection__meta" aria-label="Topics">
        <li class="usa-collection__meta-item usa-tag">Tag1</li>
        <li class="usa-collection__meta-item usa-tag">Tag2</li>
      </ul>
    </div>
  </li>
</ul>
```

### Development

- **CSS**: Compiled from USWDS Sass (`usa-collection`)
- **JS**: EDS decorator transforms simple content into USWDS structure
- **Accessibility**: WCAG 2.1 AA compliant

## Related Components

- [USWDS Collection Documentation](https://designsystem.digital.gov/components/collection/)
- [Card](../card/) - For larger images and more prominent display
- [Summary Box](../summary-box/) - For highlighting key information

---

**Note**: This README contains authoring guidelines. The collection CSS and JavaScript files are protected by `.buildignore` to preserve EDS-specific enhancements.
