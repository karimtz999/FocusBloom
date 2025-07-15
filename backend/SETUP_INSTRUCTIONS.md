🔐 ADMIN BOARD SYSTEM SETUP GUIDE
========================================

## 📍 LOCATION
You are now in the correct directory: `/backend`

## 🎯 ADMIN CREDENTIALS CREATED
Your admin board will use these default credentials:

📧 **Email:** admin@pomodoro.com
🔒 **Password:** admin123456
👑 **Role:** super-admin

## 🚀 HOW TO USE

### 1. **Start MongoDB First**
Make sure MongoDB is running on your system:
```bash
# Windows (if MongoDB is installed as service)
net start MongoDB

# Or manually start mongod
mongod
```

### 2. **Create Super Admin** (from backend directory)
```bash
npm run setup-admin
```

### 3. **Open Admin Manager** (from backend directory)
```bash
npm run admin
```

### 4. **Test Admin Login via API**
Once your server is running, you can test the admin login:

```bash
# Start your server first
npm run build
npm start

# Then in another terminal, test login:
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@pomodoro.com",
    "password": "admin123456"
  }'
```

## 📱 FRONTEND INTEGRATION

You can now create an admin panel in your React Native app that:

1. **Admin Login Screen:**
   - POST to `/api/admin/login`
   - Store the returned JWT token

2. **Admin Dashboard:**
   - GET `/api/admin/dashboard/stats` - System statistics
   - GET `/api/admin/users` - List all users
   - GET `/api/admin/users/:id` - User details

3. **Admin Management (Super Admin only):**
   - GET `/api/admin/admins` - List admins
   - POST `/api/admin/admins` - Create new admin
   - DELETE `/api/admin/admins/:id` - Delete admin

## 🛡️ EXAMPLE API USAGE

### Login Admin:
```javascript
const response = await fetch('http://localhost:5000/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@pomodoro.com',
    password: 'admin123456'
  })
});

const { token, admin } = await response.json();
// Use token for subsequent requests
```

### Get Dashboard Stats:
```javascript
const response = await fetch('http://localhost:5000/api/admin/dashboard/stats', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const { stats } = await response.json();
console.log(stats); // Shows user count, sessions, etc.
```

## ⚡ QUICK TEST STEPS

1. **Navigate to backend:** `cd backend`
2. **Start MongoDB:** Make sure it's running
3. **Create admin:** `npm run setup-admin`  
4. **Test manager:** `npm run admin`
5. **Start server:** `npm start` (in another terminal)
6. **Test API:** Use the curl command above

## 🎉 READY TO GO!

Your admin system is now set up with:
- ✅ Secure authentication
- ✅ Role-based permissions  
- ✅ User management
- ✅ Statistics dashboard
- ✅ Terminal-based admin tools

**Default Admin Credentials:**
- Email: admin@pomodoro.com
- Password: admin123456

Change the password after first login! 🔒
