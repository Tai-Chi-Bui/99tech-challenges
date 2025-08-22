# Animal CRUD API Server

A complete CRUD backend server built with ExpressJS, TypeScript, Prisma, and SQLite.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16.0.0
- npm >= 8.0.0

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
# Generate Prisma client
npm run db:generate

# Create database and tables
npm run db:push
```

### 3. Run the Server
```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

## 📍 API Endpoints

- **Base URL**: `http://localhost:3000`
- **API Docs**: `http://localhost:3000/api-docs`
- **Health Check**: `http://localhost:3000/health`

### Animals API
- `POST /api/animals` - Create animal
- `GET /api/animals` - List animals (with filters)
- `GET /api/animals/:id` - Get animal by ID
- `PUT /api/animals/:id` - Update animal
- `DELETE /api/animals/:id` - Delete animal

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push database schema
- `npm run db:studio` - Open Prisma Studio
- `npm run db:reset` - Reset database
- `npm run type-check` - TypeScript type checking
- `npm run swagger:generate` - Generate Swagger docs

## 🗄️ Database

- **Type**: SQLite3
- **ORM**: Prisma
- **Schema**: Located in `prisma/schema.prisma`
- **Studio**: Run `npm run db:studio` to view/edit data

## 🔧 Configuration

Environment variables can be set in `.env` file:
```env
DATABASE_URL="file:./dev.db"
PORT=3000
NODE_ENV=development
```

