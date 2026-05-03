import { SUPABASE_CONFIG } from "../config.js";

function isPlaceholderSupabaseUrl(url) {
  return /ton-projet\.supabase\.co|your-project-ref\.supabase\.co/i.test(url);
}

function parseErrorMessage(body, fallback) {
  if (!body || typeof body !== "object") {
    return fallback;
  }

  return body.message || body.error_description || body.error || fallback;
}

export async function submitContactMessage({ message, pagePath, mode, userAgent }) {
  const hasSupabaseConfig = Boolean(SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey);
  if (!hasSupabaseConfig) {
    throw new Error("Supabase n'est pas configure. Ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.");
  }

  if (isPlaceholderSupabaseUrl(SUPABASE_CONFIG.url)) {
    throw new Error("VITE_SUPABASE_URL est encore un placeholder. Remplacez-le par l'URL reelle du projet.");
  }

  const endpoint = `${SUPABASE_CONFIG.url}/rest/v1/contact`;
  const payload = {
    message,
    page_path: pagePath || null,
    mode: mode || null,
    user_agent: userAgent || null,
  };

  let response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_CONFIG.anonKey,
        Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("Impossible de joindre Supabase. Verifiez votre reseau et la configuration.");
  }

  if (response.ok) {
    return;
  }

  let details = null;
  try {
    details = await response.json();
  } catch {
    details = null;
  }

  if (response.status === 401 || response.status === 403) {
    throw new Error("Acces refuse a la table contact. Verifiez les policies RLS.");
  }

  throw new Error(parseErrorMessage(details, `Echec de l'envoi du message (HTTP ${response.status}).`));
}
