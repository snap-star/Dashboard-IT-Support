import './styles/globals.css'
import Link from 'next/link'
 
export default function Forbidden( { children }: { children: React.ReactNode } ) {
  return (
    <div>
      {children}
      <h2>Forbidden</h2>
      <p>You are not authorized to access this resource.</p>
      <Link href="/">Return Login Screen</Link>
    </div>
  )
}