# Summary Box Block

This block implements the [USWDS Summary Box component](https://designsystem.digital.gov/components/summary-box/). A summary box highlights key information from a longer page or displays next steps.

## Basic Usage

In your document authoring platform, create a block table with the name `Summary Box`:

```
| Summary Box |
|-------------|
| Key information |
| - First important point |
| - Second important point |
| - Third important point |
```

This creates a summary box with a heading and a bulleted list of key points.

## When to Use

* **Summarize dense content** - If your page contains a lot of information, use the summary box to call out 3-5 key details that readers shouldn't miss
* **Highlight a short, actionable list** - If the page content describes a few steps or a checklist of items to remember, collect them in a summary box. Use five bullet points or less.

## When to Consider Something Else

* **Internal page navigation** - Don't use a summary box as a table of contents. Use a simple list of jump links or side navigation instead
* **Your page is short** - The summary box gives users quick access to the most important information on a long page. If your page isn't that long, a recap may feel redundant
* **Your list needs more detail** - Summary boxes should be short. Use a process list, graphic list, or icon list in the body of the article when:
  - There are more than five bullet points
  - Bullet points are longer than 20 words
  - Bullet points require a header, image, or button
* **Alerts or callouts** - If you're highlighting something new rather than surfacing details from further down the page, use the [Alert](../alert/) component instead

## Content Structure

### With Bulleted List

```
| Summary Box |
|-------------|
| Key information |
| - If you are under a winter storm warning, find shelter right away. |
| - Sign up for your community's warning system. |
| - Learn the signs of frostbite and hypothermia. |
| - Gather emergency supplies for your home and car. |
```

### With Numbered List

```
| Summary Box |
|-------------|
| Steps to complete |
| 1. Review your application |
| 2. Gather required documents |
| 3. Submit by the deadline |
```

### With Paragraphs

```
| Summary Box |
|-------------|
| Important notice |
| This service will be unavailable during scheduled maintenance. |
| Please complete your work before the maintenance window. |
```

### With Links

Links are automatically styled within the summary box:

```
| Summary Box |
|-------------|
| Next steps |
| - Review our [getting started guide](https://example.com/guide) |
| - Complete the [application form](https://example.com/apply) |
| - Contact [support](mailto:support@example.com) with questions |
```

### Without a Heading

You can omit the heading if your summary box doesn't need one:

```
| Summary Box |
|-------------|
| - Critical point one |
| - Critical point two |
| - Critical point three |
```

## Best Practices

### Select, Split, and Sequence
1. **Select** the most important information from the page
2. **Split** up the information into logical parts
3. **Sequence** the parts in an order that makes sense to the reader

### Link to More Information
- Link to further reading on the same page using anchor links
- Explain where the link will take them in the hyperlinked text
- Use smooth scrolling to show the reader they haven't left the page
- Provide a "back to top" link or sticky navigation

### Keep It Concise
- Use **5 bullet points or less**
- Keep bullet points **under 20 words**
- Use simple, clear language
- Avoid jargon and technical terms

## Examples

### Emergency Preparedness

```
| Summary Box |
|-------------|
| Winter storm safety |
| - If you are under a winter storm warning, [find shelter](#shelter) right away. |
| - Sign up for [your community's warning system](#alerts). |
| - Learn the signs of [frostbite](#frostbite) and [hypothermia](#hypothermia). |
| - Gather emergency supplies for your [home](#home-kit) and [car](#car-kit). |
```

### Application Checklist

```
| Summary Box |
|-------------|
| Before you apply |
| 1. Gather your personal information and documents |
| 2. Review [eligibility requirements](#eligibility) |
| 3. Prepare to answer questions about your background |
| 4. Set aside 30-45 minutes to complete the application |
```

### Service Update

```
| Summary Box |
|-------------|
| System maintenance |
| The application portal will be offline Saturday, February 15 from 8 AM to 12 PM EST. |
| Please save your work and log out before this time. [Learn more about the update](#details). |
```

### Key Takeaways

```
| Summary Box |
|-------------|
| Key takeaways |
| - Applications must be submitted by March 31, 2026 |
| - All applicants will receive a response within 30 days |
| - Incomplete applications cannot be processed |
| - Questions? Contact us at [help@example.gov](mailto:help@example.gov) |
```

## Accessibility

The summary box component automatically adds proper accessibility attributes:

- **`role="region"`** - Identifies the summary box as a landmark region
- **`aria-labelledby`** - Links the region to its heading for screen readers
- **Unique IDs** - Each heading gets a unique ID for proper ARIA labeling

### Accessibility Best Practices

* **Write for your audience** - Check your reading level to ensure it's easy to understand
* **Use clear link text** - Links should make sense out of context
* **Follow proper heading hierarchy** - Don't skip heading levels on your page
* **Ensure sufficient contrast** - The summary box meets WCAG 2.1 AA contrast requirements (4.5:1 minimum)

### When to Test

Always test your implementation to ensure Section 508 compliance, especially:
- Keyboard navigation works properly
- Screen readers announce content correctly
- Links provide clear destination information
- Content is readable at 200% zoom

## Technical Details

### Generated HTML Structure

The block transforms your content into the USWDS summary box structure:

```html
<div class="usa-summary-box" role="region" aria-labelledby="summary-box-abc123">
  <div class="usa-summary-box__body">
    <h4 class="usa-summary-box__heading" id="summary-box-abc123">
      Key information
    </h4>
    <div class="usa-summary-box__text">
      <ul class="usa-list">
        <li>
          First point with <a class="usa-summary-box__link" href="#">link</a>
        </li>
      </ul>
    </div>
  </div>
</div>
```

### Development

- **CSS**: Compiled from USWDS Sass (`usa-summary-box`)
- **JS**: EDS decorator transforms simple content into USWDS structure
- **Accessibility**: WCAG 2.1 AA compliant with proper ARIA attributes

### USWDS Settings

You can customize the summary box appearance in `uswds.config.js`:

- `$theme-summary-box-background-color` - Background color
- `$theme-summary-box-border-color` - Border color
- `$theme-summary-box-border-width` - Border width
- `$theme-summary-box-border-radius` - Border radius
- `$theme-summary-box-font-family` - Font family
- `$theme-summary-box-link-color` - Link color
- `$theme-summary-box-text-color` - Text color

## Related Components

- [USWDS Summary Box Documentation](https://designsystem.digital.gov/components/summary-box/)
- [Alert](../alert/) - For highlighting new information or status messages
- [Process List](../process-list/) - For detailed step-by-step instructions

---

**Note**: This README contains authoring guidelines. The summary box CSS and JavaScript files are protected by `.buildignore` to preserve EDS-specific enhancements.
