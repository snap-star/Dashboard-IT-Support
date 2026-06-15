import { motion } from 'framer-motion'

export default function footer() {
  return (
    <footer className="py-4">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-sm text-center text-muted-foreground"
      >
        &copy; 2023-2026 Dashboard IT Support by Oren
      </motion.p>
    </footer>
  )
}
