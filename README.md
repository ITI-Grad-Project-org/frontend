# Uply Frontend

<p align="center">
  <img src="public/Uply-light-logo.png" alt="Uply logo" width="180" />
</p>

The user interface and dashboard for the Uply coaching platform. This repository houses the frontend application specifically designed for coaches to manage clients, track performance metrics, and streamline their daily workflow.

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **Data Visualization:** shadcn charts (Recharts) & Lucide Icons

## Core Frontend Features

- **Coach Dashboard:** Centralized hub featuring interactive data charts for athlete/client tracking.
- **Component-Driven UI:** Highly reusable design system built for speed and consistent user experience.
- **Optimized State & Hooks:** Built-in shared hooks and utilities for clean data handling and smooth UI transitions.

## Authentication

The app uses Axios and Zustand for the coach authentication flow. Access tokens only live in Zustand memory and Axios adds them to protected requests. The Axios client attempts `/auth/refresh` when an authenticated request receives a `401`.

Set `VITE_API_BASE_URL` in `.env` when using a different API server; `.env.example` contains the default API URL.

For persistent sessions, the API should set the refresh token in an `HttpOnly`, `Secure` cookie and allow credentialed requests from the frontend origin. The client includes `withCredentials: true`. If the current API only returns `refreshToken` in JSON, it stores that token in `localStorage` as a browser-wide fallback so page refreshes and new tabs can restore the session; it is cleared on sign-out. The access token is never written to browser storage.
