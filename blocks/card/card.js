/**
 * card block
 * Based on USWDS usa-card component
 *
 * @see https://designsystem.digital.gov/components/card/
 */

/**
 * Decorates an individual card element and returns the new card
 * @param {Element} block The card block element
 * @returns {Element} The decorated card element
 */
function decorateCard(block) {
  // Convert block to li.usa-card
  const card = document.createElement('li');
  card.className = 'usa-card';

  // Transfer utility classes and variant classes from block to card
  const blockClasses = Array.from(block.classList);
  let hasGridClasses = false;
  let isFlag = false;

  blockClasses.forEach((cls) => {
    // Skip 'card' and 'block' classes, transfer everything else
    if (cls !== 'card' && cls !== 'block') {
      // Check if this is a grid class
      if (cls.includes('grid-col')) {
        hasGridClasses = true;
      }

      // Check if it's a variant class
      if (cls === 'flag' || cls === 'header-first' || cls === 'media-right') {
        card.classList.add(`usa-card--${cls}`);
        if (cls === 'flag') {
          isFlag = true;
        }
      } else {
        // Transfer utility classes (grid, flex, etc.) as-is
        card.classList.add(cls);
      }
    }
  });

  // Add default grid classes if none were specified and it's not a flag card
  if (!hasGridClasses && !isFlag) {
    card.classList.add('tablet-lg:grid-col-6', 'widescreen:grid-col-4');
  }

  // Create card container
  const container = document.createElement('div');
  container.className = 'usa-card__container';

  // Parse block content - EDS blocks have nested wrapper divs
  // Structure: block > div > div > [actual content elements]
  const contentWrapper = block.querySelector(':scope > div > div');
  if (!contentWrapper) {
    return card; // No content found
  }

  const children = Array.from(contentWrapper.children);

  // Detect content order for automatic variants
  let headingIndex = -1;
  let mediaIndex = -1;

  children.forEach((child, index) => {
    if (child.matches('h1, h2, h3, h4, h5, h6')) {
      headingIndex = index;
    } else if (child.querySelector('img, picture')) {
      mediaIndex = index;
    }
  });

  // If heading comes before media, add header-first variant
  if (headingIndex !== -1 && mediaIndex !== -1 && headingIndex < mediaIndex) {
    card.classList.add('usa-card--header-first');
  }

  children.forEach((child) => {
    // Detect content type and create appropriate card sections
    if (child.matches('h1, h2, h3, h4, h5, h6')) {
      // Header section - child IS the heading
      const header = document.createElement('div');
      header.className = 'usa-card__header';

      const cardHeading = child.cloneNode(true);
      cardHeading.className = 'usa-card__heading';

      header.appendChild(cardHeading);
      container.appendChild(header);
    } else if (child.querySelector('img, picture')) {
      // Media section
      const media = document.createElement('div');
      media.className = 'usa-card__media';

      // Check for media variants on the block itself
      if (block.classList.contains('inset')) {
        media.classList.add('usa-card__media--inset');
      } else if (block.classList.contains('exdent')) {
        media.classList.add('usa-card__media--exdent');
      }

      const imgWrapper = document.createElement('div');
      imgWrapper.className = 'usa-card__img';

      // Handle both img and picture elements
      const picture = child.querySelector('picture');
      const img = child.querySelector('img');

      if (picture) {
        // Clone the entire picture element (includes sources and img)
        imgWrapper.appendChild(picture.cloneNode(true));
      } else if (img) {
        // Just clone the img
        imgWrapper.appendChild(img.cloneNode(true));
      }

      media.appendChild(imgWrapper);
      container.appendChild(media);
    } else if (child.querySelector('a')) {
      // Footer section (links/buttons)
      const footer = document.createElement('div');
      footer.className = 'usa-card__footer';

      // Check for exdent variant
      if (child.classList.contains('exdent')) {
        footer.classList.add('usa-card__footer--exdent');
      }

      const link = child.querySelector('a');
      if (link) {
        const button = link.cloneNode(true);
        // Preserve existing button classes if they exist, otherwise default to usa-button
        if (!button.classList.contains('usa-button')) {
          button.className = 'usa-button';
        }
        footer.appendChild(button);
      }

      container.appendChild(footer);
    } else if (child.textContent.trim()) {
      // Body section (default for text content)
      const body = document.createElement('div');
      body.className = 'usa-card__body';

      // Check for exdent variant
      if (child.classList.contains('exdent')) {
        body.classList.add('usa-card__body--exdent');
      }

      body.innerHTML = child.innerHTML;
      container.appendChild(body);
    }
  });

  card.appendChild(container);

  // Return the decorated card (caller will handle DOM replacement)
  return card;
}

/**
 * Decorates a single card block into USWDS structure
 * @param {Element} block The card block element
 */
export default function decorate(block) {
  // Find parent section to check for adjacent cards
  const section = block.closest('.section');

  // Check if this card is already wrapped in a card group or has no parent
  if (!block.parentElement || block.parentElement.classList.contains('usa-card-group')) {
    return; // Already processed as part of a group or removed from DOM
  }

  // Find all card blocks in this section
  const cardsInSection = section ? Array.from(section.querySelectorAll('.card.block')) : [block];

  // If multiple cards, wrap them in a group
  if (cardsInSection.length > 1) {
    // Create card group wrapper
    const cardGroup = document.createElement('ul');
    cardGroup.className = 'usa-card-group';

    // Insert card group before the first card
    cardsInSection[0].parentElement.insertBefore(cardGroup, cardsInSection[0]);

    // Decorate each card block and add to group
    cardsInSection.forEach((cardBlock) => {
      const decoratedCard = decorateCard(cardBlock);
      cardGroup.appendChild(decoratedCard);
      cardBlock.remove(); // Remove the original block
    });
  } else {
    // Single card - decorate and replace
    const decoratedCard = decorateCard(block);
    block.replaceWith(decoratedCard);
  }
}
