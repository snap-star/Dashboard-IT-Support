import { Card } from '@/components/ui/card'
import './styles/globals.css'
import { WarningProvider } from '@radix-ui/react-dialog'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center text-center ">
      {children}
      <Card className="w-full max-w-md p-6 rounded-lg shadow-md bg-white dark:bg-gray-800 position-center border hover:border-red-500 dark:hover:border-white ">
        <WarningProvider contentName='Request Not Found' docsSlug='' titleName='Request Not Found'>
          <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full bg-red-100 text-red-500">
            <svg
              role="presentation"
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </WarningProvider>
        <h2>404 Not Found</h2>
        <p>Could not find requested resource</p>
        <Button className="mt-4" variant="outline">
          <Link href="/">Return Login Screen</Link>
        </Button>
      </Card>
    </div>
  )
}
