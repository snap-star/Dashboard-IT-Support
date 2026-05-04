'use client'
import { motion } from 'framer-motion'
import { BuildingIcon, Eye, EyeOff, IdCardIcon, LampDeskIcon, Lock, Mail, SmartphoneIcon, TagIcon, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import supabase from '@/lib/supabase'

export default function Register() {
  const [full_name, setFullName] = useState('')
  const [nip, setNip] = useState('')
  const [nohp, setNohp] = useState('')
  const [jabatan, setJabatan] = useState('')
  const [department_unit, setDepartmentUnit] = useState('')
  const [branch_office, setBranchOffice] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    if (password !== confirmPassword) {
      setErrorMessage('Password tidak cocok')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: full_name,
            nip: nip,
            nohp: nohp,
            jabatan: jabatan,
            department_unit: department_unit,
            branch_office: branch_office,
          },
        },
      })

      if (error) throw error

      router.push('/')
    } catch (error: any) {
      setErrorMessage(error.message)
      console.error('Error registering:', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <form
          onSubmit={handleRegister}
          className="bg-card/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 space-y-6 border hover:border-red-500 dark:hover:border-white"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center space-y-2"
          >
            <h1 className="text-3xl font-bold text-foreground">Create Account</h1>
            <p className="text-muted-foreground text-sm">
              Silahkan isi data diri anda untuk membuat akun
            </p>
          </motion.div>

          {errorMessage && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Nama Lengkap"
                value={full_name}
                onChange={e => setFullName(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-background/50 focus:bg-background transition-colors"
                required
              />
            </div>

            <div className='relative'>
              <IdCardIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Nip 8 Digit"
                value={nip}
                onChange={e => setNip(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-background/50 focus:bg-background transition-colors"
                required
                />
            </div>

            <div className='relative'>
              <SmartphoneIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5' />
              <Input
                type='text'
                placeholder='Nomor HP'
                value={nohp}
                onChange={e => setNohp(e.target.value)}
                className='pl-10 pr-4 py-2 w-full bg-background/50 focus:bg-background transition-colors'
                required
                />
            </div>

            <div className='relative'>
              <TagIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5' />
              <Input
                type='text'
                placeholder='Jabatan'
                value={jabatan}
                onChange={e => setJabatan(e.target.value)}
                className='pl-10 pr-4 py-2 w-full bg-background/50 focus:bg-background transition-colors'
                required
                />
            </div>

            <div className='relative'>
              <LampDeskIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5' />
              <Input
                type='text'
                placeholder='Department Unit'
                value={department_unit}
                onChange={e => setDepartmentUnit(e.target.value)}
                className='pl-10 pr-4 py-2 w-full bg-background/50 focus:bg-background transition-colors'
                required
                />
            </div>

            <div className='relative'>
              <BuildingIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5' />
              <Input
                type='text'
                placeholder='Branch Office'
                value={branch_office}
                onChange={e => setBranchOffice(e.target.value)}
                className='pl-10 pr-4 py-2 w-full bg-background/50 focus:bg-background transition-colors'
                required
                />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-background/50 focus:bg-background transition-colors"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="pl-10 pr-12 py-2 w-full bg-background/50 focus:bg-background transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Konfirmasi Password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="pl-10 pr-12 py-2 w-full bg-background/50 focus:bg-background transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            disabled={loading}
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
                className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
              />
            ) : (
              'Daftar'
            )}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            Sudah punya akun?{' '}
            <a href="/" className="text-primary hover:underline font-medium">
              Login
            </a>
          </p>
        </form>
      </motion.div>
    </div>
  )
}
