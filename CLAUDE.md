# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server on port 8080
npm run build      # Production build
npm run lint       # Run ESLint
npm test           # Run tests once
npm run test:watch # Run tests in watch mode
```

Tests use Vitest with jsdom. Test files go in `src/**/*.{test,spec}.{ts,tsx}`.

## Architecture

This is a React data visualization tool (GOAL Data Visualizer) for transforming CSV data into presentation-ready dashboards. Built with Vite, TypeScript, React, shadcn/ui, and Tailwind CSS.

### Application Flow

The app follows a 3-step wizard pattern managed by state in `src/pages/Index.tsx`:

1. **Upload** (`FileUpload.tsx`) - CSV file upload with drag-and-drop, includes inline CSV parsing
2. **Configure** (`KPISelector.tsx`) - Two-step form: define objective, then select KPIs to highlight
3. **Dashboard** (`Dashboard.tsx`) - Renders KPI cards and comparison charts with mock visualization data

### Key Components

- `src/components/ComparisonChart.tsx` - Horizontal bar chart with animated bars and highlighting for primary metrics
- `src/components/KPICard.tsx` - Metric display card with variant styling
- `src/components/GoalLogo.tsx` - Brand logo component

### Styling

- Path alias: `@/` maps to `src/`
- Custom CSS classes defined in `src/index.css`: `.kpi-card`, `.chart-card`, `.metric-badge`, `.upload-zone`, `.comparison-bar-*`, `.header-gradient`
- GOAL brand colors: `--goal-blue`, `--goal-success`, `--goal-gray` with light/dark variants
- Dark mode support via CSS variables in `:root` and `.dark` classes
- Uses shadcn/ui components in `src/components/ui/`

### State Management

- React Query for async state (configured in `App.tsx`)
- Local component state for wizard flow and form data
- No global state store - data flows through props from Index page
