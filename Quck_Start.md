
## 🎨 Frontend Deployment on Ubuntu VM

# Method-1
### _Build on VM_
### Step 1: Connect to Frontend VM

```bash
# SSH into your frontend VM
ssh user@your-frontend-vm-ip
```

### Step 2: Install Node.js, If you want to build on your VM.

```bash
# Update packages
sudo apt update

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.8.x
```

### Step 3: Transfer Frontend Code

**Option A: Using SCP (from Windows)**
```powershell
scp -r "E:\path\to\your-project" user@frontend-vm-ip:/home/user/
```

**Option B: Using Git (on VM)**
```bash
cd /home/user
git clone <your-repo-url>
```

### Step 4: Install Dependencies

```bash
# Navigate to project root
cd /home/user/your-project

# Install dependencies
npm install
```

### Step 5: Configure Frontend Environment

```bash
# Create .env file in project root
nano .env
```

**Add this:**
```env
VITE_API_URL=http://YOUR-BACKEND-VM-IP:8000
VITE_ENVIRONMENT=production
```

**Save:** `Ctrl+S`and `Ctrl+X`

### Step 6: Build Frontend

```bash
# Build production files
npm run build
```

**Expected Output:**
```
vite v5.0.0 building for production...
✓ built in 15.23s
```

This creates `client/dist/public/` folder with production files.

### Step 7: Install and Configure Nginx

```bash
# Install Nginx
sudo apt install -y nginx
sudo rm -rf /var/www/html/*

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/default

    #  Create Nginx configuration to another folder , if you want to deploy your site to another folder than default
    # sudo nano /etc/nginx/sites-available/ritesh
```

## Run this command on your Frontend VM:


```bash
sudo bash << 'EOF'
cat > /etc/nginx/sites-available/default << 'NGINX'
upstream backend_api {
    server <insert_Here_Backend_VM_pip>:8000 fail_timeout=0;
    keepalive 32;
}
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    client_max_body_size 10M;
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
        add_header Pragma "no-cache" always;
        add_header Expires "0" always;
    }
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /var/www/html;
        expires 30d;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
    location /api/ {
        proxy_pass http://backend_api;                               
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $server_name;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_cache_bypass $http_upgrade;
        proxy_redirect off;
        proxy_connect_timeout 10s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
NGINX
nginx -t && systemctl restart nginx && echo "✅ nginx fixed!"
EOF
```
## Copy-paste this entire block. It will:
    Create clean nginx config ✓  
    Test it ✓  
    Restart nginx ✓  
    Then refresh /resources — 404 will be gone! 🎉

**Important:** Replace `/home/ritesh/your-project` with your actual path!

**Save:** `Ctrl+X`, then `Y`, then `Enter`

### Step 8: Enable Nginx Site

```bash
# Create symbolic link , if you deployed your site to another folder then default...
sudo ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/
        # sudo ln -s /etc/nginx/sites-available/ritesh /etc/nginx/sites-enabled/  

# Test Nginx configuration
sudo nginx -t

# Should show: nginx: configuration file /etc/nginx/nginx.conf test is successful

# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx on boot
sudo systemctl enable nginx
```

# Method-2
### _Build on Local and then deploy artifacts to VM_
###  Go to your Frontend code folder

### Step 1: Configure Frontend Environment

```bash
# edit .env file that is present in your frontend project folder

Update this with your backend pip:-  
VITE_API_URL=http://YOUR-BACKEND-VM-IP:8000
VITE_ENVIRONMENT=production

for example:-
        VITE_API_URL=http://74.234.94.110:8000
        VITE_ENVIRONMENT=production
```
### Step 2: Install Dependencies 

```bash
# Build npm_module folder
npm install
```

### Step 2: Build Frontend

```bash
# Build production files
npm run build
```

**Expected Output:**
```
vite v5.0.0 building for production...
✓ built in 15.23s
```

This creates `frontend_code_folder/dist/public/` folder with production files.

### Step 3: Transfer artifacts to frontend's VM

**Using SCP (from Windows)**
```powershell
scp -r "E:\path\to\your-project\dist\public\" user@frontend-vm-ip:"~/"
```

### Step 4: Transfer Artifacts form User Home Directory to your site's folder... I will take it as default folder i.e. /var/www/html/

**In your Frontend Vm**
```powershell
# First remove default artifacts that is present our default (/var/www/html/) folder
sudo rm -rf /var/www/html/*

# Go to user Home Directory , where we have our artifacts. that comes from scp step
cd ~

# Move our artifacts to our default site's folder
sudo mv * /var/www/html/
        # sudo mv ~/dist/public/* /var/www/html/
```
### Step 5: Install and Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/default
```
## Run this command on your Frontend VM:

```bash
sudo bash << 'EOF'
cat > /etc/nginx/sites-available/default << 'NGINX'
upstream backend_api {
    server <insert_Here_Backend_VM_pip>:8000 fail_timeout=0;
    keepalive 32;
}
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    client_max_body_size 10M;
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
        add_header Pragma "no-cache" always;
        add_header Expires "0" always;
    }
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /var/www/html;
        expires 30d;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
    location /api/ {
        proxy_pass http://backend_api;                               
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $server_name;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_cache_bypass $http_upgrade;
        proxy_redirect off;
        proxy_connect_timeout 10s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
NGINX
nginx -t && systemctl restart nginx && echo "✅ nginx fixed!"
EOF
```
## Copy-paste this entire block. It will:
    Create clean nginx config ✓  
    Test it ✓  
    Restart nginx ✓  
    Then refresh /resources — 404 will be gone! 🎉

**Important:** Replace `/home/ritesh/your-project` with your actual path!

**Save:** `Ctrl+S` then `Ctrl+X`

### Step 8: Enable Nginx Site, If you made another site then default

```bash
# Create symbolic link , if you deployed your site to another folder then default...
sudo ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/
    # sudo ln -s /etc/nginx/sites-available/ritesh /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Should show: nginx: configuration file /etc/nginx/nginx.conf test is successful

# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx on boot
sudo systemctl enable nginx
```



### Step 9: Configure Firewall

```bash
# Allow port 5000
sudo ufw allow 5000/tcp

# Check status
sudo ufw status
```

### Step 10: Test Frontend Access

**From your Windows laptop browser:**

Open: `http://YOUR-FRONTEND-VM-IP:5000`

You should see: **"Frontend is Working! 🎉"**

✅ **Frontend Deployment Complete!**

---


## 🎯 **Next Steps**

### **Choose Your Journey:**

1. **👉 [Start with Frontend →](https://github.com/Riteshatri/resource-management-frontend)** If you want to learn React
2. **👉 [Start with Backend →](https://github.com/Riteshatri/resource-management-backend)** If you want to learn FastAPI
3. **👉 [Start with Database →](https://github.com/Riteshatri/resource-management-database)** If you want to learn SQL & Azure
4. **👉 [Setup Complete Stack](https://github.com/Riteshatri/resource-management-project/wiki/Complete-Local-Setup)** If you want everything working locally

---


<div align="left" style="background: #454868bc; border-radius: 12px; padding: 30px; margin: 25px 0;">

## 👨‍💻 **Author**

### **_[Ritesh Sharma](https://www.linkedin.com/in/riteshatri/)_**

### 💼 *DevOps Engineer | Cloud Architect | Azure | Terraform | CI/CD | Cloud Automation*
 **_Tech :_**   **Azure | Terraform | CI/CD (_Github Action | Azure DevOps_) | Cloud Automation**

<!-- <div style="margin: 5px 0; display: flex; gap: 30px; justify-content: left;">  -->

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/riteshatri)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Riteshatri)  
![GitHub followers](https://img.shields.io/github/followers/riteshatri?label=Follow%20Me&style=social)
![GitHub stars](https://img.shields.io/github/stars/riteshatri/devops-interview-guide?style=social)
---

<!-- </div> -->

### **All 4 Repositories:**

- 📘 **[resource-management-project](https://github.com/Riteshatri/resource-management-project)** - Main showcase ⭐
- 📗 **[resource-management-frontend](https://github.com/Riteshatri/resource-management-frontend)** - React 18 + Vite ⭐
- 📕 **[resource-management-backend](https://github.com/Riteshatri/resource-management-backend)** - FastAPI + Python ⭐
- 📙 **[resource-management-database](https://github.com/Riteshatri/resource-management-database)** - SQL + Azure ⭐

**⭐ Please star all 4 repositories if you found this helpful!**

</div>

---

<div align="center" style="background: #4548682f; border-radius: 12px; padding: 30px; margin: 25px 0;">

### <h1>🌟 **_Built with ❤️ for Cloud Professionals_**</h1>  
**_Your complete resource management solution - from UI to database!_**


### ⭐ **Love This Project? Give it a Star!**

If you found this helpful, please star this repo! ⭐

---


</div>

<div align="center">

[⬆ Back to Top](#top) • [Report Issue](https://github.com/Riteshatri/resource-management-project/issues) • [Request Feature](https://github.com/Riteshatri/resource-management-project/issues)

**v1.0.0** • Last Updated: November 25, 2025 • Status: ✅ Production Ready
</div>