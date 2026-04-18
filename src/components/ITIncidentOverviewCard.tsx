// components/ITIncidentOverviewCard.tsx
'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import supabase from '@/lib/supabase'
import { AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'

type IncidentCounts = {
  total: number
  open: number
  inProgress: number
  resolved: number
  closed: number
}

export function ITIncidentOverviewCard() {
  const [incidentCounts, setIncidentCounts] = useState<IncidentCounts>({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchIncidentCounts()
  }, [])

  async function fetchIncidentCounts() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from('it_incidents').select('status')

      if (error) {
        console.error('Error fetching IT incidents:', error)
      } else {
        const counts: IncidentCounts = {
          total: data.length,
          open: data.filter(incident => incident.status === 'Open').length,
          inProgress: data.filter(incident => incident.status === 'In Progress').length,
          resolved: data.filter(incident => incident.status === 'Resolved').length,
          closed: data.filter(incident => incident.status === 'Closed').length,
        }
        setIncidentCounts(counts)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const statusCards = [
    {
      title: 'Open',
      value: incidentCounts.open,
      icon: <AlertCircle className="h-4 w-4" />,
      color: 'text-red-500',
      bgColor: 'bg-red-100',
    },
    {
      title: 'In Progress',
      value: incidentCounts.inProgress,
      icon: <Clock className="h-4 w-4" />,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Resolved',
      value: incidentCounts.resolved,
      icon: <CheckCircle2 className="h-4 w-4" />,
      color: 'text-green-500',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Closed',
      value: incidentCounts.closed,
      icon: <XCircle className="h-4 w-4" />,
      color: 'text-gray-500',
      bgColor: 'bg-gray-100',
    },
  ]

  const AnimatedNumber = ({ value }: { value: number }) => {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="text-2xl font-bold dark:text-black"
      >
        {value}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-bold">IT Incident Overview</CardTitle>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
            className="bg-blue-100 text-blue-500 px-3 py-1 rounded-full text-sm font-medium"
          >
            Total: {incidentCounts.total}
          </motion.div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {statusCards.map((status, index) => (
                <motion.div
                  key={status.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`${status.bgColor} rounded-lg p-3 transition-all duration-200 hover:scale-105`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`${status.color} font-medium`}>{status.title}</span>
                    <span className={status.color}>{status.icon}</span>
                  </div>
                  <AnimatedNumber value={status.value} />
                </motion.div>
              ))}
            </div>
          )}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-xs text-muted-foreground text-center"
          >
            Last updated: {new Date().toLocaleString()}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
