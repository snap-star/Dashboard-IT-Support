'use client' // Error boundaries must be Client Components

import '../styles/globals.css'
import { WarningProvider } from '@radix-ui/react-dialog'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export default function Err({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="h-full w-full flex flex-col items-center justify-center text-center ">
      <Card className="w-full max-w-md p-6 rounded-lg shadow-md bg-white dark:bg-gray-800 position-center border hover:border-red-500 dark:hover:border-white ">
        <WarningProvider
          contentName="Something went wrong!"
          docsSlug=""
          titleName="Something went wrong!"
        >
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
        <h2>Oh No, Something went wrong!</h2>
        <p>An unexpected error occurred</p>
        <Label className="text-sm text-muted-foreground mt-2">
          {error.digest ? `Error Code: ${error.digest}` : 'Please try again later.'}
        </Label>
        <Button className="mt-4" variant="outline" onClick={unstable_retry}>
          Try again
        </Button>
      </Card>
    </div>
  )
}