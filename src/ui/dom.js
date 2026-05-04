export function assetPath(path) {
  // Determine the current page depth to build correct relative path
  const currentPath = window.location.pathname;
  
  // Count how many directories deep we are (excluding root)
  // /crosnier/DragonBalldle/index.html -> depth 0
  // /crosnier/DragonBalldle/modes/infinity.html -> depth 1
  const segments = currentPath.split('/').filter(Boolean);
  const ballParts = segments.indexOf('DragonBalldle');
  
  let depth = 0;
  if (ballParts !== -1 && segments.length > ballParts + 2) {
    // We're in a subdirectory like modes/
    depth = segments.length - ballParts - 2;
  }
  
  // Build relative path with correct number of ../
  const prefix = depth > 0 ? '../'.repeat(depth) : './';
  return prefix + path.replace(/^\.\//, '').replace(/^\//, '');
}

export function qs(selector, root = document) {
  return root.querySelector(selector);
}

export function qsa(selector, root = document) {
  return [...root.querySelectorAll(selector)];
}

export function createEl(tag, { className = "", text = "", html = "", attrs = {} } = {}) {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }

  if (text) {
    element.textContent = text;
  }

  if (html) {
    element.innerHTML = html;
  }

  for (const [key, value] of Object.entries(attrs)) {
    if (value !== undefined && value !== null) {
      element.setAttribute(key, String(value));
    }
  }

  return element;
}

export function clearEl(root) {
  root.replaceChildren();
}

export function delegate(root, eventName, selector, handler) {
  root.addEventListener(eventName, (event) => {
    const target = event.target.closest(selector);
    if (target && root.contains(target)) {
      handler(event, target);
    }
  });
}

export async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const fallback = document.createElement("textarea");
  fallback.value = text;
  document.body.appendChild(fallback);
  fallback.select();
  document.execCommand("copy");
  fallback.remove();
}