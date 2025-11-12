# Render.com Deployment Guide

## 🚀 Automatic Database Initialization

The application now automatically initializes the database during the build process. No manual setup is required!

## Default Admin Account

A default admin account is automatically created on first deployment:

- **Email**: `admin@company.com`
- **Password**: `admin123`
- **Role**: Administrator

⚠️ **IMPORTANT**: Change this password immediately after first login for security!

## Build Configuration for Render.com

### Build Command
```bash
npm run build
```

This will:
1. Initialize the database schema (create tables)
2. Create default admin user
3. Build the Next.js application

### Start Command
```bash
npm run start
```

## Database Information

- **Type**: SQLite (better-sqlite3)
- **Location**: `lib/db/copilot-demo.db`
- **Auto-initialization**: ✅ Enabled during build

The database will be created with all necessary tables on first build. The app is ready to use immediately after deployment.

## Optional: Seed Test Data

If you want to add test data for development/demo purposes, you can run:

```bash
npm run db:seed
```

**Note**: This is optional and should only be used for testing. Production deployments should start with an empty database.

## Environment Variables

No environment variables are required for basic operation. The app uses SQLite which is embedded.

## Troubleshooting

If you encounter database errors:

1. **"no such table: employees"**: The database initialization failed during build
   - Solution: Check build logs to ensure `db:init` ran successfully
   - Manually run: `npm run db:init`

2. **Database locked errors**: Multiple build processes trying to access the database
   - Solution: Ensure only one build process runs at a time

## Manual Database Commands

- **Initialize only** (create tables): `npm run db:init`
- **Full setup** (create tables + seed data): `npm run db:setup`
- **Seed data only**: `npm run db:seed`

## ✅ Verification

After deployment, verify the application works by:

1. Visiting your Render URL
2. Navigating to `/register`
3. Creating a new account
4. Logging in

The database is working correctly if you can register and log in successfully.
