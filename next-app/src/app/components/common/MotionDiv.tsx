import { motion } from 'framer-motion'
import { ReactChildren } from '@/interfaces/interface.common'
import { usePathname } from 'next/navigation'

export default function MotionDiv({ children }: ReactChildren) {
  const pathname = usePathname()

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 1 }}
    >
      <div className={'p-4'}>{children}</div>
    </motion.div>
  )
}
