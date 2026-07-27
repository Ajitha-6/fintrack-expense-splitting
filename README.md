# FinTrack - Expense Splitting Application

## Overview
FinTrack is a fintech application for managing shared expenses and calculating balances between users. Built with AI-assisted development using GitHub Copilot.

## Features
- **Transaction Management**: Create, retrieve, and manage financial transactions
- **Expense Splitting**: Split expenses among multiple users with balance calculations
- **User Management**: User registration and authentication
- **Balance Tracking**: Real-time balance calculations for shared expenses
- **Audit Trail**: Complete transaction history and modifications

## Tech Stack
- Node.js v18+
- Express.js
- TypeScript
- PostgreSQL
- TypeORM
- Jest (Testing)

## Setup Instructions

### Prerequisites
- Node.js v18 or higher
- PostgreSQL v13 or higher
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Build TypeScript
npm run build

# Start development server
npm run dev
```

## Testing
```bash
npm test
npm run test:coverage
```

## Architecture

The application follows a layered architecture:
- **Controllers**: Handle HTTP requests
- **Services**: Implement business logic
- **Repositories**: Manage data access
- **Entities**: Define database models

## Development with GitHub Copilot
This project was developed using GitHub Copilot. See `.github/copilot-instructions.md` for development standards and guidelines.
