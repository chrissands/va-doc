/**
 * footer block
 * Based on USWDS usa-footer component
 *
 * @see https://designsystem.digital.gov/components/footer/
 */

import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Decorates the secondary section (logo, social, contact)
 * @param {Element} footer The footer element
 * @param {Element} logoSection Logo content section
 * @param {Element} socialSection Social links section
 * @param {Element} contactSection Contact info section
 * @param {boolean} isSlim Whether this is a slim footer
 */
function decorateSecondarySection(footer, logoSection, socialSection, contactSection, isSlim) {
  const secondarySection = document.createElement('div');
  secondarySection.className = 'usa-footer__secondary-section';

  const container = document.createElement('div');
  container.className = 'grid-container';

  const row = document.createElement('div');
  row.className = isSlim ? 'usa-footer__logo grid-row grid-gap-2' : 'grid-row grid-gap';

  if (!isSlim) {
    // Logo section (6 columns)
    const logoCol = document.createElement('div');
    logoCol.className = 'usa-footer__logo grid-row mobile-lg:grid-col-6 mobile-lg:grid-gap-2';

    if (logoSection) {
      const img = logoSection.querySelector('img');
      if (img) {
        const imgCol = document.createElement('div');
        imgCol.className = 'mobile-lg:grid-col-auto';
        const logoImg = document.createElement('img');
        logoImg.className = 'usa-footer__logo-img';
        logoImg.src = img.src;
        logoImg.alt = img.alt || '';
        imgCol.appendChild(logoImg);
        logoCol.appendChild(imgCol);
      }

      // Look for text - prioritize headings, skip empty paragraphs with images
      let textContent = '';
      // Try headings first
      const headingEl = logoSection.querySelector('h1, h2, h3, h4, h5, h6');
      if (headingEl) {
        textContent = headingEl.textContent.trim();
      } else {
        // Try other text elements, but filter out ones that only contain images
        const textElements = Array.from(logoSection.querySelectorAll('p, strong, em, span'));
        const validTextEl = textElements.find((el) => {
          const text = el.textContent.trim();
          // Skip elements that are empty or only contain an image
          return text && !el.querySelector('img, picture');
        });

        if (validTextEl) {
          textContent = validTextEl.textContent.trim();
        } else {
          // Final fallback: get text directly from the section, excluding images
          const clone = logoSection.cloneNode(true);
          const cloneImgs = clone.querySelectorAll('img, picture');
          cloneImgs.forEach((imgEl) => imgEl.remove());
          textContent = clone.textContent.trim();
        }
      }

      if (textContent) {
        const textCol = document.createElement('div');
        textCol.className = 'mobile-lg:grid-col-auto';
        const heading = document.createElement('p');
        heading.className = 'usa-footer__logo-heading';
        heading.textContent = textContent;
        textCol.appendChild(heading);
        logoCol.appendChild(textCol);
      }
    }

    row.appendChild(logoCol);

    // Contact links section (6 columns)
    const contactCol = document.createElement('div');
    contactCol.className = 'usa-footer__contact-links mobile-lg:grid-col-6';

    // Social links
    if (socialSection) {
      const socialDiv = document.createElement('div');
      socialDiv.className = 'usa-footer__social-links grid-row grid-gap-1';

      socialSection.querySelectorAll('a').forEach((link) => {
        const col = document.createElement('div');
        col.className = 'grid-col-auto';

        const a = document.createElement('a');
        a.className = 'usa-social-link';
        a.href = link.href;

        const img = document.createElement('img');
        img.className = 'usa-social-link__icon';
        // Extract social network from link text or use generic icon
        const network = link.textContent.trim().toLowerCase();
        img.src = `/icons/usa-icons/${network}.svg`;
        img.alt = link.textContent;

        a.appendChild(img);
        col.appendChild(a);
        socialDiv.appendChild(col);
      });

      contactCol.appendChild(socialDiv);
    }

    // Contact heading and info
    if (contactSection) {
      const contactHeading = contactSection.querySelector('h3, h4, p, strong');
      if (contactHeading) {
        const heading = document.createElement('p');
        heading.className = 'usa-footer__contact-heading';
        heading.textContent = contactHeading.textContent;
        contactCol.appendChild(heading);
      }

      const address = document.createElement('address');
      address.className = 'usa-footer__address';

      const contactRow = document.createElement('div');
      contactRow.className = 'usa-footer__contact-info grid-row grid-gap';

      contactSection.querySelectorAll('a').forEach((link) => {
        const col = document.createElement('div');
        col.className = 'grid-col-auto';

        const a = document.createElement('a');
        a.href = link.href;
        a.textContent = link.textContent;

        col.appendChild(a);
        contactRow.appendChild(col);
      });

      address.appendChild(contactRow);
      contactCol.appendChild(address);
    }

    row.appendChild(contactCol);
  } else if (logoSection) {
    // Slim footer: just logo
    const logoCol = document.createElement('div');
    logoCol.className = 'mobile-lg:grid-col-auto';

    const img = logoSection.querySelector('img');
    if (img) {
      const logoImg = document.createElement('img');
      logoImg.className = 'usa-footer__logo-img';
      logoImg.src = img.src;
      logoImg.alt = img.alt || '';
      logoCol.appendChild(logoImg);
    }

    // Look for text - prioritize headings, skip empty paragraphs with images
    let textContent = '';
    // Try headings first
    const headingEl = logoSection.querySelector('h1, h2, h3, h4, h5, h6');
    if (headingEl) {
      textContent = headingEl.textContent.trim();
    } else {
      // Try other text elements, but filter out ones that only contain images
      const textElements = Array.from(logoSection.querySelectorAll('p, strong, em, span'));
      const validTextEl = textElements.find((el) => {
        const text = el.textContent.trim();
        // Skip elements that are empty or only contain an image
        return text && !el.querySelector('img, picture');
      });

      if (validTextEl) {
        textContent = validTextEl.textContent.trim();
      } else {
        // Final fallback: get text directly from the section, excluding images
        const clone = logoSection.cloneNode(true);
        const cloneImgs = clone.querySelectorAll('img, picture');
        cloneImgs.forEach((imgEl) => imgEl.remove());
        textContent = clone.textContent.trim();
      }
    }

    if (textContent) {
      const heading = document.createElement('p');
      heading.className = 'usa-footer__logo-heading';
      heading.textContent = textContent;
      logoCol.appendChild(heading);
    }

    row.appendChild(logoCol);
  }

  container.appendChild(row);
  secondarySection.appendChild(container);
  footer.appendChild(secondarySection);
}

/**
 * Decorates big footer variant
 * @param {Element} footer The footer element
 * @param {NodeList} sections The content sections
 */
async function decorateBigFooter(footer, sections) {
  // Section 0: Multi-column navigation (topics with secondary links)
  // Section 1: Newsletter signup content
  // Section 2: Logo/Agency info
  // Section 3: Social links
  // Section 4: Contact info

  const [navSection, signupSection, logoSection, socialSection, contactSection] = sections;

  // Primary section (navigation + newsletter)
  const primarySection = document.createElement('div');
  primarySection.className = 'usa-footer__primary-section';

  const primaryContainer = document.createElement('div');
  primaryContainer.className = 'grid-container';

  const primaryRow = document.createElement('div');
  primaryRow.className = 'grid-row grid-gap';

  // Navigation (8 columns)
  const navCol = document.createElement('div');
  navCol.className = 'tablet:grid-col-8';

  const nav = document.createElement('nav');
  nav.className = 'usa-footer__nav';
  nav.setAttribute('aria-label', 'Footer navigation');

  const navRow = document.createElement('div');
  navRow.className = 'grid-row grid-gap-4';

  // Process navigation topics
  if (navSection) {
    const topics = navSection.querySelectorAll(':scope > ul > li');
    topics.forEach((topic) => {
      const topicCol = document.createElement('div');
      topicCol.className = 'mobile-lg:grid-col-6 desktop:grid-col-3';

      const section = document.createElement('section');
      section.className = 'usa-footer__primary-content usa-footer__primary-content--collapsible';

      // Topic heading
      const heading = topic.querySelector('p, strong');
      if (heading) {
        const h4 = document.createElement('h4');
        h4.className = 'usa-footer__primary-link';
        h4.textContent = heading.textContent;
        section.appendChild(h4);
      }

      // Secondary links
      const linksList = topic.querySelector('ul');
      if (linksList) {
        const ul = document.createElement('ul');
        ul.className = 'usa-list usa-list--unstyled';

        linksList.querySelectorAll('a').forEach((link) => {
          const li = document.createElement('li');
          li.className = 'usa-footer__secondary-link';
          const a = document.createElement('a');
          a.href = link.href;
          a.textContent = link.textContent;
          li.appendChild(a);
          ul.appendChild(li);
        });

        section.appendChild(ul);
      }

      topicCol.appendChild(section);
      navRow.appendChild(topicCol);
    });
  }

  nav.appendChild(navRow);
  navCol.appendChild(nav);
  primaryRow.appendChild(navCol);

  // Newsletter signup (4 columns)
  if (signupSection) {
    const signupCol = document.createElement('div');
    signupCol.className = 'tablet:grid-col-4';

    const signupDiv = document.createElement('div');
    signupDiv.className = 'usa-sign-up';

    const heading = document.createElement('h3');
    heading.className = 'usa-sign-up__heading';
    heading.textContent = signupSection.querySelector('h3, h4, p')?.textContent || 'Sign up';

    const form = document.createElement('form');
    form.className = 'usa-form';

    const label = document.createElement('label');
    label.className = 'usa-label';
    label.htmlFor = 'footer-email';
    label.textContent = 'Your email address';

    const input = document.createElement('input');
    input.className = 'usa-input';
    input.id = 'footer-email';
    input.name = 'email';
    input.type = 'email';
    input.setAttribute('autocomplete', 'email');

    const button = document.createElement('button');
    button.className = 'usa-button';
    button.type = 'submit';
    button.textContent = 'Sign up';

    form.appendChild(label);
    form.appendChild(input);
    form.appendChild(button);

    signupDiv.appendChild(heading);
    signupDiv.appendChild(form);
    signupCol.appendChild(signupDiv);
    primaryRow.appendChild(signupCol);
  }

  primaryContainer.appendChild(primaryRow);
  primarySection.appendChild(primaryContainer);
  footer.appendChild(primarySection);

  // Secondary section (logo + social + contact)
  decorateSecondarySection(footer, logoSection, socialSection, contactSection, false);
}

/**
 * Decorates medium footer variant
 * @param {Element} footer The footer element
 * @param {NodeList} sections The content sections
 */
function decorateMediumFooter(footer, sections) {
  // Section 0: Primary links
  // Section 1: Logo/Agency info
  // Section 2: Social links
  // Section 3: Contact info

  const [navSection, logoSection, socialSection, contactSection] = sections;

  // Primary section (simple navigation)
  const primarySection = document.createElement('div');
  primarySection.className = 'usa-footer__primary-section';

  const nav = document.createElement('nav');
  nav.className = 'usa-footer__nav';
  nav.setAttribute('aria-label', 'Footer navigation');

  const ul = document.createElement('ul');
  ul.className = 'grid-row grid-gap';

  if (navSection) {
    navSection.querySelectorAll('a').forEach((link) => {
      const li = document.createElement('li');
      li.className = 'mobile-lg:grid-col-4 desktop:grid-col-auto usa-footer__primary-content';
      const a = document.createElement('a');
      a.className = 'usa-footer__primary-link';
      a.href = link.href;
      a.textContent = link.textContent;
      li.appendChild(a);
      ul.appendChild(li);
    });
  }

  nav.appendChild(ul);
  primarySection.appendChild(nav);
  footer.appendChild(primarySection);

  // Secondary section (logo + social + contact)
  decorateSecondarySection(footer, logoSection, socialSection, contactSection, false);
}

/**
 * Decorates slim footer variant
 * @param {Element} footer The footer element
 * @param {NodeList} sections The content sections
 */
function decorateSlimFooter(footer, sections) {
  // Section 0: Primary links
  // Section 1: Contact info

  const [navSection, contactSection] = sections;

  // Primary section with container
  const primarySection = document.createElement('div');
  primarySection.className = 'usa-footer__primary-section';

  const primaryContainer = document.createElement('div');
  primaryContainer.className = 'usa-footer__primary-container grid-row';

  const navCol = document.createElement('div');
  navCol.className = 'mobile-lg:grid-col-8';

  const nav = document.createElement('nav');
  nav.className = 'usa-footer__nav';
  nav.setAttribute('aria-label', 'Footer navigation');

  const ul = document.createElement('ul');
  ul.className = 'grid-row grid-gap';

  if (navSection) {
    navSection.querySelectorAll('a').forEach((link) => {
      const li = document.createElement('li');
      li.className = 'mobile-lg:grid-col-6 desktop:grid-col-auto usa-footer__primary-content';
      const a = document.createElement('a');
      a.className = 'usa-footer__primary-link';
      a.href = link.href;
      a.textContent = link.textContent;
      li.appendChild(a);
      ul.appendChild(li);
    });
  }

  nav.appendChild(ul);
  navCol.appendChild(nav);
  primaryContainer.appendChild(navCol);

  // Contact info (4 columns)
  if (contactSection) {
    const contactCol = document.createElement('div');
    contactCol.className = 'mobile-lg:grid-col-4';

    const address = document.createElement('address');
    address.className = 'usa-footer__address';

    const contactRow = document.createElement('div');
    contactRow.className = 'grid-row grid-gap';

    const links = contactSection.querySelectorAll('a');
    links.forEach((link) => {
      const col = document.createElement('div');
      col.className = 'grid-col-auto mobile-lg:grid-col-12 desktop:grid-col-auto';

      const info = document.createElement('div');
      info.className = 'usa-footer__contact-info';

      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = link.textContent;

      info.appendChild(a);
      col.appendChild(info);
      contactRow.appendChild(col);
    });

    address.appendChild(contactRow);
    contactCol.appendChild(address);
    primaryContainer.appendChild(contactCol);
  }

  primarySection.appendChild(primaryContainer);
  footer.appendChild(primarySection);

  // Slim footer secondary section (logo only, no social links)
  decorateSecondarySection(footer, contactSection, null, null, true);
}

/**
 * Decorates the footer content into USWDS structure
 * @param {Element} footer The footer block element
 * @param {Element} fragment The loaded fragment
 */
async function decorateFooter(footer, fragment) {
  const sections = fragment.querySelectorAll(':scope > div');

  // Apply footer variant from metadata (big, medium, slim - default to medium)
  const variant = getMetadata('footer') || getMetadata('footer-variant') || 'medium';

  // Use the parent <footer> element and add USWDS classes
  const usaFooter = footer.parentElement;
  usaFooter.className = `usa-footer${variant !== 'medium' ? ` usa-footer--${variant}` : ''}`;

  // Clear the block content
  footer.textContent = '';

  // Build return to top link (all variants)
  const returnToTop = document.createElement('div');
  returnToTop.className = 'grid-container usa-footer__return-to-top';
  const topLink = document.createElement('a');
  topLink.href = '#';
  topLink.textContent = 'Return to top';
  returnToTop.appendChild(topLink);
  footer.appendChild(returnToTop);

  if (variant === 'big') {
    // Big footer: multi-column nav + newsletter
    await decorateBigFooter(footer, sections);
  } else if (variant === 'slim') {
    // Slim footer: simple nav + minimal contact
    decorateSlimFooter(footer, sections);
  } else {
    // Medium footer (default): simple nav + full contact
    decorateMediumFooter(footer, sections);
  }
}

/**
 * Decorates the footer block
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // Load the footer content from fragment
  const footerPath = getMetadata('footer-nav') || '/nav/footer';
  const fragment = await loadFragment(footerPath);

  // Decorate the fragment into USWDS structure
  await decorateFooter(block, fragment);
}
