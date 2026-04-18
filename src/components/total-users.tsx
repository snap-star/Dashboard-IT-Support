'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import supabase from '@/lib/supabase'
import { Users, Network } from 'lucide-react'
import { motion } from 'framer-motion'

export default function DashboardOverview() {
  const [totalIpAddress, setTotalIpAddress] = React.useState(0)
  const [totalUserEstim, setTotalUserEstim] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    fetchOverviewData()
  }, [])

  async function fetchOverviewData() {
    setIsLoading(true)
    try {
      // Query untuk mendapatkan IP address unik
      const { data: ipData, error: ipError } = await supabase
        .from('as400_users')
        .select('ip_address')

      if (ipError) throw ipError

      // Filter IP address unik
      const uniqueIpAddresses = new Set(
        ipData?.map(item => item.ip_address).filter(ip => ip && ip.trim() !== ''),
      )

      // Query untuk mendapatkan user ESTIM unik
      const { data: userEstimData, error: userEstimError } = await supabase
        .from('as400_users')
        .select('username')

      if (userEstimError) throw userEstimError

      // Filter user ESTIM unik
      const uniqueUserEstim = new Set(
        userEstimData?.map(item => item.username).filter(user => user && user.trim() !== ''),
      )

      setTotalIpAddress(uniqueIpAddresses.size)
      setTotalUserEstim(uniqueUserEstim.size)
    } catch (error) {
      console.error('Error fetching overview data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Animasi untuk angka
  const AnimatedNumber = ({ value }: { value: number }) => {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="text-4xl font-bold"
      >
        {value}
      </motion.div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Card: Total IP Address */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total IP Address</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {isLoading ? (
                <div className="h-10 bg-gray-200 animate-pulse rounded" />
              ) : (
                <AnimatedNumber value={totalIpAddress} />
              )}
              <p className="text-xs text-muted-foreground">IP Address unik yang terdaftar</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Card: Total User ESTIM */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total User ESTIM</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {isLoading ? (
                <div className="h-10 bg-gray-200 animate-pulse rounded" />
              ) : (
                <AnimatedNumber value={totalUserEstim} />
              )}
              <p className="text-xs text-muted-foreground">User ESTIM unik yang terdaftar</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
