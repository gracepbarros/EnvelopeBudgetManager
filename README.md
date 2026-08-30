# Envelope Budget Manager

A personal budgeting application based on the envelope budgeting method, designed to help organize income, planned spending, savings, and household expenses.

**Live Demo:** https://gracepbarros.github.io/EnvelopeBudgetManager/

## About the Project

Envelope Budget Manager is an evolution of my original **ReactBudgetManager** project.

The original application was created as a simple React budget tracker where users could create spending categories, define maximum budgets, and record expenses using browser `localStorage`.

This version is being redesigned around a more practical envelope budgeting system.

Instead of treating each category as a spending limit, the goal is to allow users to allocate money they actually have into different envelopes and track how that money is used over time.

## Current Version

The application currently supports the functionality inherited from the original project:

* Create budget categories
* Set spending limits
* Add expenses
* Edit expenses
* View expenses by category
* Store data locally in the browser
* Responsive interface using Bootstrap

The project has also been migrated from **Create React App to Vite** as the first step in modernizing the application.

## Current Tech Stack

* React
* JavaScript
* Vite
* Bootstrap
* React Bootstrap
* LocalStorage
* GitHub Pages

## Planned Features

The application will progressively move from a simple budget tracker to an envelope-based budgeting system.

Planned features include:

* Envelope-based money allocation
* Income tracking
* Budget cycles based on pay periods
* Expense dates and transaction history
* Envelope rollover between cycles
* Resettable spending categories
* Savings and sinking funds
* Credit card expense tracking
* Persistent database storage
* Backend REST API
* User authentication
* Automated tests
* Improved reporting and financial history

## Planned Architecture

The current version is a client-side React application using `localStorage`.

The planned architecture is:

```text
React + Vite
      ↓
REST API
      ↓
Node.js + Fastify
      ↓
Prisma
      ↓
PostgreSQL
```

The backend and database have not yet been implemented.

## Development Roadmap

### Phase 1 — Foundation

* [x] Preserve the original project as a separate repository
* [x] Create the new Envelope Budget Manager repository
* [x] Configure GitHub Pages deployment
* [x] Migrate from Create React App to Vite
* [x] Establish project documentation

### Phase 2 — Envelope Budgeting

* [ ] Replace the current budget-limit model with envelopes
* [ ] Add money allocations
* [ ] Add income tracking
* [ ] Add transaction dates
* [ ] Calculate available envelope balances

### Phase 3 — Budget Cycles

* [ ] Create pay-period budget cycles
* [ ] Close and archive completed cycles
* [ ] Support resettable envelopes
* [ ] Support rollover envelopes
* [ ] Preserve historical financial data

### Phase 4 — Full-Stack Application

* [ ] Create a Node.js backend
* [ ] Build a REST API with Fastify
* [ ] Add PostgreSQL
* [ ] Add Prisma ORM
* [ ] Replace browser-only storage with persistent database storage
* [ ] Add authentication

### Phase 5 — Additional Features

* [ ] Credit card tracking
* [ ] Recurring expenses
* [ ] Savings goals and sinking funds
* [ ] Financial reports
* [ ] Automated testing
* [ ] Production full-stack deployment

## Project Motivation

This project began as a learning exercise in React and later became an opportunity to redesign a real application around practical personal-finance requirements.

The goal of the project is not only to build a working budgeting tool, but also to document the process of evolving an existing frontend application into a structured full-stack system.

The development history intentionally preserves this progression through small, descriptive Git commits and incremental architectural changes.

## Original Project

The original version of this application is available at:

**ReactBudgetManager**
https://github.com/gracepbarros/ReactBudgetManager

It represents the initial React and `localStorage` implementation from which this project evolved.

## Status

**Active development**

The application is currently being redesigned. Some functionality described in the roadmap is not yet available in the live version.
