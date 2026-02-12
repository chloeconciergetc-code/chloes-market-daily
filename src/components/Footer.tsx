import { motion } from 'framer-motion'

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
      className="text-center py-12 text-white/20 text-sm"
    >
      <p>Powered by Chloe 🫧</p>
      <p className="mt-1 text-[11px] text-white/10">Data from KRX via KIS API</p>
    </motion.footer>
  )
}
