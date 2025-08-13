import * as hcloud from '@pulumi/hcloud';

/**
 * Creates a Hetzner Cloud server configured to automatically run Geekbench benchmarks
 *
 * @description This function provisions a server instance on Hetzner Cloud and configures it
 * with cloud-init to automatically download, install, and execute Geekbench. The function
 * detects ARM vs x86 server types and downloads the appropriate Geekbench binary variant.
 * Results are automatically saved to `/root/geekbench.txt` on the provisioned server.
 *
 * @param serverType - The Hetzner server type to provision (e.g., 'cax31' for ARM, 'cpx31' for x86)
 * @param datacenter - The Hetzner datacenter location (defaults to 'nbg1-dc3')
 * @param sshKeys - Array of SSH key names for server access (defaults to ['hetzner_ground_control'])
 *
 * @returns A configured Hetzner Cloud server instance with automated Geekbench execution
 *
 * @example
 * ```typescript
 * // Create an ARM server with default settings
 * const armServer = createGeekBenchServer('cax31');
 *
 * // Create an x86 server with custom datacenter and SSH keys
 * const x86Server = createGeekBenchServer('cpx31', 'hel1-dc2', ['my-ssh-key']);
 * ```
 */
const createGeekBenchServer = (
  serverType: hcloud.ServerArgs['serverType'],
  datacenter: hcloud.ServerArgs['datacenter'] = 'nbg1-dc3',
  sshKeys: string[] = ['hetzner_ground_control']
): hcloud.Server => {
  const isArm = serverType.toString().toLowerCase().startsWith('cax');
  const GEEKBENCH_FILE_BASENAME = `Geekbench-6.4.0-Linux${
    isArm ? 'ARMPreview' : ''
  }`;

  const server = new hcloud.Server(serverType.toString(), {
    name: serverType.toString().toUpperCase(),
    image: 'ubuntu-24.04',
    serverType,
    datacenter,
    sshKeys: sshKeys,
    userData: `
#cloud-config
# Update package list and upgrade packages
package_update: true
package_upgrade: true
# Packages to be installed
packages:
- curl
- tar
# Use runcmd for running shell commands
runcmd:
# Download the Geekbench tar.gz file
- curl -L -o /root/geekbench.tar.gz https://cdn.geekbench.com/${GEEKBENCH_FILE_BASENAME}.tar.gz
# Unzip the tar.gz file
- tar -xzf /root/geekbench.tar.gz -C /root/
# Remove the downloaded tar.gz file
- rm /root/geekbench.tar.gz
# Run Geekbench and output the results to a text file
- /root/${GEEKBENCH_FILE_BASENAME}/${
      isArm ? 'geekbench_aarch64' : 'geekbench6'
    } > /root/geekbench.txt
  `,
    publicNets: [
      {
        ipv4Enabled: true,
        ipv6Enabled: true,
      },
    ],
  });

  return server;
};

const serverTypesToTest: hcloud.ServerArgs['serverType'][] = [
  'cax31',
  'cpx31',
  'ccx13',
  'cpx21',
];

const testServers: hcloud.Server[] = [];

for (let server of serverTypesToTest) {
  testServers.push(createGeekBenchServer(server));
}
