# Campus 360 — Stitch Design Specification & Tokens

## Design System: Academic Vanguard / TGPCET Autonomous

### Theme Configuration
- **Color Mode**: Light default with crisp contrast
- **Typography**:
  - Headings & Display: `Plus Jakarta Sans`, sans-serif
  - Body & UI Controls: `Inter`, sans-serif
  - Code & Identifiers (PRN/Roll No): `JetBrains Mono` / monospace
- **Border Radius**: 8px (`0.5rem` / `rounded-lg`) standard for inputs and cards, `9999px` (`rounded-full`) for badges and pills.
- **Elevation**: Tactile micro-borders (`1px solid #E2E8F0`), subtle directional drop shadows without fuzzy glow.

### Color Tokens
| Token | Hex | Role / Purpose |
|---|---|---|
| `primary` | `#000919` / `#0F2137` | Core institutional navy, primary headers, active items |
| `primary-container` | `#0F2137` | Main container, hero ribbon, primary button |
| `on-primary` | `#FFFFFF` | Text on primary containers |
| `secondary` | `#AA3600` / `#E05822` | Solar Ember, urgent callouts, active indicators |
| `secondary-container` | `#FF6E38` | Accent highlight |
| `tertiary` | `#059669` / `#139A6D` | Academic Health emerald, verified states |
| `surface` | `#F8F9FF` / `#F8FAFC` | Main canvas recessed background |
| `surface-container-lowest` | `#FFFFFF` | Card & modular container surface |
| `surface-container-low` | `#EFF4FF` / `#F1F5F9` | Secondary card background, subtle section wells |
| `surface-container-high` | `#DCE9FF` / `#E2E8F0` | Hover states, tab backgrounds |
| `outline` | `#74777D` / `#CBD5E1` | Borders, subtle separators |
| `on-surface` | `#0B1C30` | Primary text |
| `on-surface-variant` | `#44474D` / `#64748B` | Secondary/muted metadata text |
| `error` | `#BA1A1A` / `#DC2626` | Error states, alerts |

### Key Layout Rules
- Sidebar: 260px width (`w-64`), fixed left on desktop.
- Header: 64px height (`h-16`), fixed top with backdrop blur (`backdrop-blur-xl`).
- Grid: 12-column responsive fluid layout on desktop, 4-column stack on mobile.
- Mobile Navigation: Responsive drawer or top bar toggle.
