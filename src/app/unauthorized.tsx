import './styles/globals.css'
import { WarningProvider } from '@radix-ui/react-dialog'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import Login from '../components/login'

export default function Unauthorized() {
  return (
    <main>
      <div className="h-full w-full flex flex-col items-center justify-center text-center ">
        <Card className="w-full max-w-md p-6 rounded-lg shadow-md bg-white dark:bg-gray-800 position-center border hover:border-red-500 dark:hover:border-white ">
          <WarningProvider
            contentName="Unauthorized Access"
            docsSlug=""
            titleName="Unauthorized Access"
          >
            <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full bg-red-100 text-red-500">
              <AlertCircle className="h-8 w-8" />
            </div>
          </WarningProvider>
          <Label>401 - Unauthorized</Label>
          <p>Please log in to access this page.</p>
          <Login />
          <Button className="mt-4" variant="outline">
            <Link href="/">Return to Login Screen</Link>
          </Button>
        </Card>
      </div>
    </main>
  )
}
