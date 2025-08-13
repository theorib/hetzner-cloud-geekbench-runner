# Hetzner GeekBench Runner

A Pulumi-based infrastructure project that automates Hetzner Cloud server provisioning to run Geekbench benchmarks across different server configurations.

## Overview

This project creates multiple Hetzner Cloud server instances with different configurations (ARM and x86), automatically downloads and runs Geekbench 6.4.0, then stores the resulting links in a file for performance comparison.

## Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or later)
- [pnpm](https://pnpm.io/) package manager
- [Pulumi CLI](https://www.pulumi.com/docs/get-started/install/)
- Hetzner Cloud account and API token

## Installation

### 1. Install Pulumi CLI

Choose your preferred installation method:

**macOS (Homebrew):**

```bash
brew install pulumi
```

**Windows (Chocolatey):**

```powershell
choco install pulumi
```

**Linux/macOS (curl):**

```bash
curl -fsSL https://get.pulumi.com | sh
```

**Alternative methods:** Visit [Pulumi Installation Guide](https://www.pulumi.com/docs/get-started/install/)

### 2. Install pnpm

```bash
npm install -g pnpm
```

### 3. Clone and Setup Project

```bash
git clone <your-repository-url>
cd hetzner-geek-bench-runner
pnpm install
```

## Configuration

### 1. Hetzner Cloud API Token

1. Log in to your [Hetzner Cloud Console](https://console.hetzner.cloud/)
2. Navigate to your project
3. Go to **Security** → **API Tokens**
4. Click **Generate API Token**
5. Give it a name (e.g., "pulumi-geekbench") and select **Read & Write** permissions
6. Copy the generated token

### 2. Configure Pulumi Stack

Initialize a new Pulumi stack (or use existing):

```bash
# Create a new stack
pulumi stack init dev

# Set your Hetzner Cloud API token
pulumi config set hcloud:token YOUR_API_TOKEN_HERE --secret
```

**Alternative:** Set the token as an environment variable:

```bash
export HCLOUD_TOKEN=YOUR_API_TOKEN_HERE
```

### 3. SSH Key Configuration

The project defaults to using an SSH key named `hetzner_ground_control`. You have two options:

#### Option A: Create the Default SSH Key

1. In Hetzner Cloud Console, go to **Security** → **SSH Keys**
2. Add your public SSH key with the name `hetzner_ground_control`

#### Option B: Modify the Code to Use Your SSH Key

Edit `src/index.ts` and change the default SSH key name:

```typescript
const createGeekBenchServer = (
  serverType: hcloud.ServerArgs['serverType'],
  datacenter: hcloud.ServerArgs['datacenter'] = 'nbg1-dc3',
  sshKeys: string[] = ['your-ssh-key-name-here'] // Change this line
): hcloud.Server => {
```

Or modify the server creation calls:

```typescript
// Use custom SSH keys for specific servers
testServers.push(createGeekBenchServer('cax31', 'nbg1-dc3', ['your-ssh-key']));
```

## Usage

### Deploy Infrastructure

Preview what will be created:

```bash
pulumi preview
```

Deploy the infrastructure:

```bash
pulumi up
```

### Development Commands

Run the linter to check code quality:

```bash
pnpm lint
```

### Monitor Progress

You can SSH into the servers to monitor Geekbench execution:

```bash
# Get server IPs from Pulumi output
pulumi stack output

# SSH into a server (replace with actual IP)
ssh root@YOUR_SERVER_IP

# Check if Geekbench is still running
ps aux | grep geekbench

# View results (once complete)
cat /root/geekbench.txt
```

### Destroy Infrastructure

⚠️ **Important:** Remember to destroy resources to avoid ongoing charges:

```bash
pulumi destroy
```

## Project Structure

```
├── src/
│   └── index.ts          # Main Pulumi program
├── package.json          # Node.js dependencies
├── Pulumi.yaml           # Pulumi project configuration
├── Pulumi.dev.yaml       # Stack-specific configuration
├── tsconfig.json         # TypeScript configuration
├── CLAUDE.md             # Claude Code instructions
└── README.md             # This file
```

## Server Types

The project tests these server configurations:

| Server Type | Architecture | Description       |
| ----------- | ------------ | ----------------- |
| `cax31`     | ARM64        | 4 vCPUs, 8 GB RAM |
| `cpx31`     | x86_64       | 4 vCPUs, 8 GB RAM |
| `ccx13`     | x86_64       | 2 vCPUs, 8 GB RAM |
| `cpx21`     | x86_64       | 3 vCPUs, 4 GB RAM |

## Customization

### Add More Server Types

Edit the `serverTypesToTest` array in `src/index.ts`:

```typescript
const serverTypesToTest: hcloud.ServerArgs['serverType'][] = [
  'cax31', // ARM
  'cpx31', // x86
  'ccx13', // x86
  'cpx21', // x86
  'cx22', // Add more server types
];
```

### Change Datacenter

Modify the default datacenter or specify per server:

```typescript
// Change default datacenter
testServers.push(createGeekBenchServer('cax31', 'hel1-dc2'));

// Available datacenters: nbg1-dc3, fsn1-dc14, hel1-dc2, ash1-dc1
```

### Modify Geekbench Configuration

The Geekbench execution is configured in the `userData` cloud-init script within the `createGeekBenchServer` function. You can modify this to:

- Run different Geekbench tests
- Change output format
- Add post-processing scripts
- Install additional tools

## Troubleshooting

### Common Issues

1. **"SSH key not found" error:**

   - Verify your SSH key exists in Hetzner Cloud Console
   - Check the key name matches what's configured in the code

2. **"API token invalid" error:**

   - Verify your token has Read & Write permissions
   - Check if the token is correctly set: `pulumi config get hcloud:token`

3. **"Server type not available" error:**

   - Some server types may not be available in all datacenters
   - Try a different datacenter or server type

4. **Geekbench results not found:**
   - SSH into the server and check: `systemctl status cloud-final`
   - Cloud-init logs: `cat /var/log/cloud-init-output.log`

### Getting Help

- [Pulumi Documentation](https://www.pulumi.com/docs/)
- [Hetzner Cloud Documentation](https://docs.hetzner.com/cloud/)
- [Hetzner Cloud Pulumi Provider](https://www.pulumi.com/registry/packages/hcloud/)

## Cost Considerations

- Servers are charged by the hour
- Always run `pulumi destroy` when done testing
- Monitor your Hetzner Cloud console for active resources
- ARM servers (CAX) are typically more cost-effective than x86 servers
