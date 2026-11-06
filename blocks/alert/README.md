# Alert Block

This block implements the [USWDS Alert component](https://designsystem.digital.gov/components/alert/). An alert keeps users informed of important and sometimes time-sensitive changes.

## Basic Usage

In your document authoring platform, create a block table with the name `Alert`:

```
| Alert |
|-------|
| Heading |
| Body text with important information. |
```

This creates a default **informative** alert with a heading and body text.

## Alert Types

Add a class to the block to specify the alert type. Choose from:

- **info** (default) - General informational messages
- **warning** - Warning messages that need attention
- **success** - Success confirmations
- **error** - Error messages requiring action
- **emergency** - Urgent emergency alerts

### Example: Success Alert

```
| Alert (success) |
|-----------------|
| Success heading |
| Your application was submitted successfully. |
```

### Example: Error Alert

```
| Alert (error) |
|---------------|
| Error heading |
| There was a problem processing your request. |
```

## Variants

### Slim Alert

Add the `slim` class for a more compact alert without a heading:

```
| Alert (info, slim) |
|--------------------|
| Brief informational message. |
```

### Alert Without Icon

Add the `no-icon` class to remove the status icon:

```
| Alert (info, no-icon) |
|------------------------|
| Heading |
| Message without an icon. |
```

### Combining Variants

```
| Alert (warning, slim, no-icon) |
|-------------------------------|
| Warning message without heading or icon. |
```

## Content Structure

### With Heading

```
| Alert (type) |
|--------------|
| Alert Heading |
| Body text here. Can include links and formatting. |
| Additional paragraphs if needed. |
```

The first heading in the alert becomes the `usa-alert__heading`.

### Without Heading (Slim)

```
| Alert (info, slim) |
|--------------------|
| Just body text, no heading. |
```

### With Links

Links are automatically styled within alerts:

```
| Alert (info) |
|--------------|
| Information |
| Learn more at [our help center](https://example.com). |
```

### Multiple Paragraphs

```
| Alert (warning) |
|-----------------|
| Warning |
| This is the first paragraph of the warning. |
| This is a second paragraph with more details. |
```

## Accessibility

The alert component automatically adds appropriate ARIA roles based on alert type:

- **Error and Emergency alerts**: `role="alert"` - Demands immediate attention from assistive technologies
- **Success alerts**: `role="status"` - Provides advisory information
- **Info and Warning alerts**: `role="region"` with `aria-labelledby` - Allows users to find important information without interrupting workflow

### Best Practices

- **Write clear, concise messages** - Use plain language
- **Be polite** - Don't blame the user for errors
- **Provide next steps** - Tell users what to do
- **Don't overdo it** - Too many alerts will be ignored
- **Consider context** - Only show alerts relevant to the current task

### When to Use

- **System status messages** - Keep users informed of system status
- **Validation messages** - Inform users of errors or confirmations
- **Important updates** - Time-sensitive or critical information

### When to Consider Something Else

- **Long forms** - Use inline validation in addition to alerts
- **Destructive actions** - Use a modal dialog for confirmation
- **Dismissible notifications** - USWDS is working on dismissible alerts

## Examples

### Standard Informative Alert

```
| Alert |
|-------|
| Information |
| This is general information you should know. |
```

### Warning with Multiple Paragraphs

```
| Alert (warning) |
|-----------------|
| Important Warning |
| This action cannot be undone. |
| Please review your information before proceeding. |
```

### Success Confirmation

```
| Alert (success) |
|-----------------|
| Success! |
| Your profile has been updated. |
```

### Error Message

```
| Alert (error) |
|---------------|
| Error |
| Your session has expired. Please [log in again](/login). |
```

### Emergency Alert

```
| Alert (emergency) |
|-------------------|
| Emergency Maintenance |
| The system will be unavailable from 2-4 PM for emergency maintenance. |
```

### Slim Info Alert

```
| Alert (info, slim) |
|--------------------|
| Quick tip: Save your work frequently. |
```

## Technical Details

### Generated HTML Structure

The block transforms your content into the USWDS alert structure:

```html
<div class="usa-alert usa-alert--info">
  <div class="usa-alert__body">
    <h4 class="usa-alert__heading">Heading</h4>
    <p class="usa-alert__text">Body text here.</p>
  </div>
</div>
```

### Development

- **CSS**: Compiled from USWDS Sass (`usa-alert`)
- **JS**: EDS decorator transforms simple content into USWDS structure
- **Accessibility**: WCAG 2.1 AA compliant with proper ARIA roles

## Related Components

- [USWDS Alert Documentation](https://designsystem.digital.gov/components/alert/)
- [Banner](../banner/) - For government site identification
- [Hero](../hero/) - For prominent page headers

---

**Note**: This README contains authoring guidelines. The alert CSS and JavaScript files are protected by `.buildignore` to preserve EDS-specific enhancements.
