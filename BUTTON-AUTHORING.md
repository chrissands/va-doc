# Button Authoring Guide

This guide explains how to create [USWDS buttons](https://designsystem.digital.gov/components/button/) in your content using simple text formatting.

## How It Works

When you create a link in your document, you can apply text formatting (bold, italic, underline, strikethrough) to control what type of USWDS button appears on your site.

**Important:** Only standalone links (links that are the only content in a paragraph) will become buttons. Links inside regular text remain as regular links.

## Button Variants

### Default Primary Button

**No formatting** or **Bold** formatting creates the standard blue USWDS button.

```
Link text → usa-button (default primary)
**Link text** → usa-button (explicit primary)
```

**Example:**
- Type: "Learn More"
- Make it a link to your page
- Leave it plain OR make it bold
- ✅ Result: Blue primary button

---

### Secondary Button

**Italic** formatting creates a secondary button (red outline).

```
*Link text* → usa-button--secondary
```

**Example:**
- Type: "Learn More"
- Make it a link
- Make it italic
- ✅ Result: Red secondary button

---

### Accent Cool Button

**Bold + Italic** creates an accent-cool button (teal/cyan).

```
***Link text*** → usa-button--accent-cool
```

**Example:**
- Type: "Learn More"
- Make it a link
- Make it bold AND italic
- ✅ Result: Teal accent-cool button

---

### Accent Warm Button

**Bold + Underline** creates an accent-warm button (orange).

```
**Link text** (with underline) → usa-button--accent-warm
```

**Example:**
- Type: "Learn More"
- Make it a link
- Make it bold
- Add underline
- ✅ Result: Orange accent-warm button

---

### Base Color Button

**Strikethrough** creates a base color button (dark gray).

```
~~Link text~~ → usa-button--base
```

**Example:**
- Type: "Learn More"
- Make it a link
- Add strikethrough
- ✅ Result: Dark gray base button

---

### Outline Button

**Underline alone** creates an outline button (transparent with blue border).

```
Link text (underlined) → usa-button--outline
```

**Example:**
- Type: "Learn More"
- Make it a link
- Add underline
- ✅ Result: Blue outline button

---

### Outline Secondary Button

**Italic + Underline** creates an outline secondary button (transparent with red border).

```
*Link text* (with underline) → usa-button--outline usa-button--secondary
```

**Example:**
- Type: "Learn More"
- Make it a link
- Make it italic
- Add underline
- ✅ Result: Red outline button

---

### Big Button

**Bold + Italic + Underline** creates a large button.

```
***Link text*** (with underline) → usa-button--big
```

**Example:**
- Type: "Learn More"
- Make it a link
- Make it bold
- Make it italic
- Add underline
- ✅ Result: Large primary button

---

## Quick Reference Table

| Formatting | USWDS Class | Appearance |
|------------|-------------|------------|
| None or **Bold** | `usa-button` | Blue primary |
| *Italic* | `usa-button--secondary` | Red secondary |
| ***Bold + Italic*** | `usa-button--accent-cool` | Teal accent |
| **Bold** + Underline | `usa-button--accent-warm` | Orange accent |
| ~~Strikethrough~~ | `usa-button--base` | Dark gray |
| Underline | `usa-button--outline` | Blue outline |
| *Italic* + Underline | `usa-button--outline --secondary` | Red outline |
| ***Bold + Italic*** + Underline | `usa-button--big` | Large primary |

## Important Rules

### ✅ DO

- **Make links standalone** - Put the link in its own paragraph
- **Use consistent formatting** - Apply all formatting before publishing
- **Use descriptive text** - "Download Report" not "Click Here"
- **Lead with verbs** - "Submit Application", "View Details"

### ❌ DON'T

- **Don't mix with other text** - Buttons only work as standalone links
- **Don't add images** - Links with images won't become buttons
- **Don't use URL as text** - Links where the text IS the URL won't become buttons
- **Don't over-use** - Too many buttons reduce their effectiveness

## Examples

### Single Button

Create a standalone paragraph with just your link:
```
Submit Application
```
Make it a link and apply bold formatting.

✅ Result: Primary button

### Multiple Buttons

Create separate paragraphs for each button with different formatting:
```
Learn More (plain link)

Download Report (italic link)

Contact Us (bold + italic link)
```
✅ Result: Three different button styles

### Link in Text (NOT a button)

When a link appears inside a sentence:
```
For more information, please visit our homepage or contact support.
```
✅ Result: Regular links in running text stay as regular links

### Button Group

Multiple standalone links in the same paragraph:
```
Cancel (italic link)    Continue (bold link)
```
✅ Result: Multiple buttons in one paragraph create a button group

## Testing Your Buttons

After publishing, check that:
1. ✅ Standalone formatted links become buttons
2. ✅ Links in paragraphs remain as links
3. ✅ Button colors match your formatting choices
4. ✅ Button text is clear and actionable

## Accessibility Tips

- **Use clear, descriptive button text** - Avoid "Click Here" or "Read More" without context
- **Ensure sufficient contrast** - USWDS buttons meet WCAG 2.1 AA standards
- **Test keyboard navigation** - Users should be able to tab to and activate buttons
- **Don't rely on color alone** - Button text should make the action clear

## Related Documentation

- [USWDS Button Component](https://designsystem.digital.gov/components/button/)
- [USWDS Button Accessibility](https://designsystem.digital.gov/components/button/button-accessibility-tests/)
- [Button Patterns (AuthorKit)](https://authorkit.dev/docs/content/buttons)
