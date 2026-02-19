# Smart Scalper Pro

## Overview
A React-based neural trading terminal frontend application built with Vite, TypeScript, and Tailwind CSS. Features real-time market data visualization, trading signals, and AI-powered analysis.

## Project Architecture
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS (CDN), custom CSS
- **Charting**: lightweight-charts
- **AI Integration**: @google/genai
- **Animation**: framer-motion

## Project Structure
- `/` - Root contains main app files (App.tsx, index.tsx, index.html)
- `/components/` - React components (AdminPanel, AuthSystem, ChartContainer, etc.)
- `/services/` - Service modules (firebase, email, trading logic, mock data)
- `/types.ts` - TypeScript type definitions
- `/translations.ts` - i18n translations

## Development
- **Dev server**: `npm run dev` (Vite on port 5000)
- **Build**: `npm run build` (TypeScript check + Vite build)
- **Preview**: `npm run preview`

## Recent Changes
- 2026-02-19: Initial Replit setup - configured Vite for port 5000 with allowedHosts
