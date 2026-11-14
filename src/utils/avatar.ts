export const getAvatarUrl = (name: string, customUrl?: string) => {
  if (customUrl) return customUrl;
  if (!name) return '/portraits/socrates.jpg';
  
  const normalized = name.replace(/[أإآ]/g, 'ا').toLowerCase();
  
  if (normalized.includes('سقراط') || name.toLowerCase().includes('socrates')) return '/portraits/socrates.jpg';
  if (normalized.includes('ينشتاين') || name.toLowerCase().includes('einstein')) return '/portraits/einstein.jpg';
  if (normalized.includes('فينشي') || name.toLowerCase().includes('vinci')) return '/portraits/davinci.jpg';

  // High-reliability local SVG data URI fallback (never breaks offline or in sandboxes)
  const initial = name.trim().charAt(0) || '✦';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="#18181b"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="#f4f4f5" font-family="system-ui,sans-serif" font-weight="700" font-size="52">${initial}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
