# Docker Setup Guide for UNotes

This guide explains the Docker configuration for the UNotes full-stack application.

---

## 📦 **Overview**

The UNotes project uses Docker to containerize both the frontend (React) and backend (Express.js + OpenAI) into portable, production-ready containers.

**Three Main Docker Files:**
1. `backend/Dockerfile` - Backend API containerization
2. `interface/Dockerfile` - Frontend React app containerization  
3. `docker-compose.yml` - Orchestrates both services together

---

## 🐳 **1. Backend Dockerfile (`backend/Dockerfile`)**

### **Purpose:**
Packages your **Express.js backend** into a container that can run anywhere.

### **Functionality:**
- **Isolates the backend** - Runs in its own environment with Node.js 20
- **Makes it portable** - Works on any system (Windows, Mac, Linux, cloud servers)
- **Handles dependencies** - Automatically installs all npm packages
- **Exposes API** - Makes port 5000 available for HTTP requests
- **Self-monitoring** - Health check ensures the server is responding
- **Production-ready** - Only includes necessary files, no development tools

### **What Happens When You Run It:**
```
1. Creates a Linux container with Node.js 20
2. Copies package.json and installs dependencies
3. Copies your backend code (server.js, endpoints, etc.)
4. Starts Express server on port 5000
5. Every 30 seconds, checks if server is alive
6. If unhealthy, Docker can restart it automatically
```

### **Code Breakdown:**

```dockerfile
FROM node:20-alpine
```
- Uses **Alpine Linux** - smallest, most secure Node.js image (~150MB)
- Based on **Node.js 20** LTS version

```dockerfile
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
```
- Sets working directory to `/app`
- Copies `package.json` and `package-lock.json` first (Docker layer caching optimization)
- `npm ci` installs exact versions from lock file (faster, more reliable than npm install)
- `--only=production` skips devDependencies (smaller image size)

```dockerfile
COPY . .
EXPOSE 5000
```
- Copies all application code
- Exposes port 5000 (where Express server runs)

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3
```
- Docker checks if app is healthy every 30 seconds
- Makes HTTP request to `/` endpoint
- If fails 3 times, container marked unhealthy (can trigger auto-restart)

```dockerfile
ENV NODE_ENV=production
CMD ["node", "server.js"]
```
- Sets production environment
- Starts the Express server

### **Use Case:**
Instead of: *"Install Node 20, clone repo, npm install, set env vars, run server"*  
You say: *"Run `docker build -t backend .` and `docker run -p 5000:5000 backend`"*

---

## 🌐 **2. Frontend Dockerfile (`interface/Dockerfile`)**

### **Purpose:**
Takes your **React app**, builds it into static files, and serves them with **Nginx web server**.

### **Functionality:**
- **Builds your React app** - Runs `npm run build` to create optimized production files
- **Throws away build tools** - Multi-stage build keeps only the final HTML/CSS/JS
- **Serves with Nginx** - Fast, lightweight web server (better than Node for static files)
- **Optimizes delivery** - Gzip compression, caching, security headers
- **Handles SPA routing** - All routes redirect to index.html (React Router works)
- **Super small** - Final image is ~25MB vs 500MB if you kept Node

### **What Happens When You Run It:**

**Stage 1 (Build):**
```
1. Creates container with Node.js
2. Installs dependencies (including dev tools)
3. Runs npm run build
4. Creates /app/build folder with optimized files
```

**Stage 2 (Production):**
```
5. Creates NEW container with only Nginx
6. Copies built files from Stage 1
7. Discards Node.js, npm, source code
8. Configures Nginx to serve files
9. Starts web server on port 80
```

### **Code Breakdown:**

#### **Stage 1: Build**
```dockerfile
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
```
- Temporary build environment named "build"
- Installs ALL dependencies (including dev)
- Runs React build → creates optimized static files in `/build`

#### **Stage 2: Production**
```dockerfile
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```
- Starts fresh with just Nginx web server (~25MB)
- Doesn't include Node.js or build tools
- Copies ONLY the built files from Stage 1
- Uses custom Nginx configuration

### **Use Case:**
Nginx is 100x better at serving static files than Node.js. This creates a production-grade web server that:
- Loads pages faster (compression enabled)
- Handles more traffic (Nginx is optimized)
- More secure (no unnecessary tools)

---

## 📝 **Nginx Configuration (`interface/nginx.conf`)**

### **Purpose:**
Configures the Nginx web server for optimal React app delivery.

### **Key Features:**

```nginx
gzip on;
gzip_types text/plain text/css application/json...
```
- **Compression** - Makes files 70% smaller → faster page loads

```nginx
add_header X-Frame-Options "SAMEORIGIN"
add_header X-Content-Type-Options "nosniff"
add_header X-XSS-Protection "1; mode=block"
```
- **Security headers** - Prevents clickjacking, XSS attacks, content-type sniffing

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```
- **SPA routing** - All routes serve `index.html`
- React Router handles navigation client-side

```nginx
location /static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```
- **Static asset caching** - Browser caches for 1 year
- Faster subsequent loads (CSS, JS, images)

```nginx
location /api/ {
    proxy_pass http://backend:5000/api/;
}
```
- **API proxy** - Forwards API requests to backend container
- Avoids CORS issues
- Single domain for frontend + backend

---

## 🔗 **3. Docker Compose (`docker-compose.yml`)**

### **Purpose:**
**Coordinates both frontend and backend** to work together as one application.

### **Functionality:**
- **Manages multiple containers** - Backend + Frontend running simultaneously
- **Creates private network** - Containers can talk to each other by name
- **Handles dependencies** - Starts backend first, then frontend
- **Configures environment** - Sets NODE_ENV, API keys, ports
- **Auto-restart** - If backend crashes, Docker brings it back up
- **Single command deployment** - `docker-compose up` starts everything

### **What Happens When You Run `docker-compose up`:**

```
1. Creates "unotes-network" (private network)
   ↓
2. Builds backend image from backend/Dockerfile
   ↓
3. Builds frontend image from interface/Dockerfile
   ↓
4. Starts backend container:
   - Name: backend
   - Port: 5000
   - Has OPENAI_API_KEY
   - Runs health checks
   ↓
5. Waits for backend to be healthy
   ↓
6. Starts frontend container:
   - Name: frontend
   - Port: 80
   - Can reach backend at http://backend:5000
   ↓
7. You access: http://localhost
   ↓
8. Nginx serves React app
   ↓
9. React makes API calls to /api/
   ↓
10. Nginx proxies to http://backend:5000/api/
    ↓
11. Backend processes and returns data
```

### **Service Configuration:**

#### **Backend Service:**
```yaml
backend:
  build: ./backend
  ports:
    - "5000:5000"
  environment:
    - NODE_ENV=production
    - OPENAI_API_KEY=${OPENAI_API_KEY}
  volumes:
    - ./backend:/app
    - /app/node_modules
  restart: unless-stopped
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:5000/"]
```

**Explanation:**
- `ports` - Maps host port 5000 to container port 5000
- `environment` - Sets env variables (reads from `.env` file)
- `volumes` - Mounts code (excludes node_modules for performance)
- `restart` - Auto-restart on crashes or server reboot
- `healthcheck` - Monitors if server is responding

#### **Frontend Service:**
```yaml
frontend:
  build: ./interface
  ports:
    - "80:80"
  depends_on:
    - backend
  restart: unless-stopped
  environment:
    - REACT_APP_API_URL=http://backend:5000
```

**Explanation:**
- `ports` - Maps host port 80 to container port 80
- `depends_on` - Waits for backend before starting
- Container can reach backend using hostname `backend`

#### **Network:**
```yaml
networks:
  default:
    name: unotes-network
```
- Creates custom network named `unotes-network`
- Containers communicate using service names as hostnames

### **Use Case:**
Without docker-compose, you'd need to:
- Build both images separately
- Create a network manually
- Start backend with correct ports and env vars
- Start frontend with correct config
- Link them together

With docker-compose: **`docker-compose up`** ✅

---

## 🚀 **Usage Commands**

### **Production Deployment:**

```bash
# Build and start all services
docker-compose up --build

# Run in background (detached mode)
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Restart a specific service
docker-compose restart backend

# Scale backend (run multiple instances)
docker-compose up --scale backend=3

# Check container status
docker-compose ps

# View resource usage
docker stats
```

### **Development with Hot Reload:**

For development, use `docker-compose.dev.yml`:

```bash
# Start with hot reload enabled
docker-compose -f docker-compose.dev.yml up

# Rebuild after dependency changes
docker-compose -f docker-compose.dev.yml up --build

# Run in background
docker-compose -f docker-compose.dev.yml up -d

# Stop
docker-compose -f docker-compose.dev.yml down
```

### **Individual Container Commands:**

```bash
# Build backend only
docker build -t unotes-backend ./backend

# Run backend standalone
docker run -p 5000:5000 --env-file backend/.env unotes-backend

# Build frontend only
docker build -t unotes-frontend ./interface

# Run frontend standalone
docker run -p 80:80 unotes-frontend

# Execute command in running container
docker exec -it <container_id> sh

# View container logs
docker logs <container_id>

# Inspect container
docker inspect <container_id>
```

---

## 🎯 **Real-World Deployment Example**

### **Scenario: Deploying to a Server**

#### **Without Docker:**
```bash
ssh user@server
sudo apt install nodejs npm nginx
git clone repo
cd backend && npm install
# Configure nginx manually
# Set up process manager (pm2)
# Configure firewall
# Set up SSL
# ... 2 hours later ...
```

#### **With Docker:**
```bash
ssh user@server
git clone repo
cd repo
docker-compose up -d
# Done! 30 seconds ✅
```

---

## 📊 **What Each File Solves**

| File | Problem it Solves | Benefit |
|------|------------------|---------|
| `backend/Dockerfile` | "Backend won't run on different computers" | Works identically everywhere |
| `interface/Dockerfile` | "Frontend build is 500MB and slow" | 25MB, fast, production-optimized |
| `docker-compose.yml` | "Setting up frontend + backend is complex" | One command starts everything |

---

## 🔒 **Security Features**

The Docker setup includes multiple security layers:

1. **Alpine Linux** - Minimal attack surface (smaller = fewer vulnerabilities)
2. **Production dependencies only** - No dev tools in production image
3. **Multi-stage builds** - No build artifacts in final image
4. **Health checks** - Auto-recovery from failures
5. **Nginx security headers** - Protection against XSS, clickjacking
6. **Environment isolation** - Containers can't access host system files
7. **Network isolation** - Private network between containers

---

## 💡 **Best Practices Implemented**

✅ **Layer caching** - `package.json` copied before code (faster rebuilds)  
✅ **Multi-stage builds** - Smaller frontend image (25MB vs 500MB)  
✅ **Alpine images** - Minimal size and attack surface  
✅ **Health checks** - Self-healing containers  
✅ **Named networks** - Better container communication  
✅ **Volume exclusions** - Faster performance (`/app/node_modules`)  
✅ **Environment separation** - Dev vs Prod configs  
✅ **Restart policies** - Auto-recovery from crashes  

---

## 🔄 **Development vs Production**

| Feature | Development | Production |
|---------|------------|------------|
| **File** | `docker-compose.dev.yml` | `docker-compose.yml` |
| **Node ENV** | development | production |
| **Hot Reload** | ✅ Enabled | ❌ Disabled |
| **Volumes** | Code mounted | No volumes |
| **Dependencies** | All (dev + prod) | Production only |
| **Frontend** | React dev server | Nginx static files |
| **Backend** | Nodemon | Node directly |
| **Size** | Larger | Optimized |
| **Speed** | Slower | Faster |

---

## 📦 **Benefits Summary**

### **With Docker:**
- ✅ **Consistency** - "Works on my machine" → "Works everywhere"
- ✅ **Portability** - Deploy to AWS, Google Cloud, DigitalOcean, anywhere
- ✅ **Isolation** - No conflicts with other projects
- ✅ **Speed** - One command deployment
- ✅ **Scaling** - Easy horizontal scaling
- ✅ **Rollback** - Instant rollback to previous version
- ✅ **Resource efficiency** - Containers share OS kernel

### **Without Docker:**
- ❌ Manual Node.js installation
- ❌ Dependency conflicts
- ❌ Environment inconsistencies
- ❌ Complex server setup
- ❌ Hard to scale
- ❌ No isolation

---

## 🎓 **Think of it Like:**

- **`backend/Dockerfile`** = Recipe for cooking the backend dish
- **`interface/Dockerfile`** = Recipe for cooking the frontend (with 2 cooking stages)
- **`docker-compose.yml`** = Menu that says "make both dishes and serve together"

---

## 🚀 **Quick Start**

### **1. Install Docker**
```bash
# Check if installed
docker --version
docker-compose --version

# Install on Ubuntu
sudo apt update
sudo apt install docker.io docker-compose

# Install on Mac/Windows
# Download Docker Desktop from docker.com
```

### **2. Set Environment Variables**
Create `backend/.env`:
```env
PORT=5000
OPENAI_API_KEY=your_actual_api_key_here
NODE_ENV=production
```

### **3. Run the Application**
```bash
# Production
docker-compose up -d

# Development with hot reload
docker-compose -f docker-compose.dev.yml up
```

### **4. Access the App**
- Frontend: http://localhost
- Backend API: http://localhost:5000

### **5. Stop the Application**
```bash
docker-compose down
```

---

## 🐛 **Troubleshooting**

### **Port Already in Use**
```bash
# Find process on port 5000
lsof -ti:5000

# Kill it
kill -9 <PID>
```

### **Container Won't Start**
```bash
# View logs
docker-compose logs backend

# Check container status
docker-compose ps

# Restart
docker-compose restart backend
```

### **Image Build Fails**
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

### **Backend Can't Connect to OpenAI**
- Check `OPENAI_API_KEY` in `backend/.env`
- Verify API key is valid at platform.openai.com
- Check backend logs: `docker-compose logs backend`

---

## 📚 **Additional Resources**

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

---

## 🎉 **Conclusion**

This Docker setup makes your UNotes application:
- **Portable** - Run anywhere Docker is installed
- **Scalable** - Easy to scale horizontally
- **Production-ready** - Optimized, secure, monitored
- **Developer-friendly** - One command to start everything
- **Professional** - Industry-standard deployment approach

The three Docker files work together to provide a complete, containerized full-stack application! 🚀
