'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Search } from 'lucide-react'
import { useState } from 'react'
import { OUTFITS } from '@/lib/constants'

interface OutfitPanelProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (outfit: typeof OUTFITS[0]) => void
}

export default function OutfitPanel({
  isOpen,
  onClose,
  onSelect,
}: OutfitPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredOutfits = OUTFITS.filter(outfit =>
    outfit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    outfit.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            className="fixed inset-0 bg-black/60 backdrop-blur-2xl z-[9998]"
          />

          {/* Bottom Sheet Panel */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 rounded-t-[2rem] z-[9999] overflow-hidden backdrop-blur-3xl bg-black/70 border-t border-white/10"
            style={{ maxHeight: '70vh' }}
          >
            <div className="flex flex-col h-full">
              {/* Drag handle */}
              <div className="pt-2 pb-3 flex justify-center">
                <div className="w-10 h-1 bg-white/30 rounded-full" />
              </div>

              {/* Header */}
              <div className="px-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">Choose Outfit</h2>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-white/70" />
                  </button>
                </div>

                {/* Search box */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search outfits..."
                    className="ios-input w-full pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-white/40"
                  />
                </div>
              </div>

              {/* Outfit grid - 2 columns */}
              <div className="flex-1 overflow-y-auto px-4 pb-safe overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                <div className="grid grid-cols-2 gap-3 pb-4">
                  {filteredOutfits.map((outfit, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => {
                        onSelect(outfit)
                        onClose()
                      }}
                      className="group relative aspect-[3/4] rounded-2xl overflow-hidden active:scale-95 transition-transform duration-200"
                    >
                      {/* Image */}
                      <img
                        src={outfit.image}
                        alt={outfit.name}
                        className="w-full h-full object-cover"
                      />

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                      {/* Text content - overlay at bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white font-bold text-sm leading-tight drop-shadow-lg">
                          {outfit.name}
                        </p>
                        <p className="text-white/70 text-xs mt-1">
                          {outfit.category}
                        </p>
                      </div>

                      {/* Hover ring */}
                      <div className="absolute inset-0 ring-2 ring-transparent group-active:ring-white/50 transition-all rounded-2xl pointer-events-none" />
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
