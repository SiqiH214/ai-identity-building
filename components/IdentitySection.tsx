'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, ChevronDown, User, Star, Edit2, MapPin, Sparkles, Camera, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SelectedElement } from '@/app/page'
import { CITIES, type City } from '@/lib/constants'

interface SavedIdentity {
  id: string
  name: string
  image: string
  isPrimary: boolean
}

interface IdentitySectionProps {
  currentIdentity: string | null
  identityImage: string | null
  onIdentityChange: (identity: string | null) => void
  onImageChange: (image: string | null) => void
  onIdentityNameChange?: (name: string) => void
  isGenerating?: boolean
  selectedElements?: SelectedElement[]
  hasGenerated?: boolean
  identityName?: string
  selectedCity?: City
  onCityChange?: (city: City) => void
  onElementsChange?: (elements: SelectedElement[]) => void
  onRemoveElement?: (elementId: string) => void
}

export default function IdentitySection({
  currentIdentity,
  identityImage,
  onIdentityChange,
  onImageChange,
  onIdentityNameChange,
  isGenerating = false,
  selectedElements = [],
  hasGenerated = false,
  identityName = 'Identity',
  selectedCity = 'Los Angeles',
  onCityChange,
  onElementsChange,
  onRemoveElement,
}: IdentitySectionProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [savedIdentities, setSavedIdentities] = useState<SavedIdentity[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load saved identities from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedIdentities')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSavedIdentities(parsed)

        // Auto-select primary identity on load
        const primary = parsed.find((id: SavedIdentity) => id.isPrimary)
        if (primary && !currentIdentity) {
          onIdentityChange(primary.id)
          onImageChange(primary.image)
          onIdentityNameChange?.(primary.name)
        }
      } catch (e) {
        console.error('Failed to load saved identities:', e)
      }
    }
  }, [])

  // Save identities to localStorage whenever they change
  useEffect(() => {
    if (savedIdentities.length > 0) {
      localStorage.setItem('savedIdentities', JSON.stringify(savedIdentities))
    }
  }, [savedIdentities])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const imageData = reader.result as string

        // Prompt user for identity name
        const name = prompt('Name this identity:', 'My Identity')
        if (!name) return

        // Create new identity
        const newId = `identity-${Date.now()}`
        const newIdentity: SavedIdentity = {
          id: newId,
          name,
          image: imageData,
          isPrimary: savedIdentities.length === 0, // First one is primary by default
        }

        setSavedIdentities(prev => [...prev, newIdentity])
        onImageChange(imageData)
        onIdentityChange(newId)
        onIdentityNameChange?.(name)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSetPrimary = (id: string) => {
    setSavedIdentities(prev =>
      prev.map(identity => ({
        ...identity,
        isPrimary: identity.id === id,
      }))
    )
  }

  const handleRename = (id: string, newName: string) => {
    setSavedIdentities(prev =>
      prev.map(identity =>
        identity.id === id ? { ...identity, name: newName } : identity
      )
    )
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this identity?')) {
      setSavedIdentities(prev => prev.filter(identity => identity.id !== id))
      if (currentIdentity === id) {
        onIdentityChange(null)
        onImageChange(null)
      }
    }
  }

  const getCurrentIdentityName = () => {
    const current = savedIdentities.find(id => id.id === currentIdentity)
    return current?.name || 'Identity'
  }

  const handleRemoveElement = (elementId: string) => {
    // Use the new callback if provided, otherwise fall back to onElementsChange
    if (onRemoveElement) {
      onRemoveElement(elementId)
    } else if (onElementsChange) {
      onElementsChange(selectedElements.filter(el => el.id !== elementId))
    }
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* City dropdown menu at the top left */}
      <div className="absolute top-4 left-4 z-30">
        <select
          value={selectedCity}
          onChange={(e) => onCityChange?.(e.target.value as City)}
          className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200/50 text-gray-900 backdrop-blur-md border border-gray-300 hover:bg-white/20 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30"
        >
          {CITIES.map((city) => (
            <option key={city} value={city} className="bg-white text-gray-900">
              {city}
            </option>
          ))}
        </select>
      </div>

      {/* Central large image area - Genmoji style */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full aspect-[3/4] rounded-[3rem] overflow-visible"
        style={{
          background: 'linear-gradient(135deg, #f5f5f7 0%, #ffffff 50%, #fafafa 100%)',
        }}
      >
        {isGenerating ? (
          <div className="w-full h-full flex items-center justify-center p-8">
            {/* Gradient glow background - pulsing during generation */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.9, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div
                className="w-[280px] h-[280px] rounded-full blur-[80px]"
                style={{
                  background: 'radial-gradient(circle, rgba(168, 85, 247, 0.5) 0%, rgba(59, 130, 246, 0.4) 50%, rgba(251, 146, 60, 0.4) 100%)',
                }}
              />
            </motion.div>

            {/* Rotating bubbles around the main identity */}
            {selectedElements.filter(element => {
              // Filter out the user's own identity from bubbles
              if (element.type === 'avatar' || element.type === 'identity') {
                if (element.data && 'username' in element.data) {
                  const username = element.data.username.replace('@', '').toLowerCase()
                  return username !== identityName.toLowerCase()
                }
              }
              return true
            }).map((element, i) => {
              const angle = (i * 360) / selectedElements.filter(element => {
                if (element.type === 'avatar' || element.type === 'identity') {
                  if (element.data && 'username' in element.data) {
                    const username = element.data.username.replace('@', '').toLowerCase()
                    return username !== identityName.toLowerCase()
                  }
                }
                return true
              }).length
              const radius = 140

              return (
                <motion.div
                  key={element.id}
                  className="absolute rounded-full backdrop-blur-md border border-gray-400 overflow-hidden"
                  style={{
                    width: 70,
                    height: 70,
                    filter: 'blur(2px)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.1)',
                  }}
                  animate={{
                    x: [
                      Math.cos((angle * Math.PI) / 180) * radius,
                      Math.cos(((angle + 360) * Math.PI) / 180) * radius,
                    ],
                    y: [
                      Math.sin((angle * Math.PI) / 180) * radius,
                      Math.sin(((angle + 360) * Math.PI) / 180) * radius,
                    ],
                    opacity: [0.6, 0.9, 0.6],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  {element.type === 'avatar' && element.data && 'image' in element.data ? (
                    <img
                      src={element.data.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : element.type === 'location' ? (
                    element.data && 'image' in element.data ? (
                      <img
                        src={element.data.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-gray-600" />
                      </div>
                    )
                  ) : element.type === 'outfit' ? (
                    element.data && 'image' in element.data ? (
                      <img
                        src={element.data.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-pink-500/30 to-orange-500/30 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-gray-600" />
                      </div>
                    )
                  ) : element.type === 'emotion' || element.type === 'activity' ? (
                    element.data && 'emoji' in element.data ? (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-3xl">
                        {element.data.emoji}
                      </div>
                    ) : null
                  ) : element.type === 'pose' ? (
                    element.data && 'image' in element.data ? (
                      <img
                        src={element.data.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-500/30 to-blue-500/30 flex items-center justify-center">
                        <Camera className="w-8 h-8 text-gray-700" />
                      </div>
                    )
                  ) : null}
                </motion.div>
              )
            })}

            {/* Decorative floating bubbles in background - same as initial state */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`bubble-${i}`}
                className="absolute rounded-full"
                style={{
                  width: 60 + Math.random() * 40,
                  height: 60 + Math.random() * 40,
                  left: `${10 + Math.random() * 80}%`,
                  top: `${10 + Math.random() * 80}%`,
                  background: `radial-gradient(circle, ${
                    ['rgba(168, 85, 247, 0.1)', 'rgba(59, 130, 246, 0.1)', 'rgba(251, 146, 60, 0.1)'][
                      i % 3
                    ]
                  } 0%, transparent 70%)`,
                  opacity: 0.4,
                }}
                animate={{
                  y: [0, -15, 0, 15, 0],
                  x: [0, 10, 0, -10, 0],
                  scale: [1, 1.15, 1, 0.95, 1],
                  opacity: [0.7, 1, 0.7, 1, 0.7],
                }}
                transition={{
                  duration: 4 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2,
                }}
              />
            ))}

            {/* Identity image in center - slightly blurred during generation */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative z-0 w-56 h-56 rounded-full overflow-hidden border-4 border-gray-300 shadow-2xl"
              style={{
                filter: 'blur(1px)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 0 30px rgba(255, 255, 255, 0.1)',
              }}
            >
              <img
                src={identityImage || ''}
                alt="Your identity"
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Loading text overlay - centered on the canvas */}
            <motion.div
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none"
            >
              <p className="text-lg font-semibold text-gray-900 mb-1">Generating images...</p>
              <p className="text-sm text-gray-600">This may take a moment</p>
            </motion.div>
          </div>
        ) : identityImage ? (
          <div className="w-full h-full flex items-center justify-center p-8">
            {/* Gradient glow background - scales with identity */}
            <motion.div
              animate={{
                scale: selectedElements.filter(element => {
                  // Filter out the user's own identity for scaling calculation
                  if (element.type === 'avatar' || element.type === 'identity') {
                    if (element.data && 'username' in element.data) {
                      const username = element.data.username.replace('@', '').toLowerCase()
                      return username !== identityName.toLowerCase()
                    }
                  }
                  return true
                }).length > 0 ? [0.75, 0.79, 0.75] : [1, 1.05, 1],
                opacity: [0.6, 0.8, 0.6],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div
                className="w-[280px] h-[280px] rounded-full blur-[80px]"
                style={{
                  background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(59, 130, 246, 0.3) 50%, rgba(251, 146, 60, 0.3) 100%)',
                }}
              />
            </motion.div>

            {/* Selected elements as floating bubbles */}
            {selectedElements.filter(element => {
              // Filter out the user's own identity from bubbles
              if (element.type === 'avatar' || element.type === 'identity') {
                if (element.data && 'username' in element.data) {
                  const username = element.data.username.replace('@', '').toLowerCase()
                  return username !== identityName.toLowerCase()
                }
              }
              return true
            }).map((element, i) => {
              // Adjusted positions to keep bubbles within visible canvas bounds
              // Using smaller offsets and centering with transform: translate(-50%, -50%)
              const positions = [
                { x: -100, y: -50 },
                { x: 100, y: -50 },
                { x: -90, y: 60 },
                { x: 90, y: 60 },
                { x: -60, y: -90 },
                { x: 60, y: -90 },
              ]
              const pos = positions[i % positions.length]

              return (
                <motion.div
                  key={element.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    y: [0, -10, 0, 10, 0],
                    x: [0, 5, 0, -5, 0],
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{
                    scale: { duration: 0.3 },
                    opacity: { duration: 0.3 },
                    y: { duration: 4 + i * 0.5, repeat: Infinity, ease: "easeInOut" },
                    x: { duration: 4.5 + i * 0.5, repeat: Infinity, ease: "easeInOut" },
                  }}
                  className="absolute rounded-full backdrop-blur-md border border-gray-400 overflow-visible"
                  style={{
                    width: 70,
                    height: 70,
                    left: `calc(50% + ${pos.x}px - 35px)`,
                    top: `calc(50% + ${pos.y}px - 35px)`,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)',
                  }}
                >
                  {/* Delete button */}
                  <button
                    onClick={() => handleRemoveElement(element.id)}
                    className="absolute -top-1 -right-1 z-10 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all shadow-lg"
                  >
                    <X className="w-3 h-3 text-gray-900" />
                  </button>

                  <div className="w-full h-full rounded-full overflow-hidden">
                    {element.type === 'avatar' && element.data && 'image' in element.data ? (
                      <img
                        src={element.data.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : element.type === 'location' ? (
                      element.data && 'image' in element.data ? (
                        <img
                          src={element.data.image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center">
                          <MapPin className="w-8 h-8 text-gray-600" />
                        </div>
                      )
                    ) : element.type === 'outfit' ? (
                      element.data && 'image' in element.data ? (
                        <img
                          src={element.data.image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-pink-500/30 to-orange-500/30 flex items-center justify-center">
                          <Sparkles className="w-8 h-8 text-gray-600" />
                        </div>
                      )
                    ) : element.type === 'emotion' || element.type === 'activity' ? (
                      element.data && 'emoji' in element.data ? (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-3xl">
                          {element.data.emoji}
                        </div>
                      ) : null
                    ) : element.type === 'pose' ? (
                      element.data && 'image' in element.data ? (
                        <img
                          src={element.data.image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-green-500/30 to-blue-500/30 flex items-center justify-center">
                          <Camera className="w-8 h-8 text-gray-700" />
                        </div>
                      )
                    ) : null}
                  </div>
                </motion.div>
              )
            })}

            {/* Decorative floating bubbles in background */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`bubble-${i}`}
                className="absolute rounded-full"
                style={{
                  width: 60 + Math.random() * 40,
                  height: 60 + Math.random() * 40,
                  left: `${10 + Math.random() * 80}%`,
                  top: `${10 + Math.random() * 80}%`,
                  background: `radial-gradient(circle, ${
                    ['rgba(168, 85, 247, 0.1)', 'rgba(59, 130, 246, 0.1)', 'rgba(251, 146, 60, 0.1)'][
                      i % 3
                    ]
                  } 0%, transparent 70%)`,
                  opacity: 0.4,
                }}
                animate={{
                  y: [0, -15, 0, 15, 0],
                  x: [0, 10, 0, -10, 0],
                  scale: [1, 1.15, 1, 0.95, 1],
                  opacity: [0.7, 1, 0.7, 1, 0.7],
                }}
                transition={{
                  duration: 4 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2,
                }}
              />
            ))}

            {/* Identity image in circular bubble - scales down when elements are added */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              animate={{
                scale: selectedElements.filter(element => {
                  // Filter out the user's own identity for scaling calculation
                  if (element.type === 'avatar' || element.type === 'identity') {
                    if (element.data && 'username' in element.data) {
                      const username = element.data.username.replace('@', '').toLowerCase()
                      return username !== identityName.toLowerCase()
                    }
                  }
                  return true
                }).length > 0 ? 0.75 : 1,
              }}
              transition={{
                scale: { duration: 0.4, ease: "easeOut" }
              }}
              className="relative z-0 w-56 h-56 rounded-full overflow-hidden border-4 border-gray-300 shadow-2xl"
              style={{
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 0 30px rgba(255, 255, 255, 0.1)',
              }}
            >
              <img
                src={identityImage || ''}
                alt="Your identity"
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Green message bubble - positioned above identity like they're speaking */}
            <AnimatePresence>
              {!hasGenerated && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{
                    type: "spring",
                    damping: 20,
                    stiffness: 300,
                    delay: 0.5
                  }}
                  className="absolute top-8 left-1/2 -translate-x-1/2 z-20 max-w-[280px]"
                >
                  {/* Message bubble with tail pointing down to identity */}
                  <div className="relative">
                    {/* Neon green message bubble */}
                    <div
                      className="relative rounded-[24px] px-5 py-4"
                      style={{
                        background: 'linear-gradient(135deg, #e8fcc2 0%, #d4fc79 100%)',
                        boxShadow: '0 8px 24px rgba(212, 252, 121, 0.3)',
                      }}
                    >
                      <p className="relative text-[#3d2a54] text-sm leading-relaxed font-semibold">
                        Describe your story — what are you doing, where are you?
                      </p>
                    </div>

                    {/* Message bubble tail pointing down */}
                    <div
                      className="absolute -bottom-2 left-12 w-6 h-6"
                      style={{
                        background: 'linear-gradient(135deg, #e8fcc2 0%, #d4fc79 100%)',
                        clipPath: 'polygon(0% 0%, 100% 0%, 0% 100%)',
                        transform: 'rotate(-15deg)',
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <motion.button
            onClick={() => fileInputRef.current?.click()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full h-full flex flex-col items-center justify-center text-gray-600 cursor-pointer transition-all"
          >
            <div className="relative">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 -m-8 rounded-full blur-3xl"
                style={{
                  background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)',
                }}
              />
              <User className="w-24 h-24 mb-4 relative z-10" />
            </div>
            <p className="text-lg font-medium text-gray-900">No photo yet</p>
            <p className="text-sm text-gray-400 mt-2">Tap to upload your identity</p>

            {/* Upload button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 px-8 py-3 rounded-full bg-gray-200/50 backdrop-blur-md border border-gray-300 text-gray-900 font-semibold shadow-lg"
            >
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                <span>Upload Photo</span>
              </div>
            </motion.div>
          </motion.button>
        )}
      </motion.div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  )
}

// Export identity management functions and state for use in CreationSection
export function useIdentityManagement() {
  const [savedIdentities, setSavedIdentities] = useState<SavedIdentity[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('savedIdentities')
    if (saved) {
      try {
        setSavedIdentities(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to parse saved identities:', error)
      }
    }
  }, [])

  return { savedIdentities, setSavedIdentities }
}
