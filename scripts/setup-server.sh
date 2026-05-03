#!/bin/bash
# =============================================================================
# ORTHONOBA — Fresh Ubuntu 24.04 LTS VPS Setup (Hetzner)
# =============================================================================
# Usage (run as root on a fresh VPS):
#   curl -fsSL https://raw.githubusercontent.com/your-org/orthonoba/main/scripts/setup-server.sh | bash
# Or:
#   chmod +x setup-server.sh && sudo ./setup-server.sh
#
# What this script does:
#   1. System update + hardening
#   2. Creates non-root 'deploy' user
#   3. SSH hardening (disable root + password auth)
#   4. UFW firewall setup
#   5. Fail2Ban intrusion prevention
#   6. Docker + Docker Compose plugin
#   7. Certbot for Let's Encrypt SSL
#   8. Automatic security updates
#   9. Swap file (2GB)
# =============================================================================
set -euo pipefail

# Color output helpers
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

info()    { echo -e "${GREEN}[INFO]${NC} $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# Ensure running as root
[[ $EUID -ne 0 ]] && error "This script must be run as root. Use: sudo $0"

info "Starting Orthonoba server setup on Ubuntu 24.04..."

# ---------------------------------------------------------------------------
# 1. System update
# ---------------------------------------------------------------------------
info "Updating system packages..."
apt-get update -y
apt-get upgrade -y
apt-get autoremove -y
apt-get autoclean -y

# Install essential tools
apt-get install -y \
  curl \
  wget \
  git \
  htop \
  vim \
  unzip \
  ca-certificates \
  gnupg \
  lsb-release \
  software-properties-common \
  apt-transport-https

# ---------------------------------------------------------------------------
# 2. Create non-root deploy user
# ---------------------------------------------------------------------------
info "Creating deploy user..."
if id "deploy" &>/dev/null; then
  warn "User 'deploy' already exists — skipping creation"
else
  useradd -m -s /bin/bash deploy
  usermod -aG sudo deploy
  echo "deploy ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/deploy
  chmod 440 /etc/sudoers.d/deploy
  info "Deploy user created (no-password sudo)"
fi

# Create SSH authorized_keys structure for deploy user
mkdir -p /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
touch /home/deploy/.ssh/authorized_keys
chmod 600 /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh

warn "IMPORTANT: Add your public SSH key to /home/deploy/.ssh/authorized_keys before enabling PasswordAuthentication=no"
warn "Run: echo 'your-public-key' >> /home/deploy/.ssh/authorized_keys"

# ---------------------------------------------------------------------------
# 3. SSH hardening
# ---------------------------------------------------------------------------
info "Hardening SSH configuration..."

# Backup original config
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak

# Apply hardening settings
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/^#\?PubkeyAuthentication.*/PubkeyAuthentication yes/' /etc/ssh/sshd_config
sed -i 's/^#\?X11Forwarding.*/X11Forwarding no/' /etc/ssh/sshd_config
sed -i 's/^#\?MaxAuthTries.*/MaxAuthTries 3/' /etc/ssh/sshd_config
sed -i 's/^#\?LoginGraceTime.*/LoginGraceTime 30/' /etc/ssh/sshd_config

# Add additional hardening if not present
grep -q "^AllowUsers" /etc/ssh/sshd_config || echo "AllowUsers deploy" >> /etc/ssh/sshd_config
grep -q "^ClientAliveInterval" /etc/ssh/sshd_config || echo "ClientAliveInterval 300" >> /etc/ssh/sshd_config
grep -q "^ClientAliveCountMax" /etc/ssh/sshd_config || echo "ClientAliveCountMax 2" >> /etc/ssh/sshd_config

systemctl reload sshd
info "SSH hardened (root login disabled, password auth disabled)"

# ---------------------------------------------------------------------------
# 4. UFW Firewall
# ---------------------------------------------------------------------------
info "Configuring UFW firewall..."
apt-get install -y ufw

ufw --force reset
ufw default deny incoming
ufw default allow outgoing

ufw allow 22/tcp   comment 'SSH'
ufw allow 80/tcp   comment 'HTTP'
ufw allow 443/tcp  comment 'HTTPS'

# Optionally restrict Docker management port (not exposed by default)
# ufw allow from YOUR_ADMIN_IP to any port 2376 proto tcp

ufw --force enable
ufw status verbose
info "UFW firewall configured"

# ---------------------------------------------------------------------------
# 5. Fail2Ban
# ---------------------------------------------------------------------------
info "Installing and configuring Fail2Ban..."
apt-get install -y fail2ban

cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
# Ban duration: 1 hour
bantime  = 3600
# Detection window: 10 minutes
findtime = 600
# Max retries before ban
maxretry = 5
# Email notifications (configure sender/recipient as needed)
destemail = root@localhost
action = %(action_mw)s

[sshd]
enabled  = true
port     = 22
logpath  = /var/log/auth.log
maxretry = 3
bantime  = 86400

[nginx-http-auth]
enabled  = true
port     = http,https
logpath  = /var/log/nginx/error.log

[nginx-limit-req]
enabled  = true
port     = http,https
logpath  = /var/log/nginx/error.log
maxretry = 10
EOF

systemctl enable fail2ban
systemctl start fail2ban
info "Fail2Ban configured and started"

# ---------------------------------------------------------------------------
# 6. Docker + Docker Compose Plugin
# ---------------------------------------------------------------------------
info "Installing Docker..."

# Remove old versions if present
apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Add Docker's official GPG key
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add deploy user to docker group (no sudo needed for docker commands)
usermod -aG docker deploy

# Enable Docker on boot
systemctl enable docker
systemctl start docker

# Tune Docker daemon for production
cat > /etc/docker/daemon.json << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "5"
  },
  "storage-driver": "overlay2",
  "live-restore": true
}
EOF

systemctl reload docker
info "Docker $(docker --version) installed"

# ---------------------------------------------------------------------------
# 7. Certbot (Let's Encrypt)
# ---------------------------------------------------------------------------
info "Installing Certbot..."
apt-get install -y certbot python3-certbot-nginx

# Certbot usage after setup:
#   certbot --nginx -d orthonoba.app -d app.orthonoba.app -d n8n.orthonoba.app \
#           --email automatizadental@gmail.com --agree-tos --non-interactive
info "Certbot installed. Run certbot after DNS is configured."

# ---------------------------------------------------------------------------
# 8. Automatic Security Updates
# ---------------------------------------------------------------------------
info "Enabling unattended security upgrades..."
apt-get install -y unattended-upgrades apt-listchanges

cat > /etc/apt/apt.conf.d/50unattended-upgrades << 'EOF'
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
};
Unattended-Upgrade::Package-Blacklist {};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-New-Unused-Dependencies "true";
Unattended-Upgrade::Remove-Unused-Dependencies "false";
Unattended-Upgrade::Automatic-Reboot "false";
Unattended-Upgrade::Automatic-Reboot-Time "02:00";
EOF

cat > /etc/apt/apt.conf.d/20auto-upgrades << 'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "7";
APT::Periodic::Unattended-Upgrade "1";
EOF

systemctl enable unattended-upgrades
info "Automatic security updates enabled"

# ---------------------------------------------------------------------------
# 9. Swap (2GB)
# ---------------------------------------------------------------------------
info "Setting up 2GB swap file..."

if [ -f /swapfile ]; then
  warn "Swap file already exists — skipping"
else
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile

  # Persist across reboots
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab

  # Tune swappiness for server workload
  echo 'vm.swappiness=10' >> /etc/sysctl.d/99-orthonoba.conf
  echo 'vm.vfs_cache_pressure=50' >> /etc/sysctl.d/99-orthonoba.conf
  sysctl --system

  info "Swap configured: $(swapon --show)"
fi

# ---------------------------------------------------------------------------
# 10. Create application directory
# ---------------------------------------------------------------------------
info "Creating application directory..."
mkdir -p /opt/orthonoba/{backups,logs}
chown -R deploy:deploy /opt/orthonoba

# ---------------------------------------------------------------------------
# Final Summary
# ---------------------------------------------------------------------------
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN} Orthonoba Server Setup Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Add SSH public key: echo 'YOUR_KEY' >> /home/deploy/.ssh/authorized_keys"
echo "  2. Clone repo:         git clone https://github.com/your-org/orthonoba /opt/orthonoba"
echo "  3. Configure .env:     cp /opt/orthonoba/.env.example /opt/orthonoba/.env && vim /opt/orthonoba/.env"
echo "  4. Obtain SSL cert:    certbot --nginx -d orthonoba.app -d app.orthonoba.app"
echo "  5. Start services:     cd /opt/orthonoba && docker compose up -d"
echo ""
warn "Reboot recommended to apply all kernel updates: sudo reboot"
