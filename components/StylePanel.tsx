'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { STYLE_PRESETS } from '@/lib/constants'

interface StylePanelProps {
  isOpen: boolean
  onClose: () => void
  onApply: (style: string) => void
}

export default function StylePanel({
  isOpen,
  onClose,
  onApply,
}: StylePanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          />

          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 right-0 bottom-0 max-h-[80vh] glass-panel rounded-t-3xl z-50 overflow-hidden"
          >
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-warm-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">选择风格</h2>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-warm-gray-100 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {STYLE_PRESETS.map((style, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => onApply(style.name)}
                      className="group relative aspect-[3/4] rounded-2xl overflow-hidden hover:scale-105 transition-transform"
                    >
                      <img
                        src={style.preview}
                        alt={style.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-gray-900">
                        <p className="font-medium">{style.name}</p>
                        <p className="text-sm opacity-90">{style.description}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

