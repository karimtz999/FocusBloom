# 🐘 POSTGRESQL SETUP GUIDE

## Quick Start Options

### Option 1: PostgreSQL locally (Recommended for Development)

#### Windows Installation:
1. **Download PostgreSQL:**
   - Go to: https://www.postgresql.org/download/windows/
   - Download PostgreSQL installer (version 14 or higher)
   - Run installer with default settings
   - **Remember the password you set for the 'postgres' user!**

2. **Create Database:**
   ```bash
   # Open Command Prompt as Administrator
   psql -U postgres
   # Enter your postgres password when prompted
   
   # In psql prompt:
   CREATE DATABASE pomodoro_db;
   \q
   ```

3. **Update .env file:**
   ```bash
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/pomodoro_db?schema=public"
   ```

#### macOS Installation:
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql
createdb pomodoro_db
```

#### Linux Installation:
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo -u postgres createdb pomodoro_db

# CentOS/RHEL
sudo yum install postgresql postgresql-server
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo -u postgres createdb pomodoro_db
```

### Option 2: PostgreSQL Cloud (Heroku Postgres, AWS RDS, etc.)

#### Heroku Postgres (Free Tier):
1. Create Heroku account: https://heroku.com
2. Install Heroku CLI
3. Create app: `heroku create your-app-name`
4. Add PostgreSQL: `heroku addons:create heroku-postgresql:mini`
5. Get DATABASE_URL: `heroku config:get DATABASE_URL`

#### Supabase (Free Tier):
1. Go to: https://supabase.com
2. Create new project
3. Get connection string from Settings > Database
4. Update .env with the connection string

### Option 3: Docker (If you have Docker)

```bash
# Run PostgreSQL in Docker
docker run --name pomodoro-postgres \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=pomodoro_db \
  -p 5432:5432 \
  -d postgres:14

# Check if running
docker ps
```

## Setting Up the Database

### 1. Install Dependencies (Already Done)
```bash
npm install prisma @prisma/client pg @types/pg tsx
```

### 2. Generate Prisma Client
```bash
npm run db:generate
```

### 3. Run Database Migrations
```bash
npm run db:migrate
```

### 4. Create Super Admin
```bash
npm run setup-admin
```

### 5. Start the Server
```bash
npm run dev
```

## Database Management Commands

```bash
# Generate Prisma client
npm run db:generate

# Create and apply migration
npm run db:migrate

# Deploy migrations (production)
npm run db:deploy

# Reset database (development only)
npm run db:reset

# Open Prisma Studio (database GUI)
npm run db:studio

# Admin management
npm run admin
```

## Connection String Examples

### Local PostgreSQL:
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/pomodoro_db?schema=public"
```

### Heroku:
```bash
DATABASE_URL="postgresql://user:password@host:5432/database"
```

### Supabase:
```bash
DATABASE_URL="postgresql://postgres:password@db.projectid.supabase.co:5432/postgres"
```

## Testing the Setup

1. **Test database connection:**
   ```bash
   npm run db:generate
   ```

2. **Run migrations:**
   ```bash
   npm run db:migrate
   ```

3. **Create super admin:**
   ```bash
   npm run setup-admin
   ```

4. **Start server:**
   ```bash
   npm run dev
   ```

5. **Test admin system:**
   ```bash
   npm run admin
   ```

## Troubleshooting

### Common Issues:

1. **Connection refused:**
   - Make sure PostgreSQL is running
   - Check if port 5432 is correct
   - Verify username/password

2. **Database doesn't exist:**
   ```bash
   createdb pomodoro_db
   ```

3. **Permission denied:**
   ```bash
   # Grant permissions
   psql -U postgres
   GRANT ALL PRIVILEGES ON DATABASE pomodoro_db TO your_user;
   ```

4. **Migration errors:**
   ```bash
   npm run db:reset  # CAUTION: This will delete all data
   npm run db:migrate
   ```

## Migration from MongoDB

Your app has been successfully converted from MongoDB to PostgreSQL:

✅ **Completed:**
- ✅ Prisma ORM setup
- ✅ Database schema (User, PomodoroSession, Admin)
- ✅ Updated all routes and services
- ✅ New admin management system
- ✅ TypeScript support with proper types

✅ **Benefits:**
- 🚀 Better performance and reliability
- 🔒 ACID compliance and data integrity
- 🛠️ Better tooling (Prisma Studio)
- 📊 Advanced querying capabilities
- 🔧 Easier backup and maintenance

## Next Steps

1. Choose and set up PostgreSQL (local or cloud)
2. Update DATABASE_URL in .env
3. Run migrations: `npm run db:migrate`
4. Create super admin: `npm run setup-admin`
5. Test the system: `npm run admin`
6. Start developing: `npm run dev`

Need help? Check the logs for specific error messages and refer to this guide!
