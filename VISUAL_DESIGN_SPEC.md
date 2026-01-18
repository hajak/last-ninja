# Panda & Dog - Visual Design Specification

## 1. Lighting & Shadow System

### Global Light Direction
- **Direction**: Top-left (315° / NW), 45° elevation angle
- **Rationale**: Classic isometric lighting that creates depth without obscuring gameplay elements

### Shadow Rules
| Element | Shadow Type | Offset | Blur | Opacity |
|---------|-------------|--------|------|---------|
| Characters | Contact + Drop | (4, 3) | 0 | 0.35 |
| Walls | Ambient Occlusion | (0, 0) | Edge | 0.25 |
| Crates/Props | Contact | (3, 2) | 0 | 0.30 |
| Interactables | Subtle Drop | (2, 1) | 0 | 0.20 |

### Surface Shading
```
Top Face:    100% base color (receives light)
Right Face:  85% base color (-15% brightness)
Left Face:   70% base color (-30% brightness)
AO Edge:     60% base color (where surfaces meet)
```

### Outline Rules
| Element | Outline | Color | Width |
|---------|---------|-------|-------|
| Player Characters | Always | White (#FFFFFF) | 1.5px |
| Selected Interactable | On Hover | Accent (#FFD93D) | 2px |
| Hazards | Pulsing | Danger (#FF6B6B) | 1.5px |
| Guards | Alert State | Alert Color | 1px |

---

## 2. Color Palette (12 Colors)

### Primary Palette
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Deep Void** | `#0D1117` | 13, 17, 23 | Background, void tiles |
| **Slate Ground** | `#21262D` | 33, 38, 45 | Floor tiles base |
| **Stone Gray** | `#30363D` | 48, 54, 61 | Stone tiles, walls dark |
| **Wall Light** | `#484F58` | 72, 79, 88 | Wall top faces |

### Accent Palette
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Ocean Blue** | `#58A6FF` | 88, 166, 255 | Dog character, water |
| **Forest Green** | `#3FB950` | 63, 185, 80 | Grass, active states, safe |
| **Amber Gold** | `#FFD93D` | 255, 217, 61 | Highlights, coins, selection |
| **Sunset Orange** | `#F0883E` | 240, 136, 62 | Buttons, interaction prompts |

### Semantic Palette
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Danger Red** | `#FF6B6B` | 255, 107, 107 | Hazards, damage, alerts |
| **Panda Dark** | `#24292F` | 36, 41, 47 | Panda body |
| **Panda Light** | `#F0F6FC` | 240, 246, 252 | Panda belly/face patches |
| **Guard Purple** | `#A371F7` | 163, 113, 247 | Guards, vision cones |

---

## 3. Typography Scale

### Font Stack
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Size Scale (Base: 14px)
| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `--text-xs` | 10px | 1.4 | 500 | Timestamps, version |
| `--text-sm` | 12px | 1.4 | 500 | Labels, secondary info |
| `--text-base` | 14px | 1.5 | 400 | Body text, prompts |
| `--text-lg` | 16px | 1.5 | 600 | HUD values, names |
| `--text-xl` | 20px | 1.3 | 700 | Headings, alerts |
| `--text-2xl` | 28px | 1.2 | 800 | Level titles |

### Text Colors
| Token | Color | Usage |
|-------|-------|-------|
| `--text-primary` | `#F0F6FC` | Main readable text |
| `--text-secondary` | `#8B949E` | Secondary info |
| `--text-muted` | `#6E7681` | Disabled, hints |
| `--text-accent` | `#FFD93D` | Highlighted text |

---

## 4. Icon Style Rules

### Stroke & Fill
- **Stroke Width**: 2px (24px icons), 1.5px (16px icons)
- **Line Cap**: Round
- **Line Join**: Round
- **Corner Radius**: 2px minimum on all shapes

### Icon Sizes
| Size | Dimensions | Usage |
|------|------------|-------|
| Small | 16×16 | Inline indicators |
| Medium | 24×24 | HUD icons, buttons |
| Large | 32×32 | Tutorial, popups |

### Icon Colors
- **Default**: `--text-secondary` (#8B949E)
- **Active**: `--text-primary` (#F0F6FC)
- **Accent**: Match semantic color for context

---

## 5. UI Component States

### Door States
| State | Fill | Outline | Shadow | Animation |
|-------|------|---------|--------|-----------|
| Closed | `#6E4A2A` | None | Contact | None |
| Open | `#4A3219` | None | Reduced | Slide 200ms |
| Locked | `#6E4A2A` | `#FF6B6B` pulse | Contact | Lock icon pulse |
| Hover | `#8B5E3C` | `#FFD93D` 2px | Enhanced | Subtle glow |

### Button States
| State | Fill | Outline | Scale | Animation |
|-------|------|---------|-------|-----------|
| Idle | `#F0883E` | None | 1.0 | None |
| Hover | `#FFA657` | `#FFD93D` | 1.0 | Glow pulse |
| Pressed | `#BD561D` | None | 0.95 | Depress 100ms |
| Disabled | `#484F58` | None | 1.0 | None |

### Pressure Plate States
| State | Fill | Glow | Height | Animation |
|-------|------|------|--------|-----------|
| Inactive | `#484F58` | None | 4px | None |
| Active | `#3FB950` | Soft green | 2px | Depress 150ms |
| Heavy Required | `#484F58` | Orange hint | 4px | Weight icon |

### Crate States
| State | Fill | Outline | Animation |
|-------|------|---------|-----------|
| Idle | `#C9A227` | None | None |
| Pushable (hover) | `#D4B52F` | `#FFD93D` | Wobble hint |
| Being Pushed | `#C9A227` | None | Position lerp |
| Heavy (Panda only) | `#C9A227` | `#58A6FF` glow | Weight icon |

### Hazard States
| State | Fill | Glow | Animation |
|-------|------|------|-----------|
| Active | `#FF6B6B` | Red pulse | Warning blink |
| Inactive | `#6E7681` | None | None |
| Warning | `#FFD93D` | Yellow | 2s before active |

---

## 6. Spacing System

### Base Unit: 4px
| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight spacing, icon gaps |
| `--space-2` | 8px | Component padding |
| `--space-3` | 12px | Section gaps |
| `--space-4` | 16px | Card padding |
| `--space-6` | 24px | Large gaps |
| `--space-8` | 32px | Section margins |

### Border Radius
| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Small elements, tags |
| `--radius-md` | 8px | Buttons, inputs |
| `--radius-lg` | 12px | Cards, panels |
| `--radius-xl` | 16px | Modals, overlays |
| `--radius-full` | 9999px | Circular elements |

---

## 7. Animation Timing

### Durations
| Token | Duration | Usage |
|-------|----------|-------|
| `--duration-fast` | 100ms | Micro-interactions |
| `--duration-normal` | 200ms | Standard transitions |
| `--duration-slow` | 400ms | Major state changes |
| `--duration-slower` | 600ms | Entrance animations |

### Easing Functions
| Token | Value | Usage |
|-------|-------|-------|
| `--ease-out` | cubic-bezier(0.0, 0, 0.2, 1) | Exits, collapses |
| `--ease-in` | cubic-bezier(0.4, 0, 1, 1) | Entrances |
| `--ease-in-out` | cubic-bezier(0.4, 0, 0.2, 1) | State changes |
| `--ease-bounce` | cubic-bezier(0.34, 1.56, 0.64, 1) | Playful elements |

---

## 8. Z-Index Layers

| Layer | Z-Index | Contents |
|-------|---------|----------|
| Ground | 0-99 | Floor tiles, water |
| Props | 100-199 | Crates, decorations |
| Characters | 200-299 | Players, guards |
| Effects | 300-399 | Particles, shadows |
| UI World | 400-499 | Labels, prompts |
| HUD | 500-599 | Health, minimap |
| Overlay | 600-699 | Menus, tutorials |
| Modal | 700+ | Dialogs, alerts |

---

## 9. HUD Layout Specification

### Position Anchors
```
┌─────────────────────────────────────────┐
│ [Health/Status]              [Minimap]  │  ← Top bar (48px)
│                                         │
│                                         │
│                                         │
│ [Controls]              [Quick Slots]   │  ← Bottom bar (64px)
└─────────────────────────────────────────┘
```

### Health/Status Component
- **Position**: Top-left, 16px margin
- **Size**: 160px × 40px
- **Elements**:
  - Character icon (24×24)
  - Health bar (100×8px, rounded)
  - Role label (text-sm)

### Minimap Component
- **Position**: Top-right, 16px margin
- **Size**: 160px × 120px
- **Style**: Rounded corners, subtle border
- **Toggle**: M key or click to expand

---

## 10. Debug Visualization (Dev Mode)

### Hitbox Display
- **Color**: `#FF00FF` (magenta)
- **Style**: 1px dashed outline
- **Opacity**: 0.5

### Interaction Range
- **Color**: `#00FFFF` (cyan)
- **Style**: Dotted circle
- **Opacity**: 0.3

### Grid Overlay
- **Color**: `#FFFFFF`
- **Style**: 1px solid
- **Opacity**: 0.1
