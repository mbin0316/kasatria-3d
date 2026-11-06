// Builds the HTML card for one person (Image B). Plain DOM, not React: CSS3DRenderer
// needs to own and transform these elements directly. textContent only — no HTML
// injection from Sheet values.

import { formatMoney } from '../data/parse.js'

const BAND_LABEL = { low: 'Net worth under $100K', mid: 'Net worth $100K–$200K', high: 'Net worth $200K and above' }

function el(tag, className, text) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text != null) node.textContent = String(text)
  return node
}

function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

export function createTile(person) {
  const tile = el('div', `tile band-${person.band}`)
  tile.title = `${person.name}\n${formatMoney(person.netWorth)} · ${BAND_LABEL[person.band]}`
  tile.dataset.band = person.band

  const top = el('div', 'tile-top')
  top.append(el('span', 'tile-country', person.country), el('span', 'tile-age', person.age ?? ''))

  const fallback = el('div', 'tile-photo tile-initials', initials(person.name))
  let photo = fallback
  if (person.photo) {
    photo = el('img', 'tile-photo')
    photo.alt = person.name
    photo.draggable = false
    photo.decoding = 'async'
    photo.referrerPolicy = 'no-referrer'
    photo.addEventListener('error', () => photo.replaceWith(fallback), { once: true })
    photo.src = person.photo
  }

  tile.append(top, photo, el('div', 'tile-name', person.name), el('div', 'tile-interest', person.interest))
  return tile
}
