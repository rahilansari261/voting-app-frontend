# VoteApp Frontend

A modern, responsive voting application built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Modern UI/UX**: Clean, responsive design with dark/light mode support
- **Real-time Updates**: Live poll results and notifications
- **Authentication**: Secure user registration and login
- **Poll Management**: Create, edit, and manage polls
- **Voting Interface**: Intuitive voting with multiple choice support
- **Results Visualization**: Beautiful charts and analytics
- **Mobile Responsive**: Optimized for all device sizes

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Real-time**: Socket.io
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

3. Update the environment variables in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   ├── polls/            # Polls pages
│   └── layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── auth/             # Authentication components
│   ├── polls/            # Poll-related components
│   ├── layout/           # Layout components
│   └── ui/               # shadcn/ui components
├── hooks/                # Custom React hooks
├── services/             # API services
├── store/                # Zustand stores
├── types/                # TypeScript type definitions
└── lib/                  # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Features Overview

### Authentication
- User registration and login
- JWT token-based authentication
- Protected routes
- User profile management

### Poll Management
- Create polls with multiple options
- Set poll duration and visibility
- Support for single and multiple choice
- Anonymous voting option
- Real-time poll status updates

### Voting Interface
- Intuitive voting interface
- Real-time vote counting
- Results visualization
- Vote confirmation

### Dashboard
- User statistics
- Poll management
- Recent activity
- Quick actions

## API Integration

The frontend integrates with a REST API for:
- User authentication
- Poll CRUD operations
- Voting functionality
- Real-time updates via WebSocket

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
