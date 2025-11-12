# 🔐 Default Admin Credentials

## Production Admin Account

After deploying to Render.com, you can log in immediately with:

```
Email:    admin@company.com
Password: admin123
```

## Account Details

- **Employee ID**: ADMIN001
- **Name**: System Administrator
- **Role**: Administrator (full access)
- **Diamond Balance**: 0

## Security Notice

⚠️ **CRITICAL**: This is a default account for initial setup only.

**You MUST change the password after first login!**

To change the password:
1. Log in with the default credentials
2. Go to Profile/Settings
3. Update your password immediately

## For Development

If you need to reset or recreate the admin user locally:

```bash
# Remove database
rm lib/db/copilot-demo.db*

# Reinitialize (will create admin user)
npm run db:init
```

## Adding More Users

After logging in as admin, you can:
- Create invitation codes
- Register new employees via `/register` page with invitation codes
- Manage user roles and permissions

---

**Remember**: Never commit or share production credentials publicly!
