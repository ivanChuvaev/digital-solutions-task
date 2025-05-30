# Digital Solutions Task

This is a full-stack application consisting of a React frontend and Express.js backend, built as a test task for Digital Solutions company.

## Project Structure

The project is organized as a monorepo using Yarn workspaces:

- `packages/frontend` - React application built with Vite
- `packages/backend` - Express.js server

## Prerequisites

- Node.js (v18 or higher)
- Yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd digital-solutions-task
```

2. Install dependencies:
```bash
yarn install
```

## Development

### Frontend Development

To start the frontend development server:

```bash
yarn workspace frontend dev
```

The frontend will be available at `http://localhost:5173`

### Backend Development

To start the backend server:

```bash
yarn workspace backend start
```

The backend server will be available at `http://localhost:3000`

## Building for Production

To build the frontend for production:

```bash
yarn build
```

The built files will be in the `packages/frontend/dist` directory.

## Available Scripts

### Root Directory
- `yarn build` - Build the frontend application
- `yarn start` - Start the backend server

### Frontend (packages/frontend)
- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn lint` - Run ESLint
- `yarn preview` - Preview production build

### Backend (packages/backend)
- `yarn start` - Start the server
- `yarn test` - Run tests

## Technologies Used

### Frontend
- React
- TypeScript
- Vite
- React Query
- ESLint

### Backend
- Express.js
- Jest (for testing)
- Faker.js (for generating test data)

## Author

Ivan Chuvaev

## License

ISC
