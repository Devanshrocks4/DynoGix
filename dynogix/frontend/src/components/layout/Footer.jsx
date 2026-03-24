import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 0.6, y: 0 }}
      whileHover={{ opacity: 1, scale: 1.01 }}
      transition={{ duration: 0.3 }}
      style={{
        padding: '16px 24px',
        textAlign: 'center',
        borderTop: '1px solid rgba(127,90,240,0.1)',
        background: 'rgba(15,23,42,0.8)',
        backdropFilter: 'blur(20px)',
        fontSize: 12,
        color: '#64748B',
        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
      }}
    >
      Made by Devansh Gupta
    </motion.footer>
  )
}
