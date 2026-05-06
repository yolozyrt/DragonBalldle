export function assetPath(path) {
  const currentPath = window.location.pathname.replace(/\\/g, "/");
  const segments = currentPath.split("/").filter(Boolean);

  let depth = 0;
  const modesIndex = segments.lastIndexOf("modes");
  if (modesIndex !== -1 && segments.length > modesIndex + 1) {
    depth = segments.length - modesIndex - 1;
  }

  const prefix = depth > 0 ? "../".repeat(depth) : "./";
  return prefix + path.replace(/^\.\//, "").replace(/^\//, "");
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