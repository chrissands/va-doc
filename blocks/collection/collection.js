/**
 * Collection block - USWDS Collection component
 * Transforms simple authored content into USWDS collection structure
 *
 * @see https://designsystem.digital.gov/components/collection/
 */

/**
 * Parse metadata from a paragraph (e.g., "By: Author Name", "Date: 2024-01-27")
 * @param {string} text - The text to parse
 * @returns {object} Parsed metadata
 */
function parseMetadata(text) {
  const byMatch = text.match(/^By:?\s*(.+)/i);
  const dateMatch = text.match(/^Date:?\s*(.+)/i);
  const tagsMatch = text.match(/^Tags?:?\s*(.+)/i);

  let type = null;
  if (byMatch) type = 'by';
  else if (dateMatch) type = 'date';
  else if (tagsMatch) type = 'tags';

  return {
    isMetadata: !!(byMatch || dateMatch || tagsMatch),
    type,
    value: byMatch?.[1] || dateMatch?.[1] || tagsMatch?.[1] || text,
  };
}

/**
 * Create metadata list items
 * @param {string} type - Type of metadata (by, date, tags)
 * @param {string} value - The metadata value
 * @returns {Array} Array of li elements
 */
function createMetaItems(type, value) {
  const items = [];

  if (type === 'tags') {
    // Split tags by comma and create tag elements
    const tags = value.split(',').map((tag) => tag.trim()).filter((tag) => tag);
    tags.forEach((tag) => {
      const li = document.createElement('li');
      li.className = 'usa-collection__meta-item usa-tag';
      li.textContent = tag;
      items.push(li);
    });
  } else if (type === 'date') {
    // Create time element for dates
    const li = document.createElement('li');
    li.className = 'usa-collection__meta-item';
    const time = document.createElement('time');
    // Try to parse date for datetime attribute
    const dateObj = new Date(value);
    if (!Number.isNaN(dateObj.getTime())) {
      time.setAttribute('datetime', dateObj.toISOString());
    }
    time.textContent = value;
    li.appendChild(time);
    items.push(li);
  } else {
    // Regular metadata item
    const li = document.createElement('li');
    li.className = 'usa-collection__meta-item';
    li.textContent = value;
    items.push(li);
  }

  return items;
}

/**
 * Decorates a collection block
 * @param {HTMLElement} block - The collection block element
 */
export default function decorate(block) {
  // Check for condensed variant
  const isCondensed = block.classList.contains('condensed');

  // Create the collection list
  const collection = document.createElement('ul');
  collection.className = 'usa-collection';
  if (isCondensed) {
    collection.classList.add('usa-collection--condensed');
  }

  // Get all rows from the block (each row is a collection item)
  const rows = Array.from(block.children);

  rows.forEach((row) => {
    const cells = Array.from(row.children);
    if (cells.length === 0) return;

    // Create collection item
    const item = document.createElement('li');
    item.className = 'usa-collection__item';

    // Get content from first cell
    const content = cells[0];
    const children = Array.from(content.children);

    // Extract components
    let image = null;
    let heading = null;
    const descriptions = [];
    const metadata = [];
    const tags = [];

    children.forEach((child) => {
      if (child.querySelector('img, picture')) {
        // Image
        const img = child.querySelector('img');
        if (img) {
          image = document.createElement('img');
          image.className = 'usa-collection__img';
          image.src = img.src;
          image.alt = img.alt || '';
        }
      } else if (child.matches('h1, h2, h3, h4, h5, h6') && !heading) {
        // First heading
        heading = child;
      } else if (child.matches('p')) {
        // Could be description or metadata
        const text = child.textContent.trim();
        const meta = parseMetadata(text);

        if (meta.isMetadata) {
          if (meta.type === 'tags') {
            tags.push(meta.value);
          } else {
            metadata.push(meta);
          }
        } else if (text) {
          descriptions.push(child);
        }
      }
    });

    // Add image if present
    if (image) {
      item.appendChild(image);
    }

    // Create body container
    const body = document.createElement('div');
    body.className = 'usa-collection__body';

    // Add heading with link
    if (heading) {
      const collectionHeading = document.createElement('h4');
      collectionHeading.className = 'usa-collection__heading';

      const link = heading.querySelector('a');
      if (link) {
        const headingLink = document.createElement('a');
        headingLink.className = 'usa-link';
        headingLink.href = link.href;
        headingLink.textContent = link.textContent;
        collectionHeading.appendChild(headingLink);
      } else {
        collectionHeading.textContent = heading.textContent;
      }

      body.appendChild(collectionHeading);
    }

    // Add description
    descriptions.forEach((desc) => {
      const description = document.createElement('p');
      description.className = 'usa-collection__description';
      description.textContent = desc.textContent;
      body.appendChild(description);
    });

    // Add metadata list
    if (metadata.length > 0) {
      const metaList = document.createElement('ul');
      metaList.className = 'usa-collection__meta';
      metaList.setAttribute('aria-label', 'More information');

      metadata.forEach((meta) => {
        const items = createMetaItems(meta.type, meta.value);
        items.forEach((metaItem) => metaList.appendChild(metaItem));
      });

      body.appendChild(metaList);
    }

    // Add tags list
    if (tags.length > 0) {
      const tagsList = document.createElement('ul');
      tagsList.className = 'usa-collection__meta';
      tagsList.setAttribute('aria-label', 'Topics');

      tags.forEach((tagString) => {
        const items = createMetaItems('tags', tagString);
        items.forEach((tagItem) => tagsList.appendChild(tagItem));
      });

      body.appendChild(tagsList);
    }

    item.appendChild(body);
    collection.appendChild(item);
  });

  // Replace block content
  block.textContent = '';
  block.appendChild(collection);

  // Add class for styling hooks
  block.classList.add('usa-collection-block');
}
