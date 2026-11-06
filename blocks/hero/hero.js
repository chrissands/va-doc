/**
 * hero block
 * Based on USWDS usa-hero component
 *
 * @see https://designsystem.digital.gov/components/hero/
 */

/**
 * Decorates the hero block into USWDS hero component
 * @param {Element} block The hero block element
 */
export default function decorate(block) {
  // Get the content elements from the block
  const heading = block.querySelector('h1, h2, h3');
  const paragraph = block.querySelector('p');
  const link = block.querySelector('a');
  const picture = block.querySelector('picture');

  // Clear the block
  block.textContent = '';

  // Add USWDS class directly to the block
  block.classList.add('usa-hero');

  // Create grid container
  const gridContainer = document.createElement('div');
  gridContainer.className = 'grid-container';

  // Create callout box
  const callout = document.createElement('div');
  callout.className = 'usa-hero__callout';

  // Process heading with optional "callout" prefix
  if (heading) {
    const newHeading = document.createElement('h1');
    newHeading.className = 'usa-hero__heading';

    // Check if heading text has a colon (e.g., "Hero callout:Rest of heading")
    const headingText = heading.textContent.trim();
    const colonIndex = headingText.indexOf(':');

    if (colonIndex > 0) {
      // Split into callout prefix and main heading
      const calloutText = headingText.substring(0, colonIndex + 1);
      const mainText = headingText.substring(colonIndex + 1).trim();

      const altSpan = document.createElement('span');
      altSpan.className = 'usa-hero__heading--alt';
      altSpan.textContent = calloutText;

      newHeading.appendChild(altSpan);
      newHeading.appendChild(document.createTextNode(mainText));
    } else {
      // No colon, use entire text as heading
      newHeading.textContent = headingText;
    }

    callout.appendChild(newHeading);
  }

  // Add paragraph
  if (paragraph) {
    const newParagraph = document.createElement('p');
    newParagraph.textContent = paragraph.textContent;
    callout.appendChild(newParagraph);
  }

  // Add call-to-action button
  if (link) {
    const button = document.createElement('a');
    button.className = 'usa-button';
    button.href = link.href;
    button.textContent = link.textContent;
    callout.appendChild(button);
  }

  // Assemble structure
  gridContainer.appendChild(callout);
  block.appendChild(gridContainer);

  // Handle background image if present
  if (picture) {
    // Position picture as background
    picture.classList.add('usa-hero__image');
    block.insertBefore(picture, block.firstChild);
  }
}
