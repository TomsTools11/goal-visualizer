# Goal Visualizer

A modern web application for visualizing and analyzing goal data with interactive charts and CSV support. Built with Vite, React, TypeScript, and Tailwind CSS.

## Overview

Goal Visualizer is a data visualization tool designed to help you upload, analyze, and visualize goal-related datasets. The application provides an intuitive interface for CSV data import and displays the data using interactive charts powered by Recharts.

## Features

- **CSV Upload**: Easily import your goal data from CSV files
- **Interactive Charts**: Visualize your data with Recharts-powered interactive visualizations
- **Responsive Design**: Mobile-friendly interface that works on all screen sizes
- **Modern UI Components**: Built with shadcn/ui and Radix UI primitives
- **Form Validation**: Robust form handling with React Hook Form and Zod schema validation
- **Dark Mode Support**: Theme switching capability with next-themes
- **Type-Safe**: Full TypeScript support throughout the application

## Tech Stack

**Frontend Framework & Build Tools:**
- React 18.3.1
- Vite 5.4.19
- TypeScript 5.8.3
- React Router DOM 6.30.1

**UI & Styling:**
- Tailwind CSS 3.4.17
- Tailwind Merge
- Tailwind CSS Animate
- shadcn/ui (Radix UI components)
- Lucide React (icons)

**Data & Forms:**
- React Hook Form 7.61.1
- @hookform/resolvers 3.10.0
- Zod 3.25.76
- Recharts 2.15.4
- TanStack React Query 5.83.0

**Additional Libraries:**
- date-fns 3.6.0
- class-variance-authority 0.7.1
- next-themes 0.3.0
- Embla Carousel React 8.6.0
- Sonner (toast notifications)

## Project Structure
```
goal-visualizer/
├── src/
│   ├── components/       # Reusable React components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions and helpers
│   ├── pages/           # Page components
│   ├── test/            # Test files
│   ├── App.tsx          # Main application component
│   ├── App.css          # Global styles
│   ├── main.tsx         # Application entry point
│   ├── index.css        # CSS reset and base styles
│   └── vite-env.d.ts    # Vite environment type definitions
├── public/              # Static assets
├── index.html           # HTML entry point
├── package.json         # Project dependencies
├── vite.config.ts       # Vite configuration
├── tailwind.config.ts   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── netlify.toml         # Netlify deployment configuration
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/TomsTools11/goal-visualizer.git
cd goal-visualizer
```

2. Install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

Build for development with source maps:
```bash
npm run build:dev
```

### Preview

Preview the production build locally:
```bash
npm run preview
```

## Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run build:dev` - Build with development mode enabled
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview the production build
- `npm run test` - Run tests once
- `npm run test:watch` - Run tests in watch mode

## Testing

The project uses Vitest for unit testing:
```bash
npm run test       # Run tests once
npm run test:watch # Run tests in watch mode
```

## Code Quality

ESLint is configured to maintain code quality:
```bash
npm run lint
```

## Deployment

The project includes Netlify configuration for easy deployment. Simply connect your repository to Netlify and it will automatically build and deploy on push.

To deploy manually:
```bash
npm run build
# Deploy the dist/ directory to your hosting provider
```

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to improve the project.

## License

This project is open source and available under the MIT License.

## Getting Help

If you encounter any issues or have questions, please open an issue on the GitHub repository.

---

Built with ❤️ by [TomsTools11](https://github.com/TomsTools11)
