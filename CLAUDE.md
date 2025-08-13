# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Pulumi-based infrastructure project that automates Hetzner Cloud server provisioning to run Geekbench benchmarks. The project creates multiple server instances with different configurations, automatically downloads and runs Geekbench, then stores results.

## Architecture

- **Single-file Pulumi program**: `index.ts` contains all infrastructure definitions
- **Package manager**: pnpm (configured in `Pulumi.yaml`)
- **Cloud provider**: Hetzner Cloud via `@pulumi/hcloud`
- **Server configurations**: ARM (CAX) and x86 (CPX, CCX) server types
- **Automation**: Cloud-init scripts handle Geekbench download, installation, and execution

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

### Package Management
```bash
# Install dependencies
pnpm install

# TypeScript compilation (manual)
npx tsc
```

## Key Components

### Server Creation Function
`createGeekBenchServer()` in `index.ts:7` handles:
- ARM vs x86 detection for appropriate Geekbench binary selection
- Cloud-init script generation for automated benchmark execution
- SSH key configuration (defaults to 'hetzner_ground_control')
- Network configuration with IPv4/IPv6 support

### Server Types
Configured in `index.ts:56`:
- `cax31`: ARM-based server
- `cpx31`, `ccx13`, `cpx21`: x86-based servers

### Cloud-init Automation
The `userData` script in `index.ts:23` performs:
1. Package updates and curl/tar installation
2. Geekbench binary download (ARM or x86 variant)
3. Automatic execution with results output to `/root/geekbench.txt`

## Configuration

- Default datacenter: `nbg1-dc3`
- Base image: `ubuntu-24.04`
- SSH keys: `['hetzner_ground_control']` (configurable)
- Results location: `/root/geekbench.txt` on each server