import { createIcon } from '../../scripts/scripts.js';

const STORAGE_PREFIX = 'alert-dismissed:';

/**
 * Small stable hash so a dismissal is remembered per alert text (a new alert shows again).
 * @param {string} str
 * @returns {string}
 */
function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (Math.imul(31, h) + str.charCodeAt(i)) % 2147483647;
  return Math.abs(h).toString(36);
}

/**
 * Bolds the "Label:" part of a paragraph (lead) or the value after it (detail lines),
 * matching the design when authors did not format it.
 * @param {HTMLParagraphElement} p
 * @param {boolean} lead true to bold the label, false to bold the value
 */
function emphasise(p, lead) {
  if (p.querySelector('strong, a') || p.childNodes.length !== 1) return;
  const text = p.textContent;
  const i = text.indexOf(': ');
  if (i < 1 || i > 80) return;
  const strong = document.createElement('strong');
  if (lead) {
    strong.textContent = text.slice(0, i + 1);
    p.replaceChildren(strong, text.slice(i + 1));
  } else {
    strong.textContent = text.slice(i + 2);
    p.replaceChildren(text.slice(0, i + 2), strong);
  }
}

/**
 * Hides a dismissed alert (its whole section when the alert is the only content).
 * @param {Element} block
 */
function hide(block) {
  const section = block.closest('.section');
  const wrapper = block.parentElement;
  const onlyChild = section && section.children.length === 1 && wrapper.parentElement === section;
  if (onlyChild) section.hidden = true;
  else wrapper.hidden = true;
}

/**
 * Alert: a full-width notice bar (variants: warning, info).
 * One cell: lead paragraph (bold lead-in), optional extra lines, optional link.
 * @param {Element} block
 */
export default function decorate(block) {
  const info = block.classList.contains('info');
  if (!info) block.classList.add('warning');
  const cell = block.querySelector(':scope > div > div') || block;

  const authoredIcon = cell.querySelector('span.icon');
  const paragraphs = [...cell.querySelectorAll(':scope > p')].filter((p) => p.textContent.trim());
  const isLinkOnly = (p) => p.querySelector('a') && p.textContent.trim() === p.querySelector('a').textContent.trim();
  const linkParas = paragraphs.filter(isLinkOnly);
  const textParas = paragraphs.filter((p) => !linkParas.includes(p));
  if (authoredIcon) authoredIcon.closest('p')?.remove();

  const lead = textParas[0];
  if (lead) emphasise(lead, true);
  textParas.slice(1).forEach((p) => emphasise(p, false));

  const labelText = (lead?.querySelector('strong')?.textContent || '').replace(/[:\s]+$/, '');
  const aside = document.createElement('aside');
  aside.className = 'alert-inner';
  const fallbackLabel = info ? 'Notice' : 'Alert';
  aside.setAttribute('aria-label', labelText.length > 2 && labelText.length < 40 ? labelText : fallbackLabel);

  let iconName = authoredIcon?.dataset.iconName || 'warning';
  if (info && !authoredIcon) iconName = /(§|code of virginia|statut)/i.test(cell.textContent) ? 'gavel' : 'info';
  const icon = createIcon(iconName);
  icon.classList.add('alert-icon');

  const body = document.createElement('div');
  body.className = 'alert-body';
  textParas.forEach((p, i) => {
    p.className = i ? 'alert-detail' : 'alert-lead';
    body.append(p);
  });

  const actions = document.createElement('div');
  actions.className = 'alert-actions';
  linkParas.forEach((p) => {
    const a = p.querySelector('a');
    a.className = 'alert-link';
    a.append(createIcon('arrow-forward'));
    actions.append(a);
  });

  const key = STORAGE_PREFIX + hash(body.textContent);
  if (!info) {
    const dismiss = document.createElement('button');
    dismiss.type = 'button';
    dismiss.className = 'alert-dismiss';
    dismiss.setAttribute('aria-label', 'Dismiss alert');
    dismiss.append(createIcon('close'));
    dismiss.addEventListener('click', () => {
      try { sessionStorage.setItem(key, '1'); } catch (e) { /* storage unavailable */ }
      hide(block);
      document.querySelector('main')?.focus({ preventScroll: true });
    });
    actions.append(dismiss);
  }

  aside.append(icon, body);
  if (actions.children.length) aside.append(actions);
  block.replaceChildren(aside);

  let dismissed = false;
  try { dismissed = !info && sessionStorage.getItem(key) === '1'; } catch (e) { /* ignore */ }
  if (dismissed) hide(block);
}
