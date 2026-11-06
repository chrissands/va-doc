/**
 * Summary Box block - USWDS Summary Box component
 * Transforms simple authored content into USWDS summary box structure
 *
 * @see https://designsystem.digital.gov/components/summary-box/
 */

/**
 * Generate a unique ID for the summary box heading
 * @returns {string} Unique ID
 */
function generateId() {
  return `summary-box-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Add usa-summary-box__link class to all links within an element
 * @param {HTMLElement} element - The element to process
 */
function decorateLinks(element) {
  const links = element.querySelectorAll('a');
  links.forEach((link) => {
    link.classList.add('usa-summary-box__link');
  });
}

/**
 * Decorates a summary box block
 * @param {HTMLElement} block - The summary box block element
 */
export default function decorate(block) {
  // Get the content wrapper (EDS nested structure)
  const contentWrapper = block.querySelector(':scope > div > div');
  if (!contentWrapper) return;

  // Extract all content from the block
  const children = Array.from(contentWrapper.children);

  // Create USWDS summary box structure
  const summaryBox = document.createElement('div');
  summaryBox.className = 'usa-summary-box';
  summaryBox.setAttribute('role', 'region');

  // Create body container
  const body = document.createElement('div');
  body.className = 'usa-summary-box__body';

  // Create text container
  const textContainer = document.createElement('div');
  textContainer.className = 'usa-summary-box__text';

  // Process content
  // First heading becomes the summary box heading
  let headingFound = false;
  const headingId = generateId();

  children.forEach((child) => {
    if (child.matches('h1, h2, h3, h4, h5, h6') && !headingFound) {
      // First heading becomes usa-summary-box__heading
      const heading = child.cloneNode(true);
      heading.className = 'usa-summary-box__heading';
      heading.id = headingId;
      body.appendChild(heading);
      headingFound = true;
    } else if (child.matches('ul, ol')) {
      // Lists get usa-list class and are added to text container
      const list = child.cloneNode(true);
      list.classList.add('usa-list');
      decorateLinks(list);
      textContainer.appendChild(list);
    } else if (child.matches('p')) {
      // Paragraphs are added to text container
      const paragraph = child.cloneNode(true);
      decorateLinks(paragraph);
      textContainer.appendChild(paragraph);
    } else {
      // For any other content, preserve it in the text container
      const content = child.cloneNode(true);
      decorateLinks(content);
      textContainer.appendChild(content);
    }
  });

  // Set aria-labelledby to reference the heading
  if (headingFound) {
    summaryBox.setAttribute('aria-labelledby', headingId);
  }

  // Assemble the summary box
  body.appendChild(textContainer);
  summaryBox.appendChild(body);

  // Replace block content with USWDS structure
  block.textContent = '';
  block.appendChild(summaryBox);

  // Add class to the block itself for any additional styling hooks
  block.classList.add('usa-summary-box-block');
}
