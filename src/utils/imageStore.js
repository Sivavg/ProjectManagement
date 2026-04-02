/**
 * Separate image storage — keeps base64 images out of the main
 * entity localStorage keys so they don't hit the 5 MB limit.
 *
 * Images are stored under  pm_img_<key>  in localStorage.
 */

const PREFIX = 'pm_img_';

export const saveImg = (key, base64 = '') => {
  try {
    if (base64) localStorage.setItem(PREFIX + key, base64);
    else localStorage.removeItem(PREFIX + key);
  } catch (e) { /* quota exceeded – silently ignore */ }
};

export const loadImg = (key) =>
  localStorage.getItem(PREFIX + key) || '';

export const removeImg = (key) =>
  localStorage.removeItem(PREFIX + key);
