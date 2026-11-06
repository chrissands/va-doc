/**
 * header block
 * Based on USWDS usa-header component
 *
 * @see https://designsystem.digital.gov/components/header/
 */

import { getMetadata, decorateBlock, loadBlock } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Decorates the nav content into USWDS structure
 * @param {Element} header The header block element
 * @param {Element} fragment The loaded fragment
 */
async function decorateNav(header, fragment) {
  const sections = fragment.querySelectorAll(':scope > div');
  const [brandSection, navSection, toolsSection] = sections;

  // Apply header variant from metadata (supports both 'header' and 'header-variant')
  const variant = getMetadata('header') || getMetadata('header-variant') || 'basic';

  // Use the parent <header> element instead of creating a new one
  // EDS auto-blocks create a <header> wrapper, we just add USWDS classes to it
  const usaHeader = header.parentElement;
  usaHeader.className = `usa-header usa-header--${variant}`;

  // Create nav-container wrapper (for basic/megamenu variants only)
  let navContainer;
  if (variant === 'basic' || variant === 'megamenu') {
    navContainer = document.createElement('div');
    navContainer.className = 'usa-nav-container';
  }

  // Extended variant needs nav__inner wrapper
  let navInner;
  if (variant === 'extended') {
    navInner = document.createElement('div');
    navInner.className = 'usa-nav__inner';
  }

  // Create navbar (logo/brand section)
  const navbar = document.createElement('div');
  navbar.className = 'usa-navbar';

  if (brandSection) {
    const logoDiv = document.createElement('div');
    logoDiv.className = 'usa-logo';

    // Check for image (logo)
    const img = brandSection.querySelector('img');

    // Check for text (brand name) - prioritize headings, skip image-only paragraphs
    let textContent = '';
    const headingEl = brandSection.querySelector('h1, h2, h3, h4, h5, h6');
    if (headingEl) {
      textContent = headingEl.textContent.trim();
    } else {
      // Try other text elements, but filter out ones that only contain images
      const textElements = Array.from(brandSection.querySelectorAll('p, strong, em, span, a'));
      const validTextEl = textElements.find((el) => {
        const text = el.textContent.trim();
        // Skip elements that are empty or only contain an image
        return text && !el.querySelector('img, picture');
      });

      if (validTextEl) {
        textContent = validTextEl.textContent.trim();
      } else {
        // Final fallback: get text directly from the section, excluding images
        const clone = brandSection.cloneNode(true);
        const cloneImgs = clone.querySelectorAll('img, picture');
        cloneImgs.forEach((imgEl) => imgEl.remove());
        textContent = clone.textContent.trim();
      }
    }

    // Build logo structure with image and/or text
    if (img) {
      // Logo with image
      const imgLink = document.createElement('a');
      imgLink.href = '/';
      imgLink.title = textContent || 'Home';
      const logoImg = document.createElement('img');
      logoImg.className = 'usa-logo__img';
      logoImg.src = img.src;
      logoImg.alt = img.alt || textContent || '';
      imgLink.appendChild(logoImg);
      logoDiv.appendChild(imgLink);
    }

    if (textContent) {
      // Logo text/brand name
      const textLink = document.createElement('a');
      textLink.href = '/';
      textLink.className = 'usa-logo__text';
      textLink.textContent = textContent;
      logoDiv.appendChild(textLink);
    }

    navbar.appendChild(logoDiv);
  }

  // Create mobile menu button
  const menuBtn = document.createElement('button');
  menuBtn.type = 'button';
  menuBtn.className = 'usa-menu-btn';
  menuBtn.textContent = 'Menu';
  navbar.appendChild(menuBtn);

  // Create nav container
  const nav = document.createElement('nav');
  nav.className = 'usa-nav';

  // Create close button for mobile
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'usa-nav__close';
  const closeImg = document.createElement('img');
  closeImg.src = '/icons/usa-icons-bg/close--white.svg';
  closeImg.alt = 'Close';
  closeBtn.appendChild(closeImg);

  // Create primary navigation
  const primaryNav = document.createElement('ul');
  primaryNav.className = 'usa-nav__primary usa-accordion';

  if (navSection) {
    const navList = navSection.querySelector('ul');
    if (navList) {
      const navItems = navList.querySelectorAll(':scope > li');
      navItems.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'usa-nav__primary-item';

        // Check if item has submenu (nested ul) or is a simple link
        const submenu = item.querySelector('ul');
        const link = item.querySelector(':scope > p > a');

        if (submenu && !link) {
          // This is an accordion item with submenu
          const title = item.querySelector(':scope > p');
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'usa-accordion__button usa-nav__link';
          button.setAttribute('aria-expanded', 'false');
          button.setAttribute('aria-controls', `nav-section-${index}`);

          const span = document.createElement('span');
          span.textContent = title ? title.textContent : 'Section';
          button.appendChild(span);

          const submenuUl = document.createElement('ul');
          submenuUl.id = `nav-section-${index}`;
          submenuUl.className = 'usa-nav__submenu';
          submenuUl.setAttribute('hidden', '');

          const submenuItems = submenu.querySelectorAll(':scope > li');
          submenuItems.forEach((subitem) => {
            const subLi = document.createElement('li');
            subLi.className = 'usa-nav__submenu-item';
            const subLink = subitem.querySelector('a');
            if (subLink) {
              const newLink = document.createElement('a');
              newLink.href = subLink.href;
              const linkSpan = document.createElement('span');
              linkSpan.textContent = subLink.textContent;
              newLink.appendChild(linkSpan);
              subLi.appendChild(newLink);
            }
            submenuUl.appendChild(subLi);
          });

          li.appendChild(button);
          li.appendChild(submenuUl);

          // Note: USWDS JavaScript handles accordion interactions automatically
        } else if (link) {
          // Simple link item
          const navLink = document.createElement('a');
          navLink.href = link.href;
          navLink.className = 'usa-nav__link';
          const linkSpan = document.createElement('span');
          linkSpan.textContent = link.textContent;
          navLink.appendChild(linkSpan);
          li.appendChild(navLink);
        }

        primaryNav.appendChild(li);
      });
    }
  }

  // For extended variant, add secondary nav section
  let secondaryNav;
  if (variant === 'extended') {
    secondaryNav = document.createElement('div');
    secondaryNav.className = 'usa-nav__secondary';

    // Process secondary links from tools section
    const secondaryLinks = document.createElement('ul');
    secondaryLinks.className = 'usa-nav__secondary-links';

    if (toolsSection) {
      // Find all links in tools section that are NOT in the search block
      const links = toolsSection.querySelectorAll('a');
      links.forEach((link) => {
        // Skip if this link is inside the search block
        if (!link.closest('.search')) {
          const li = document.createElement('li');
          li.className = 'usa-nav__secondary-item';
          const newLink = document.createElement('a');
          newLink.href = link.href;
          newLink.textContent = link.textContent;
          li.appendChild(newLink);
          secondaryLinks.appendChild(li);
        }
      });
    }

    secondaryNav.appendChild(secondaryLinks);
  }

  // Add search block if present in tools section
  if (toolsSection) {
    const searchBlock = toolsSection.querySelector('.search');
    if (searchBlock) {
      // Decorate and load the search block
      decorateBlock(searchBlock);
      await loadBlock(searchBlock);

      // Wrap search in a section with aria-label
      const searchSection = document.createElement('section');
      searchSection.setAttribute('aria-label', 'Search component');
      searchSection.appendChild(searchBlock);

      // For extended variant, add search to secondary nav; otherwise add directly to nav
      if (secondaryNav) {
        secondaryNav.appendChild(searchSection);
      } else {
        nav.appendChild(searchSection);
      }
    }
  }

  // Assemble nav structure based on variant
  if (navInner) {
    // Extended variant: wrap primary nav and secondary nav in nav__inner
    navInner.appendChild(closeBtn);
    navInner.appendChild(primaryNav);
    if (secondaryNav) {
      navInner.appendChild(secondaryNav);
    }
    nav.appendChild(navInner);
  } else {
    // Basic variant: add elements directly to nav
    nav.appendChild(closeBtn);
    nav.appendChild(primaryNav);
  }

  // Note: USWDS JavaScript handles all menu interactions automatically
  // including: mobile menu toggle, accordion dropdowns, click-outside,
  // escape key, and keyboard navigation

  // Clear the block content (EDS adds a default wrapper)
  header.textContent = '';

  // Assemble final header structure
  if (navContainer) {
    // Basic/megamenu variants: use nav-container wrapper
    navContainer.appendChild(navbar);
    navContainer.appendChild(nav);
    header.appendChild(navContainer);
  } else {
    // Extended variant: add navbar and nav directly to block
    header.appendChild(navbar);
    header.appendChild(nav);
  }
}

/**
 * Decorates the header block
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // Automatically add banner above header (USWDS pattern)
  // The banner should be a sibling to the <header> element, not inside it
  const headerElement = block.parentElement; // This is the <header> tag
  const bannerBlock = document.createElement('div');
  bannerBlock.className = 'banner block';
  bannerBlock.setAttribute('data-block-name', 'banner');

  // Insert banner before the <header> element in the DOM
  headerElement.parentElement.insertBefore(bannerBlock, headerElement);

  // Now decorate and load the banner block
  decorateBlock(bannerBlock);
  await loadBlock(bannerBlock);

  // Load the nav content from fragment
  const navPath = getMetadata('nav') || '/nav/header';
  const fragment = await loadFragment(navPath);

  // Decorate the fragment into USWDS structure
  await decorateNav(block, fragment);
}
