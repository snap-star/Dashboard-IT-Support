export function calculateSubnetInfo(network: string, subnetMask: string) {
  // Validasi input
  const networkParts = network.split('.').map(Number);
  const subnetParts = subnetMask.split('.').map(Number);
  
  if (networkParts.length !== 4 || subnetParts.length !== 4) {
    throw new Error('Format IP address tidak valid');
  }

  // Validasi format
  if (!networkParts.every(part => part >= 0 && part <= 255) ||
      !subnetParts.every(part => part >= 0 && part <= 255)) {
    throw new Error('IP address harus dalam range 0-255');
  }

  // Hitung network address dalam bentuk binary
  const networkBinary = networkParts
    .map(octet => octet.toString(2).padStart(8, '0'))
    .join('');

  const subnetBinary = subnetParts
    .map(octet => octet.toString(2).padStart(8, '0'))
    .join('');

  // Validasi network address
  if (!subnetBinary.match(/^1+0+$/)) {
    throw new Error('Subnet mask tidak valid');
  }

  // Hitung jumlah host bits
  const hostBits = subnetBinary.split('0').length - 1;
  const totalHosts = Math.pow(2, hostBits) - 2; // Kurangi network & broadcast

  // Generate usable IP addresses
  const usableHosts: string[] = [];
  const networkInt = parseInt(networkBinary, 2);

  for (let i = 1; i < totalHosts + 1; i++) {
    const hostInt = networkInt + i;
    const ipParts = [
      (hostInt >> 24) & 255,
      (hostInt >> 16) & 255,
      (hostInt >> 8) & 255,
      hostInt & 255
    ];
    usableHosts.push(ipParts.join('.'));
  }

  return {
    networkAddress: network,
    subnetMask: subnetMask,
    totalHosts: totalHosts,
    usableHosts: usableHosts,
    gateway: usableHosts[0] // IP pertama sebagai gateway
  };
} 