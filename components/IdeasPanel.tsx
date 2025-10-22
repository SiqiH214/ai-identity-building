'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'
import { IDEA_CATEGORIES } from '@/lib/constants'

interface IdeasPanelProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (idea: string) => void
}

export default function IdeasPanel({
  isOpen,
  onClose,
  onSelect,
}: IdeasPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Background overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 right-0 bottom-0 max-h-[70vh] bg-white rounded-t-3xl z-50 overflow-hidden"
            style={{
              boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.15)',
            }}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-black/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-black" />
                    <h2 className="text-2xl font-semibold text-black">Ideas</h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-black/10 transition-colors"
                  >
                    <X className="w-6 h-6 text-black" />
                  </button>
                </div>
              </div>

              {/* Ideas list */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                <div className="space-y-6">
                  {IDEA_CATEGORIES.map((category, catIdx) => (
                    <motion.div
                      key={catIdx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: catIdx * 0.1 }}
                    >
                      <h3 className="text-base font-semibold text-black/80 mb-3 px-1">
                        {category.title}
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                        {category.ideas.map((idea, ideaIdx) => (
                          <motion.button
                            key={ideaIdx}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              onSelect(idea)
                              onClose()
                            }}
                            className="text-left p-4 rounded-xl border transition-all bg-white hover:bg-gray-100"
                            style={{
                              borderColor: 'rgba(0, 0, 0, 0.1)',
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                            }}
                          >
                            <p className="text-sm font-medium text-black">
                              {idea}
                            </p>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
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

