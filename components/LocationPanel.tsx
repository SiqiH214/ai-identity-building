'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Plus, Upload } from 'lucide-react'
import { useState, useRef } from 'react'
import { LOCATIONS } from '@/lib/constants'

interface LocationPanelProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (location: typeof LOCATIONS[0]) => void
  customLocations?: Array<{ name: string; image: string; city: string }>
  onAddCustomLocation?: (location: { name: string; image: string; city: string }) => void
}

export default function LocationPanel({
  isOpen,
  onClose,
  onSelect,
  customLocations = [],
  onAddCustomLocation,
}: LocationPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customCity, setCustomCity] = useState('')
  const [customImage, setCustomImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Combine default locations with custom ones
  const allLocations = [...customLocations, ...LOCATIONS]

  const filteredLocations = allLocations.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCustomImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveCustomLocation = () => {
    if (customName && customImage && onAddCustomLocation) {
      onAddCustomLocation({
        name: customName,
        image: customImage,
        city: customCity || 'Custom',
      })
      // Reset form
      setCustomName('')
      setCustomCity('')
      setCustomImage(null)
      setShowUploadDialog(false)
    }
  }

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
            style={{ maxHeight: '65vh' }}
          >
            <div className="flex flex-col h-full">
              {/* Drag handle */}
              <div className="pt-2 pb-3 flex justify-center">
                <div className="w-10 h-1 bg-white/30 rounded-full" />
              </div>

              {/* Header */}
              <div className="px-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">Choose Location</h2>
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
                    placeholder="Search location..."
                    className="ios-input w-full pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-white/40"
                  />
                </div>
              </div>

              {/* Location grid - 3 columns */}
              <div className="flex-1 overflow-y-auto px-4 pb-safe overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                <div className="grid grid-cols-3 gap-3 pb-4">
                  {/* Upload Custom Location Button */}
                  {onAddCustomLocation && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => setShowUploadDialog(true)}
                      className="group relative aspect-square rounded-xl overflow-hidden active:scale-95 transition-transform duration-200 bg-white/10 backdrop-blur-sm border-2 border-dashed border-white/30 hover:border-white/50 flex items-center justify-center"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Plus className="w-6 h-6 text-white/70" />
                        <p className="text-white/70 text-[10px] font-medium">Upload</p>
                      </div>
                    </motion.button>
                  )}

                  {filteredLocations.map((location, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => {
                        onSelect(location)
                        onClose()
                      }}
                      className="group relative aspect-square rounded-xl overflow-hidden active:scale-95 transition-transform duration-200"
                    >
                      {/* Image */}
                      <img
                        src={location.image}
                        alt={location.name}
                        className="w-full h-full object-cover"
                      />

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                      {/* Text content */}
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-white font-semibold text-xs leading-tight drop-shadow-lg line-clamp-2">
                          {location.name}
                        </p>
                        <p className="text-white/60 text-[10px] mt-0.5 line-clamp-1">
                          {location.city}
                        </p>
                      </div>

                      {/* Hover ring */}
                      <div className="absolute inset-0 ring-2 ring-transparent group-active:ring-white/50 transition-all rounded-xl pointer-events-none" />
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Upload Dialog */}
          <AnimatePresence>
            {showUploadDialog && (
              <>
                {/* Darker overlay for upload dialog */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowUploadDialog(false)}
                  className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[110]"
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="fixed inset-0 flex items-center justify-center z-[111] p-4 pointer-events-none"
                >
                  <motion.div
                    onClick={(e) => e.stopPropagation()}
                    className="glass-card rounded-2xl p-6 w-full max-w-sm pointer-events-auto"
                  >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Upload Custom Location</h3>
                    <button
                      onClick={() => setShowUploadDialog(false)}
                      className="p-1 rounded-full hover:bg-white/10 transition-colors"
                    >
                      <X className="w-5 h-5 text-white/70" />
                    </button>
                  </div>

                  {/* Image Preview / Upload Button */}
                  <div className="mb-4">
                    {customImage ? (
                      <div className="relative aspect-video rounded-xl overflow-hidden">
                        <img
                          src={customImage}
                          alt="Custom location preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => setCustomImage(null)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full aspect-video rounded-xl border-2 border-dashed border-white/30 hover:border-white/50 bg-white/5 flex flex-col items-center justify-center gap-2 transition-colors"
                      >
                        <Upload className="w-8 h-8 text-white/50" />
                        <p className="text-white/50 text-sm">Upload Image</p>
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>

                  {/* Name Input */}
                  <div className="mb-3">
                    <label className="block text-white/70 text-sm mb-1.5">Location Name</label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g., My Favorite Beach"
                      className="ios-input w-full px-4 py-2.5 text-sm text-white placeholder:text-white/40"
                    />
                  </div>

                  {/* City Input */}
                  <div className="mb-4">
                    <label className="block text-white/70 text-sm mb-1.5">City (Optional)</label>
                    <input
                      type="text"
                      value={customCity}
                      onChange={(e) => setCustomCity(e.target.value)}
                      placeholder="e.g., Malibu"
                      className="ios-input w-full px-4 py-2.5 text-sm text-white placeholder:text-white/40"
                    />
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={handleSaveCustomLocation}
                    disabled={!customName || !customImage}
                    className="ios-button-primary w-full px-4 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save Location
                  </button>
                </motion.div>
              </motion.div>
            </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  )
}

