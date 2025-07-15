# 🌐 MONGODB ATLAS SETUP GUIDE

## Option 1: Local MongoDB Installation

### Windows Installation:
1. Go to: https://www.mongodb.com/try/download/community
2. Download MongoDB Community Server
3. Install with default settings
4. Start the service:
   ```bash
   net start MongoDB
   ```

## Option 2: MongoDB Atlas (Cloud - Recommended)

### Step 1: Create Free Atlas Account
1. Go to: https://www.mongodb.com/atlas
2. Sign up for free account
3. Create a new cluster (select free tier)

### Step 2: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string (looks like):
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/pomodoro_db?retryWrites=true&w=majority
   ```

### Step 3: Update Your .env File
Replace your current MONGO_URI in `.env`:
```bash
# Replace with your Atlas connection string
MONGO_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/pomodoro_db?retryWrites=true&w=majority
```

### Step 4: Whitelist Your IP
1. In Atlas dashboard, go to "Network Access"
2. Click "Add IP Address"
3. Choose "Allow access from anywhere" (for development)

## Option 3: Use Docker (If you have Docker installed)

```bash
# Run MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Check if running
docker ps
```

## 🚀 Quick Test Commands

After setting up MongoDB, test with:

```bash
# Test connection
npm run setup-admin

# Use admin manager
npm run admin
```

## 💡 Recommended: MongoDB Atlas

For easiest setup, use MongoDB Atlas (free cloud database):
1. No local installation needed
2. Always available
3. Free tier available
4. Automatic backups

Choose the option that works best for your setup!
