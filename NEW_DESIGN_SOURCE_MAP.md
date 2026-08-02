# 🎨 New Design Source Map (`NEW_DESIGN_SOURCE_MAP.md`)

**Approved UI/UX Theme**: Executive Royal Olive Green & Gold  
**Primary CSS Variable Reference**: `src/index.css`  
**Layout Container**: `src/App.tsx`  

---

## 1. Master Design System Tokens (`src/index.css`)

```css
:root {
  --primary-olive: #1b3325;
  --primary-olive-light: #234735;
  --accent-gold: #d4af37;
  --accent-gold-light: #f3e5ab;
  --bg-dark: #0f1e16;
  --bg-card: rgba(27, 51, 37, 0.85);
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --border-gold: rgba(212, 175, 55, 0.25);
  --font-family: 'Tajawal', 'Inter', sans-serif;
  --direction: rtl;
}
```

---

## 2. Reusable Visual Components Matrix

| Component Name | Visual Style | File Location | Target Usage |
| :--- | :--- | :--- | :--- |
| **Executive Sidebar** | Royal Olive Green background with Gold active badges | `src/App.tsx` (L150-L240) | Global RTL Navigation |
| **Header Gateway Bar**| Glassmorphic search bar + AI Sentiment trigger button | `src/App.tsx` (L250-L310) | Global Top Bar |
| **Metric Stat Cards** | Rounded-xl glass cards with gold border hover glow | `src/App.tsx` (L320-L390) | Dashboard & Summaries |
| **Data Tables** | Dark olive table rows with alternating zebra styling | `src/App.tsx` (L400-L520) | Employees, Attendance, Payroll |
| **Status Badges** | Vibrant green/yellow/red pill indicators | `src/App.tsx` (L450-L480) | Attendance & Leave status |
| **Executive Modals** | Center overlay with gold border and backdrop blur | `src/App.tsx` (L530-L570) | AI Sentiment & Form Modals |
