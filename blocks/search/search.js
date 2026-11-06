/**
 * search block
 * Based on USWDS usa-search component (CSS-only)
 *
 * @see https://designsystem.digital.gov/components/search/
 */

/**
 * Decorates the search block into USWDS search component
 * @param {Element} block The search block element
 */
export default function decorate(block) {
  // Clear the block
  block.textContent = '';

  // Create USWDS search form
  const form = document.createElement('form');
  form.className = 'usa-search usa-search--small';
  form.setAttribute('role', 'search');

  // Create label (visually hidden)
  const label = document.createElement('label');
  label.className = 'usa-sr-only';
  label.setAttribute('for', 'search-field-small');
  label.textContent = 'Search';

  // Create input
  const input = document.createElement('input');
  input.className = 'usa-input';
  input.id = 'search-field-small';
  input.type = 'search';
  input.name = 'search';

  // Create submit button
  const button = document.createElement('button');
  button.className = 'usa-button';
  button.type = 'submit';

  // Create icon image
  const icon = document.createElement('img');
  icon.src = '/icons/usa-icons-bg/search--white.svg';
  icon.className = 'usa-search__submit-icon';
  icon.alt = 'Search';

  button.appendChild(icon);

  // Assemble form
  form.appendChild(label);
  form.appendChild(input);
  form.appendChild(button);

  // Add form to block
  block.appendChild(form);

  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchTerm = input.value.trim();
    if (searchTerm) {
      // Redirect to search page with query parameter
      window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
    }
  });
}
