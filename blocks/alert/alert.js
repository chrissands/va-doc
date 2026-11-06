/**
 * Alert block - USWDS Alert component
 * Transforms simple authored content into USWDS alert structure
 *
 * @see https://designsystem.digital.gov/components/alert/
 */

/**
 * Decorates an alert block
 * @param {HTMLElement} block - The alert block element
 */
export default function decorate(block) {
  // Get the content wrapper (EDS nested structure)
  const contentWrapper = block.querySelector(':scope > div > div');
  if (!contentWrapper) return;

  // Extract all content from the block
  const children = Array.from(contentWrapper.children);

  // Determine alert type from block classes
  // Default to 'info' if no type specified
  let alertType = 'info';
  const validTypes = ['info', 'warning', 'success', 'error', 'emergency'];
  Array.from(block.classList).forEach((className) => {
    if (validTypes.includes(className)) {
      alertType = className;
    }
  });

  // Check for variant classes
  const isSlim = block.classList.contains('slim');
  const isNoIcon = block.classList.contains('no-icon');

  // Create USWDS alert structure
  const alert = document.createElement('div');
  alert.className = `usa-alert usa-alert--${alertType}`;

  if (isSlim) {
    alert.classList.add('usa-alert--slim');
  }
  if (isNoIcon) {
    alert.classList.add('usa-alert--no-icon');
  }

  // Add appropriate ARIA role based on alert type for accessibility
  // Error and emergency alerts need immediate attention
  if (alertType === 'error' || alertType === 'emergency') {
    alert.setAttribute('role', 'alert');
  } else if (alertType === 'success') {
    alert.setAttribute('role', 'status');
  } else if (alertType === 'info' || alertType === 'warning') {
    // Info and warning use role="region" with aria-labelledby
    alert.setAttribute('role', 'region');
    // Will add aria-labelledby if heading exists (see below)
  }

  // Create alert body
  const body = document.createElement('div');
  body.className = 'usa-alert__body';

  // Process content
  // First heading (if any) becomes the alert heading
  let headingFound = false;
  let headingId = null;
  children.forEach((child) => {
    if (child.matches('h1, h2, h3, h4, h5, h6') && !headingFound) {
      // First heading becomes usa-alert__heading
      const heading = child.cloneNode(true);
      heading.className = 'usa-alert__heading';

      // Generate ID for aria-labelledby (for info and warning alerts)
      if (alertType === 'info' || alertType === 'warning') {
        headingId = `alert-heading-${Math.random().toString(36).substring(2, 9)}`;
        heading.id = headingId;
      }

      body.appendChild(heading);
      headingFound = true;
    } else if (child.matches('p, ul, ol')) {
      // Paragraphs and lists become usa-alert__text
      const text = child.cloneNode(true);
      text.classList.add('usa-alert__text');
      body.appendChild(text);
    } else {
      // For any other content (divs, etc.), wrap in usa-alert__text if it has content
      const textContent = child.textContent.trim();
      if (textContent) {
        const text = document.createElement('p');
        text.className = 'usa-alert__text';
        // Clone all children to preserve links, formatting, etc.
        Array.from(child.childNodes).forEach((node) => {
          text.appendChild(node.cloneNode(true));
        });
        body.appendChild(text);
      }
    }
  });

  // Assemble the alert
  alert.appendChild(body);

  // Add aria-labelledby for info and warning alerts with headings
  if ((alertType === 'info' || alertType === 'warning') && headingId) {
    alert.setAttribute('aria-labelledby', headingId);
  }

  // Replace block content with USWDS structure
  block.textContent = '';
  block.appendChild(alert);

  // Add usa-alert class to the block itself for any additional styling hooks
  block.classList.add('usa-alert-block');
}
