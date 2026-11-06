/**
 * banner block
 * Based on USWDS usa-banner component
 *
 * @see https://designsystem.digital.gov/components/banner/
 */

/**
 * Decorates the banner block into USWDS banner component
 * @param {Element} block The banner block element
 */
export default function decorate(block) {
  // Clear the block
  block.textContent = '';

  // Create USWDS banner with accordion wrapper
  const banner = document.createElement('section');
  banner.className = 'usa-banner';
  banner.setAttribute('aria-label', 'Official website of the United States government');

  // Wrap in accordion container for USWDS JS
  const accordion = document.createElement('div');
  accordion.className = 'usa-accordion';
  banner.appendChild(accordion);

  // Create banner header
  const header = document.createElement('div');
  header.className = 'usa-banner__header';
  header.id = 'gov-banner-header-section';
  header.setAttribute('aria-label', 'USA Gov banner section header');

  const container = document.createElement('div');
  container.className = 'usa-banner__inner';

  // Create grid container
  const grid = document.createElement('div');
  grid.className = 'grid-col-auto';

  // Add flag image
  const flagImg = document.createElement('img');
  flagImg.className = 'usa-banner__header-flag';
  flagImg.src = '/icons/us_flag_small.png';
  flagImg.alt = 'U.S. flag';
  flagImg.setAttribute('aria-hidden', 'true');
  grid.appendChild(flagImg);

  container.appendChild(grid);

  // Add text content
  const textGrid = document.createElement('div');
  textGrid.className = 'grid-col-fill tablet:grid-col-auto';

  const text = document.createElement('p');
  text.className = 'usa-banner__header-text';
  text.textContent = 'An official website of the United States government';

  const actionParagraph = document.createElement('p');
  actionParagraph.className = 'usa-banner__header-action';
  actionParagraph.setAttribute('aria-hidden', 'true');
  actionParagraph.textContent = "Here's how you know";

  textGrid.appendChild(text);
  textGrid.appendChild(actionParagraph);
  container.appendChild(textGrid);

  // Add expand button (must be added to container after all grid items for proper positioning)
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'usa-accordion__button usa-banner__button';
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', 'gov-banner-default');

  const actionText = document.createElement('span');
  actionText.className = 'usa-banner__button-text';
  actionText.textContent = "Here's how you know";

  button.appendChild(actionText);
  container.appendChild(button);

  header.appendChild(container);
  accordion.appendChild(header);

  // Create banner content (expandable)
  const content = document.createElement('div');
  content.className = 'usa-banner__content usa-accordion__content';
  content.id = 'gov-banner-default';
  content.setAttribute('hidden', '');

  const contentInner = document.createElement('div');
  contentInner.className = 'grid-row grid-gap-lg';

  // Add .gov section
  const govCol = document.createElement('div');
  govCol.className = 'usa-banner__guidance tablet:grid-col-6';

  const govIcon = document.createElement('img');
  govIcon.className = 'usa-banner__icon usa-media-block__img';
  govIcon.src = '/icons/icon-dot-gov.svg';
  govIcon.role = 'img';
  govIcon.alt = '';
  govIcon.setAttribute('aria-hidden', 'true');

  const govMedia = document.createElement('div');
  govMedia.className = 'usa-media-block__body';

  const govHeading = document.createElement('p');
  const govStrong = document.createElement('strong');
  govStrong.textContent = 'Official websites use .gov';
  govHeading.appendChild(govStrong);

  const govText = document.createElement('p');
  govText.innerHTML = 'A <strong>.gov</strong> website belongs to an official government organization in the United States.';

  govMedia.appendChild(govHeading);
  govMedia.appendChild(govText);

  govCol.appendChild(govIcon);
  govCol.appendChild(govMedia);
  contentInner.appendChild(govCol);

  // Add HTTPS section
  const httpsCol = document.createElement('div');
  httpsCol.className = 'usa-banner__guidance tablet:grid-col-6';

  const httpsIcon = document.createElement('img');
  httpsIcon.className = 'usa-banner__icon usa-media-block__img';
  httpsIcon.src = '/icons/icon-https.svg';
  httpsIcon.role = 'img';
  httpsIcon.alt = '';
  httpsIcon.setAttribute('aria-hidden', 'true');

  const httpsMedia = document.createElement('div');
  httpsMedia.className = 'usa-media-block__body';

  const httpsHeading = document.createElement('p');
  const httpsStrong = document.createElement('strong');
  httpsStrong.textContent = 'Secure .gov websites use HTTPS';
  httpsHeading.appendChild(httpsStrong);

  const httpsText = document.createElement('p');
  const lockSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="52" height="64" viewBox="0 0 52 64" class="usa-banner__lock-image" role="img" aria-labelledby="banner-lock-description" focusable="false"><title id="banner-lock-description">Lock</title><desc>Locked padlock icon</desc><path fill="#000000" fill-rule="evenodd" d="M26 0c10.493 0 19 8.507 19 19v9h3a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V32a4 4 0 0 1 4-4h3v-9C7 8.507 15.507 0 26 0zm0 8c-5.979 0-10.843 4.77-10.996 10.712L15 19v9h22v-9c0-6.075-4.925-11-11-11z"/></svg>';
  httpsText.innerHTML = `A <strong>lock</strong> (<span class="icon-lock">${lockSvg}</span>) or <strong>https://</strong> means you've safely connected to the .gov website. Share sensitive information only on official, secure websites.`;

  httpsMedia.appendChild(httpsHeading);
  httpsMedia.appendChild(httpsText);

  httpsCol.appendChild(httpsIcon);
  httpsCol.appendChild(httpsMedia);
  contentInner.appendChild(httpsCol);

  content.appendChild(contentInner);
  accordion.appendChild(content);

  // Add banner to block
  block.appendChild(banner);
}
