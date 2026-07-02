# Chart Theme Guide

This project uses CSS variables from [src/index.css](src/index.css) to keep charts visually consistent with the rest of the UI.

## 1. Use theme tokens for chart colors

Prefer these variables when coloring chart elements:

- `var(--color-brand)`
- `var(--color-success)`
- `var(--color-info)`
- `var(--color-violet)`
- `var(--color-warn)`
- `var(--color-danger)`

You can also use the reusable chart palette aliases:

- `var(--chart-1)`
- `var(--chart-2)`
- `var(--chart-3)`
- `var(--chart-4)`
- `var(--chart-5)`
- `var(--chart-6)`

## 2. Apply colors in chart components

Example for a bar chart:

```tsx
<Bar dataKey="value" fill="var(--chart-1)" radius={8} />
```

Example for axes and grid:

```tsx
<CartesianGrid vertical={false} stroke="var(--color-border)" />
<XAxis
  dataKey="month"
  tick={{ fill: "var(--color-muted-foreground)" }}
/>
```

## 3. Keep tooltip styling consistent

Use the shared chart tooltip component so text and surface colors match the theme:

```tsx
<ChartTooltip content={<ChartTooltipContent hideLabel />} />
```

## 4. Add new theme colors in one place

If you want a new chart color, define it in [src/index.css](src/index.css) under the `:root` block and then reuse it anywhere in the app.

Example:

```css
:root {
  --chart-7: var(--color-primary);
}
```

## 5. Best practice

- Use theme variables instead of hardcoded hex or RGB values.
- Keep chart colors aligned with your brand and semantic colors.
- Reuse the same palette across line, bar, area, and pie charts for consistency.
