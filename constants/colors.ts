/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#173023',
    tint: '#1A3A2A',

    // Core surfaces
    background: '#F5F0E8',
    foreground: '#173023',

    // Cards / elevated surfaces
    card: '#FFFCF7',
    cardForeground: '#173023',

    // Primary action color (buttons, links, active states)
    primary: '#1A3A2A',
    primaryForeground: '#F5F0E8',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#EFE4CA',
    secondaryForeground: '#173023',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#EAE4D9',
    mutedForeground: '#66746B',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#C9A84C',
    accentForeground: '#173023',

    // Destructive actions (delete, error states)
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#D9D2C5',
    input: '#D9D2C5',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 8,
};

export default colors;
