# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Pulumi-based infrastructure project that automates Hetzner Cloud server provisioning to run Geekbench benchmarks. The project creates multiple server instances with different configurations, automatically downloads and runs Geekbench, then stores results.

## Architecture

- **Main Pulumi program**: `src/index.ts` contains all infrastructure definitions
- **Package manager**: pnpm (configured in `Pulumi.yaml`)
- **Cloud provider**: Hetzner Cloud via `@pulumi/hcloud`
- **Server configurations**: ARM (CAX) and x86 (CPX, CCX) server types
- **Automation**: Cloud-init scripts handle Geekbench download, installation, and execution
- **TypeScript configuration**: Strict TypeScript settings with ES2020 target

## Development Commands

### Pulumi Infrastructure Management
```bash
# Deploy infrastructure
pulumi up

# Preview changes
pulumi preview

# Destroy infrastructure
pulumi destroy

# View stack configuration
pulumi config

# View stack outputs
pulumi stack output
```

### Package Management & Development
```bash
# Install dependencies
pnpm install

# Run linter (oxlint)
pnpm lint

# TypeScript compilation (manual)
npx tsc
```

## Key Components

### Server Creation Function
`createGeekBenchServer()` in `src/index.ts:26` handles:
- ARM vs x86 detection for appropriate Geekbench binary selection
- Cloud-init script generation for automated benchmark execution
- SSH key configuration (defaults to 'hetzner_ground_control')
- Network configuration with IPv4/IPv6 support
- Geekbench 6.4.0 download and execution

### Server Types
Configured in `src/index.ts:75`:
- `cax31`: ARM-based server (4 vCPUs, 8 GB RAM)
- `cpx31`: x86-based server (4 vCPUs, 8 GB RAM)
- `ccx13`: x86-based server (2 vCPUs, 8 GB RAM)
- `cpx21`: x86-based server (3 vCPUs, 4 GB RAM)

### Cloud-init Automation
The `userData` script in `src/index.ts:42` performs:
1. Package updates and curl/tar installation
2. Geekbench binary download (ARM: `Geekbench-6.4.0-LinuxARMPreview.tar.gz`, x86: `Geekbench-6.4.0-Linux.tar.gz`)
3. Automatic execution with results output to `/root/geekbench.txt`
4. Different executable names: ARM uses `geekbench_aarch64`, x86 uses `geekbench6`

## Configuration

- Default datacenter: `nbg1-dc3`
- Base image: `ubuntu-24.04`
- SSH keys: `['hetzner_ground_control']` (configurable)
- Results location: `/root/geekbench.txt` on each server
- Hetzner Cloud API token stored in Pulumi config (`hcloud:token`)