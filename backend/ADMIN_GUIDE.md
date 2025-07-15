# 🔐 POMODORO ADMIN SYSTEM

## 📋 Admin Management System Created!

Your Pomodoro app now has a complete admin management system with terminal-based tools and API endpoints.

## 🚀 Quick Start

### 1. **Create Your First Super Admin**
```bash
npm run setup-admin
```
This creates a default super admin with:
- 📧 Email: `admin@pomodoro.com`
- 🔒 Password: `admin123456`

### 2. **Use Admin Management Tool**
```bash
npm run admin
```
This opens an interactive menu to:
- ✅ Create new admin users
- 📋 List all admins
- 👥 View regular users
- 🗑️ Delete admins
- 🔐 Verify credentials
- 📊 Show statistics

## 🛡️ Admin Roles

### **Super Admin** 👑
- Create/delete other admins
- View all system data
- Full access to all endpoints

### **Regular Admin** 🛡️
- View users and sessions
- Access dashboard statistics
- Cannot manage other admins

## 📡 API Endpoints

### **Authentication**
```
POST /api/admin/login
GET  /api/admin/profile
```

### **Dashboard**
```
GET /api/admin/dashboard/stats    # System statistics
GET /api/admin/users             # List all users (paginated)
GET /api/admin/users/:userId     # User details with sessions
```

### **Admin Management** (Super Admin Only)
```
GET    /api/admin/admins              # List all admins
POST   /api/admin/admins              # Create new admin
PATCH  /api/admin/admins/:id/toggle-status  # Activate/deactivate
DELETE /api/admin/admins/:id          # Delete admin
```

## 🔑 Authentication Headers

For admin API calls, use:
```
Authorization: Bearer <admin_jwt_token>
```

## 💻 Terminal Commands

```bash
# Create initial super admin
npm run setup-admin

# Open admin management menu
npm run admin

# Alternative command
npm run create-admin
```

## 📊 Example Admin Login Response

```json
{
  "message": "Admin login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "Super Admin",
    "email": "admin@pomodoro.com",
    "role": "super-admin"
  }
}
```

## 🔒 Security Features

- ✅ Password hashing with bcrypt (12 rounds)
- ✅ JWT token authentication (24h expiration)
- ✅ Role-based access control
- ✅ Account activation/deactivation
- ✅ Unique email validation
- ✅ Strong password requirements (8+ chars)

## 📱 Frontend Integration

You can now create an admin panel in your React Native app that:
1. Logs in admins via `/api/admin/login`
2. Shows dashboard statistics
3. Lists and manages users
4. Super admins can manage other admins

## ⚡ Quick Test

1. Start your MongoDB server
2. Run: `npm run setup-admin`
3. Run: `npm run admin`
4. Choose option "5" to verify credentials
5. Use email: `admin@pomodoro.com` and password: `admin123456`

## 🛠️ Files Created

- `src/models/Admin.ts` - Admin user model
- `src/routes/adminRoutes.ts` - Admin API endpoints
- `src/scripts/adminManager.js` - Interactive admin management
- `src/scripts/createSuperAdmin.js` - Initial setup script

Your admin system is ready to use! 🎉
