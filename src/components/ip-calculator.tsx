'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { any } from 'zod'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function IPCalculator() {
  const [ipAddress, setIpAddress] = useState('')
  const [subnetMask, setSubnetMask] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState({
    networkAddress: '',
    broadcastAddress: '',
    firstUsableAddress: '',
    lastUsableAddress: '',
    totalHosts: 0,
  })

  const calculateIP = () => {
    try {
      setError(null)
      // Validasi input
      const ipParts = ipAddress.split('.').map(Number)
      const maskParts = subnetMask.split('.').map(Number)

      if (ipParts.length !== 4 || maskParts.length !== 4) {
        setError('Format IP atau Subnet Mask tidak valid')
        return
      }

      // Validasi range angka (0-255)
      if (
        ipParts.some(part => isNaN(part) || part < 0 || part > 255) ||
        maskParts.some(part => isNaN(part) || part < 0 || part > 255)
      ) {
        setError('Setiap oktet harus berupa angka antara 0-255')
        return
      }

      // Konversi ke binary
      const ipBinary = ipParts.map(x => x.toString(2).padStart(8, '0')).join('')
      const maskBinary = maskParts.map(x => x.toString(2).padStart(8, '0')).join('')

      // Hitung network address
      const networkBinary = ipBinary
        .split('')
        .map((bit, i) => Number(bit) & Number(maskBinary[i]))
        .join('')

      // Hitung broadcast address
      const broadcastBinary = ipBinary
        .split('')
        .map((bit, i) => {
          if (maskBinary[i] === '1') return Number(bit) & Number(maskBinary[i])
          return '1'
        })
        .join('')

      // Konversi hasil ke format decimal
      const networkAddress = binaryToDecimal(networkBinary)
      const broadcastAddress = binaryToDecimal(broadcastBinary)

      // Hitung first dan last usable address
      const firstUsable: any = networkAddress.split('.')
      firstUsable[3] = parseInt(firstUsable[3]) + 1

      const lastUsable: any = broadcastAddress.split('.')
      lastUsable[3] = parseInt(lastUsable[3]) - 1

      // Hitung total host
      const totalHosts = Math.pow(2, maskBinary.split('0').length - 1) - 2

      setResult({
        networkAddress,
        broadcastAddress,
        firstUsableAddress: firstUsable.join('.'),
        lastUsableAddress: lastUsable.join('.'),
        totalHosts,
      })
    } catch (err) {
      setError('Terjadi kesalahan dalam perhitungan')
    }
  }

  // Helper function untuk konversi binary ke decimal
  const binaryToDecimal = (binary: string) => {
    const octets = binary.match(/.{8}/g) || []
    return octets.map(x => parseInt(x, 2)).join('.')
  }

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Kalkulator IP Address</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="ip">IP Address</Label>
          <Input
            id="ip"
            placeholder="Contoh: 192.168.1.1"
            value={ipAddress}
            onChange={e => setIpAddress(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subnet">Subnet Mask</Label>
          <Input
            id="subnet"
            placeholder="Contoh: 255.255.255.0"
            value={subnetMask}
            onChange={e => setSubnetMask(e.target.value)}
          />
        </div>

        <Button onClick={calculateIP} className="w-full">
          Hitung
        </Button>

        {result.networkAddress && (
          <div className="mt-4 space-y-2">
            <p>
              <strong>Network Address:</strong> {result.networkAddress}
            </p>
            <p>
              <strong>Broadcast Address:</strong> {result.broadcastAddress}
            </p>
            <p>
              <strong>First Usable Address:</strong> {result.firstUsableAddress}
            </p>
            <p>
              <strong>Last Usable Address:</strong> {result.lastUsableAddress}
            </p>
            <p>
              <strong>Total Host:</strong> {result.totalHosts}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
