# Design System Document

## 1. Overview & Creative North Star: "The Modern Magistrate"

This design system is built to project the gravitas of a judicial institution through a contemporary lens. The "Creative North Star" is **The Modern Magistrate**: a visual philosophy that marries the unwavering stability of traditional law with the transparency and efficiency of the digital age.

Unlike generic corporate platforms, this system rejects the "boxed-in" feeling of standard grids. We utilize a high-end editorial approach characterized by:
*   **Intentional Asymmetry:** Strategic use of white space and off-center alignments to guide the eye.
*   **Serif Dominance:** Leveraging `newsreader` to establish an authoritative, academic voice.
*   **Layered Solemnity:** Using depth and tone rather than lines to organize complex legal information.

The goal is an interface that feels less like software and more like a high-end digital publication—curated, ethical, and profound.

---

## 2. Colors: Tonal Authority

The palette is anchored in deep ambers and sophisticated neutrals. The core philosophy here is **Tonal Definition** over structural borders.

### Palette Strategy
*   **Primary (`#844c00` / `#A76100`):** Used for key actions and brand presence. It should be treated as a "seal of quality."
*   **Secondary (`#51616a`):** A slate-blue neutral that balances the warmth of the gold, providing a professional, calm counterpoint.
*   **Tertiary (`#306600`):** Reserved for "success" states and ethical affirmations, nodding to the brand's original green accents.

### The "No-Line" Rule
To maintain a premium editorial feel, **1px solid borders are strictly prohibited for sectioning.** 
*   **Boundaries:** Use shifts from `surface` (`#f5faff`) to `surface-container-low` (`#e8f5ff`) to define sections.
*   **Nesting:** Elements should feel "nested" through tone. A card in `surface-container-lowest` (`#ffffff`) sitting on a `surface-container` (`#dff0fc`) background creates a natural, soft hierarchy.

### Signature Textures & Glass
*   **Gradients:** Hero sections and primary buttons should use a subtle vertical gradient from `primary` to `primary_container`. This adds a "soulful" depth that prevents the amber from appearing flat.
*   **Glassmorphism:** For floating navigational elements or overlays, use `surface_container_lowest` at 80% opacity with a `24px` backdrop-blur. This integrates the element into the judicial environment rather than floating it "on top."

---

## 3. Typography: Editorial Sophistication

The typography system is a dialogue between the classic (`newsreader`) and the functional (`workSans` and `inter`).

*   **Display & Headline (Newsreader):** These are the "voice" of the institution. Use generous letter spacing and line heights. The serif nature conveys history, trust, and the weight of law.
*   **Title & Body (Work Sans):** A highly legible humanist sans-serif. Use this for all functional information. It balances the "antique" feel of the serifs with modern clarity.
*   **Labels (Inter):** Reserved for the most technical, micro-level data. It provides a "utility" feel that suggests precision.

**Hierarchy Note:** Always lead with a `display-md` serif headline to establish the "The Modern Magistrate" persona before moving into the sans-serif functional text.

---

## 4. Elevation & Depth: Tonal Layering

We eschew traditional "dropshadow-everything" design. Hierarchy is achieved through the physical stacking of tones.

*   **The Layering Principle:** 
    *   **Level 0 (Base):** `surface`
    *   **Level 1 (Sections):** `surface-container-low`
    *   **Level 2 (Cards):** `surface-container-lowest`
*   **Ambient Shadows:** If a card requires a "lift" (e.g., on hover), use a shadow tinted with `on_surface` (`#0d1d26`).
    *   *Spec:* `0px 12px 32px -4px rgba(13, 29, 38, 0.06)`
*   **The "Ghost Border" Fallback:** If high-contrast accessibility is required, use the `outline_variant` token at **15% opacity**. Never use a 100% opaque border; the goal is a "suggestion" of a boundary.

---

## 5. Components

### Buttons
*   **Primary:** A subtle gradient of `primary` to `primary_container`. Minimal roundness (`0.25rem`). All caps label for an authoritative "stamped" look.
*   **Secondary:** No background. A "Ghost Border" of `outline_variant` at 20% opacity.
*   **States:** Hover states should involve a shift in the gradient intensity, not a color change.

### Cards & Lists
*   **Anti-Divider Rule:** Forbid 1px dividers between list items. Use `8px` of vertical white space or a very subtle alternating background of `surface_container_low` and `surface_container_lowest`.
*   **Structure:** Cards should be flat, using `surface_container_highest` for a grounded, heavy-weight judicial feel.

### Input Fields
*   **Styling:** Use a "filled" style with `surface_container_high`. Use an underline of `primary` that only appears on focus. Minimalist roundness (`0.25rem`) is essential.
*   **Typography:** Labels must use `label-md` in `on_surface_variant` to keep the UI clean.

### Specialized Component: The "Legal Accordion"
For FAQ and complex documentation, use wide, full-bleed accordions. Separate items with vertical white space rather than lines. The "active" item should shift to a `primary_container` background with `on_primary_container` text.

---

## 6. Do's and Don'ts

### Do:
*   **Use breathing room:** Allow at least `48px` of margin between major sections to let the "Editorial" feel breathe.
*   **Embrace the serif:** Use `newsreader` for any text that carries emotional or authoritative weight.
*   **Layer intentionally:** Always place lighter surfaces on darker backgrounds to suggest depth.

### Don't:
*   **No rounded corners:** Avoid `full` or `lg` roundness. Stick to `ROUND_FOUR` (`0.25rem`) to maintain a structured, judicial "architectural" feel.
*   **No dark borders:** Never use pure black or high-contrast borders. They break the premium "paper-like" flow.
*   **No generic icons:** Use thin-stroke, high-detail icons that look like architectural sketches rather than playful "bubbly" icons.