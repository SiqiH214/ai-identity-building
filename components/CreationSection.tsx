'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, MapPin, Sparkles, Upload, ChevronLeft, ChevronRight, Scissors, ChevronDown, User, Star, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import LocationPanel from './LocationPanel'
import OutfitPanel from './OutfitPanel'
import StealElementsPanel from './StealElementsPanel'
import { AVATARS } from '@/lib/avatars'
import { LOCATIONS, OUTFITS, EMOTIONS, ACTIVITIES, POSES, CITIES, type City } from '@/lib/constants'
import type { SelectedElement } from '@/app/page'

interface SavedIdentity {
  id: string
  name: string
  image: string
  isPrimary: boolean
}

interface CreationSectionProps {
  onGenerate: (prompt: string, location?: string) => void
  onRevert?: () => void
  isGenerating: boolean
  hasIdentity: boolean
  hasGenerated?: boolean
  lastPrompt?: string
  identityImage?: string | null
  identityName?: string
  currentIdentity?: string | null
  onIdentityClick?: () => void
  selectedElements?: SelectedElement[]
  onElementsChange?: (elements: SelectedElement[]) => void
  onIdentityChange?: (id: string | null) => void
  onImageChange?: (image: string | null) => void
  onIdentityNameChange?: (name: string) => void
  selectedCity?: City
  prompt?: string
  onPromptChange?: (prompt: string) => void
  onTimerReset?: (resetFn: () => void) => void // Callback to expose timer reset function
}

type CategoryType = 'location' | 'outfits' | 'people' | 'emotion' | 'activities' | 'pose'

export default function CreationSection({
  onGenerate,
  onRevert,
  isGenerating,
  hasIdentity,
  hasGenerated = false,
  lastPrompt = '',
  identityImage = null,
  identityName = 'Identity',
  currentIdentity = null,
  onIdentityClick,
  selectedElements = [],
  onElementsChange,
  onIdentityChange,
  onImageChange,
  onIdentityNameChange,
  selectedCity = 'Los Angeles',
  prompt: externalPrompt,
  onPromptChange,
  onTimerReset,
}: CreationSectionProps) {
  const [internalPrompt, setInternalPrompt] = useState('')
  const prompt = externalPrompt !== undefined ? externalPrompt : internalPrompt
  const setPrompt = onPromptChange || setInternalPrompt
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('location')
  const [selectedLocation, setSelectedLocation] = useState<typeof LOCATIONS[0] | null>(null)
  const [showLocationPanel, setShowLocationPanel] = useState(false)
  const [selectedOutfit, setSelectedOutfit] = useState<typeof OUTFITS[0] | null>(null)
  const [showOutfitPanel, setShowOutfitPanel] = useState(false)
  const [showStealElementsPanel, setShowStealElementsPanel] = useState(false)
  const [customLocations, setCustomLocations] = useState<Array<{ name: string; image: string; city: string }>>([])
  const [customOutfits, setCustomOutfits] = useState<Array<{ name: string; image: string; category: string }>>([])
  const [hasInitializedPrompt, setHasInitializedPrompt] = useState(false)
  const [savedIdentities, setSavedIdentities] = useState<Array<{ id: string; name: string; image: string; isPrimary: boolean }>>([])
  const [showIdentityDropdown, setShowIdentityDropdown] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const autoGenerateTimerRef = useRef<NodeJS.Timeout | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load saved identities from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedIdentities')
    if (saved) {
      try {
        setSavedIdentities(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse saved identities:', e)
      }
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowIdentityDropdown(false)
      }
    }

    if (showIdentityDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showIdentityDropdown])

  // Fetch custom locations and outfits from cloud on mount
  useEffect(() => {
    const fetchCloudData = async () => {
      try {
        // Fetch custom locations
        const locationsResponse = await fetch('/api/locations')
        if (locationsResponse.ok) {
          const locationsData = await locationsResponse.json()
          if (locationsData.success && locationsData.locations) {
            setCustomLocations(locationsData.locations)
          }
        }

        // Fetch custom outfits
        const outfitsResponse = await fetch('/api/outfits')
        if (outfitsResponse.ok) {
          const outfitsData = await outfitsResponse.json()
          if (outfitsData.success && outfitsData.outfits) {
            setCustomOutfits(outfitsData.outfits)
          }
        }
      } catch (error) {
        console.error('Error fetching cloud data:', error)
      }
    }

    fetchCloudData()
  }, [])

  // Auto-populate prompt with [@identity name] when identity is first available
  useEffect(() => {
    if (identityImage && identityName && !hasInitializedPrompt && !prompt) {
      const initialPrompt = `@${identityName} `
      setPrompt(initialPrompt)
      setHasInitializedPrompt(true)

      // Don't add identity to selected elements - this causes the blank bubble
      // The user's identity should not appear as a bubble on the canvas
    }
  }, [identityImage, identityName, hasInitializedPrompt, prompt])

  // Auto-generation timer: trigger generation 2s after user stops interacting
  const resetAutoGenerateTimer = () => {
    // Clear existing timer
    if (autoGenerateTimerRef.current) {
      clearTimeout(autoGenerateTimerRef.current)
    }

    // Only set timer if we have identity and valid prompt
    if (hasIdentity && prompt.trim()) {
      autoGenerateTimerRef.current = setTimeout(() => {
        handleGenerate()
      }, 3000) // Changed from 2000ms to 3000ms (3 seconds)
    }
  }

  // Expose timer reset function to parent via callback
  useEffect(() => {
    if (onTimerReset) {
      onTimerReset(resetAutoGenerateTimer)
    }
  }, [onTimerReset])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoGenerateTimerRef.current) {
        clearTimeout(autoGenerateTimerRef.current)
      }
    }
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Prompt user for identity name first
    const name = window.prompt('Name this identity:', 'My Identity')
    if (!name) return

    // Compress image before storing
    const img = new Image()
    const reader = new FileReader()

    reader.onload = (event) => {
      img.src = event.target?.result as string
    }

    img.onload = () => {
      // Create canvas for compression
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      // Set max dimensions for thumbnail (smaller for localStorage)
      const MAX_WIDTH = 200
      const MAX_HEIGHT = 200
      let width = img.width
      let height = img.height

      // Calculate new dimensions while maintaining aspect ratio
      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width
          width = MAX_WIDTH
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height
          height = MAX_HEIGHT
        }
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height)
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7) // 70% quality

      // For the full-size image used in generation, use original
      const fullReader = new FileReader()
      fullReader.onloadend = () => {
        const fullBase64 = fullReader.result as string
        const newId = `identity-${Date.now()}`

        try {
          const newIdentity = {
            id: newId,
            name,
            image: compressedBase64, // Store compressed version in localStorage
            isPrimary: savedIdentities.length === 0,
          }

          const updatedIdentities = [...savedIdentities, newIdentity]
          setSavedIdentities(updatedIdentities)
          localStorage.setItem('savedIdentities', JSON.stringify(updatedIdentities))

          // Set as current identity with full-size image for generation
          if (onIdentityChange) onIdentityChange(newId)
          if (onImageChange) onImageChange(fullBase64) // Use full-size for generation
          if (onIdentityNameChange) onIdentityNameChange(name)

          // Clear the file input
          e.target.value = ''
        } catch (error) {
          console.error('Failed to save identity:', error)
          alert('Failed to save identity. Storage may be full. Try deleting some old identities.')
        }
      }
      fullReader.readAsDataURL(file)
    }

    reader.readAsDataURL(file)
  }

  const handleSwitchIdentity = (identity: { id: string; name: string; image: string }) => {
    if (onIdentityChange) onIdentityChange(identity.id)
    if (onImageChange) onImageChange(identity.image)
    if (onIdentityNameChange) onIdentityNameChange(identity.name)

    // Update prompt to reflect new identity name
    // Replace old @identity mention with new one
    const oldMention = `@${identityName}`
    const newMention = `@${identity.name}`

    if (prompt.includes(oldMention)) {
      const updatedPrompt = prompt.replace(new RegExp(`@${identityName}\\b`, 'g'), newMention)
      setPrompt(updatedPrompt)
    } else if (!prompt.trim()) {
      // If prompt is empty, initialize with new identity name
      setPrompt(`${newMention} `)
    }

    setShowIdentityDropdown(false)
  }

  const handleSetPrimary = (id: string) => {
    const updatedIdentities = savedIdentities.map(identity => ({
      ...identity,
      isPrimary: identity.id === id,
    }))
    setSavedIdentities(updatedIdentities)
    localStorage.setItem('savedIdentities', JSON.stringify(updatedIdentities))
  }

  const handleDeleteIdentity = (id: string) => {
    if (window.confirm('Delete this identity?')) {
      const updatedIdentities = savedIdentities.filter(identity => identity.id !== id)
      setSavedIdentities(updatedIdentities)
      localStorage.setItem('savedIdentities', JSON.stringify(updatedIdentities))

      // If deleting current identity, clear it
      if (currentIdentity === id) {
        if (onIdentityChange) onIdentityChange(null)
        if (onImageChange) onImageChange(null)
      }
    }
  }

  const handlePromptChange = (value: string) => {
    setPrompt(value)
    resetAutoGenerateTimer()

    // Auto-add bubbles for completed mentions
    if (onElementsChange) {
      const mentionRegex = /@(\w+)/g
      const mentions = Array.from(value.matchAll(mentionRegex)).map(match => match[1].toLowerCase())

      // Find new mentions that aren't already in selectedElements
      mentions.forEach(mentionName => {
        const alreadySelected = selectedElements.some(el =>
          el.data && 'username' in el.data &&
          el.data.username.toLowerCase() === `@${mentionName}`
        )

        if (!alreadySelected) {
          // Find the avatar that matches this mention
          const matchingAvatar = AVATARS.find(avatar =>
            avatar.username.replace('@', '').toLowerCase() === mentionName
          )

          if (matchingAvatar) {
            // Auto-add this avatar to selectedElements
            onElementsChange([...selectedElements, {
              id: matchingAvatar.id,
              type: 'avatar',
              data: matchingAvatar
            }])
          }
        }
      })
    }
  }

  const handleAvatarClick = (avatar: typeof AVATARS[0]) => {
    // Check if already selected - if so, deselect (toggle)
    const existingIndex = selectedElements.findIndex(el => el.id === avatar.id)

    if (existingIndex !== -1) {
      // Deselect: remove from selectedElements
      if (onElementsChange) {
        onElementsChange(selectedElements.filter(el => el.id !== avatar.id))
      }

      // Remove from prompt
      const usernamePattern = new RegExp(`\\s*${avatar.username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'g')
      const newPrompt = prompt.replace(usernamePattern, ' ').replace(/\s+/g, ' ').trim()
      setPrompt(newPrompt + (newPrompt ? ' ' : ''))

      return
    }

    // Select: add to selectedElements
    if (onElementsChange) {
      onElementsChange([...selectedElements, {
        id: avatar.id,
        type: 'avatar',
        data: avatar
      }])
    }

    // Add to prompt
    const needsSpaceBefore = prompt.length > 0 && !prompt.endsWith(' ')
    const newPrompt = prompt + (needsSpaceBefore ? ' ' : '') + avatar.username + ' '
    setPrompt(newPrompt)
    resetAutoGenerateTimer()

    // Focus textarea
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 0)
  }

  const handleGenerate = () => {
    if (!hasIdentity) {
      alert('Please upload your selfie first 😊')
      return
    }
    if (!prompt.trim()) {
      return
    }
    onGenerate(prompt, selectedLocation?.name || undefined)
  }

  const handleLocationSelect = (location: typeof LOCATIONS[0]) => {
    // If user is selecting elements after generation, revert to element selection state
    if (hasGenerated && onRevert) {
      onRevert()
    }

    setSelectedLocation(location)

    // Add location text to prompt
    const newPrompt = prompt + (prompt && !prompt.endsWith(' ') ? ' ' : '') + ' in ' + location.name
    setPrompt(newPrompt)

    // Add to selected elements on canvas
    if (onElementsChange) {
      const exists = selectedElements.some(el => el.id === location.name)
      if (!exists) {
        onElementsChange([...selectedElements, {
          id: location.name,
          type: 'location',
          data: { name: location.name, image: location.image }
        }])
      }
    }

    resetAutoGenerateTimer()

    // Focus textarea after adding location
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 0)
  }

  const handleAddCustomLocation = async (location: { name: string; image: string; city: string }) => {
    try {
      // Save to cloud
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(location),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.location) {
          // Add to local state
          setCustomLocations([...customLocations, data.location])
          console.log('✅ Location saved to cloud:', data.message)
        }
      } else {
        console.error('Failed to save location to cloud')
        // Fallback to local state only
        setCustomLocations([...customLocations, location])
      }
    } catch (error) {
      console.error('Error saving location:', error)
      // Fallback to local state only
      setCustomLocations([...customLocations, location])
    }
  }

  const handleSaveStealLocation = async (location: { name: string; image: string; city: string }) => {
    try {
      // Save to cloud
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(location),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.location) {
          // Add to local state
          setCustomLocations([...customLocations, data.location])
          console.log('✅ Location saved to cloud:', data.message)
        }
      } else {
        console.error('Failed to save location to cloud')
        // Fallback to local state only
        setCustomLocations([...customLocations, location])
      }
    } catch (error) {
      console.error('Error saving location:', error)
      // Fallback to local state only
      setCustomLocations([...customLocations, location])
    }
  }

  const handleSaveStealOutfit = async (outfit: { name: string; image: string; category: string }) => {
    try {
      // Save to cloud
      const response = await fetch('/api/outfits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(outfit),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.outfit) {
          // Add to local state
          setCustomOutfits([...customOutfits, data.outfit])
          console.log('✅ Outfit saved to cloud:', data.message)
        }
      } else {
        console.error('Failed to save outfit to cloud')
        // Fallback to local state only
        setCustomOutfits([...customOutfits, outfit])
      }
    } catch (error) {
      console.error('Error saving outfit:', error)
      // Fallback to local state only
      setCustomOutfits([...customOutfits, outfit])
    }
  }

  const handleOutfitSelect = (outfit: typeof OUTFITS[0]) => {
    setSelectedOutfit(outfit)

    // Add to selected elements on canvas
    if (onElementsChange) {
      const exists = selectedElements.some(el => el.id === outfit.name)
      if (!exists) {
        onElementsChange([...selectedElements, {
          id: outfit.name,
          type: 'outfit',
          data: { name: outfit.name, image: outfit.image }
        }])
      }
    }

    resetAutoGenerateTimer()
  }

  const handleEmotionClick = (emotion: typeof EMOTIONS[0]) => {
    const newPrompt = prompt + (prompt && !prompt.endsWith(' ') ? ' ' : '') + emotion.prompt + ' '
    setPrompt(newPrompt)

    // Add to selected elements on canvas
    if (onElementsChange) {
      const exists = selectedElements.some(el => el.id === `emotion-${emotion.name}`)
      if (!exists) {
        onElementsChange([...selectedElements, {
          id: `emotion-${emotion.name}`,
          type: 'emotion' as any,
          data: { name: emotion.name, emoji: emotion.emoji, prompt: emotion.prompt }
        }])
      }
    }

    resetAutoGenerateTimer()
    textareaRef.current?.focus()
  }

  const handleActivityClick = (activity: typeof ACTIVITIES[0]) => {
    const newPrompt = prompt + (prompt && !prompt.endsWith(' ') ? ' ' : '') + activity.prompt + ' '
    setPrompt(newPrompt)

    // Add to selected elements on canvas
    if (onElementsChange) {
      const exists = selectedElements.some(el => el.id === `activity-${activity.name}`)
      if (!exists) {
        onElementsChange([...selectedElements, {
          id: `activity-${activity.name}`,
          type: 'activity' as any,
          data: { name: activity.name, emoji: activity.emoji, prompt: activity.prompt }
        }])
      }
    }

    resetAutoGenerateTimer()
    textareaRef.current?.focus()
  }

  const handlePoseClick = (pose: typeof POSES[0]) => {
    const newPrompt = prompt + (prompt && !prompt.endsWith(' ') ? ' ' : '') + pose.prompt + ' '
    setPrompt(newPrompt)

    // Add to selected elements on canvas
    if (onElementsChange) {
      const exists = selectedElements.some(el => el.id === `pose-${pose.name}`)
      if (!exists) {
        onElementsChange([...selectedElements, {
          id: `pose-${pose.name}`,
          type: 'pose' as any,
          data: { name: pose.name, image: pose.image, prompt: pose.prompt }
        }])
      }
    }

    resetAutoGenerateTimer()
    textareaRef.current?.focus()
  }

  const handleSendClick = () => {
    // Cancel auto-generate timer if running
    if (autoGenerateTimerRef.current) {
      clearTimeout(autoGenerateTimerRef.current)
    }
    handleGenerate()
  }

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  // Category data
  const categories = [
    { id: 'location' as CategoryType, label: 'Location', icon: MapPin },
    { id: 'outfits' as CategoryType, label: 'Outfits', icon: Sparkles },
    { id: 'pose' as CategoryType, label: 'Pose', icon: null },
    { id: 'people' as CategoryType, label: 'People', icon: null },
    { id: 'emotion' as CategoryType, label: 'Emotion', icon: null },
    { id: 'activities' as CategoryType, label: 'Activities', icon: null },
  ]

  // Render category content
  const renderCategoryContent = () => {
    switch (selectedCategory) {
      case 'location': {
        // Filter locations by selected city
        const filteredLocations = LOCATIONS.filter(loc => loc.city === selectedCity)
        const allLocations = [...customLocations.filter(loc => loc.city === selectedCity), ...filteredLocations]

        return (
          <div className="flex gap-3">
            {allLocations.map((location, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <button
                  onClick={() => handleLocationSelect(location)}
                  className={`flex-shrink-0 w-16 h-16 rounded-full overflow-hidden border-2 transition-all ${
                    selectedLocation?.name === location.name
                      ? 'border-blue-400 ring-2 ring-blue-400/50'
                      : 'border-gray-300 hover:border-gray-500'
                  }`}
                >
                  <img
                    src={location.image}
                    alt={location.name}
                    className="w-full h-full object-cover"
                  />
                </button>
                <p className="text-[10px] text-white/60 text-center w-20 line-clamp-1">{location.name}</p>
              </div>
            ))}
            {selectedCity !== 'Home' && (
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => setShowLocationPanel(true)}
                  className="flex-shrink-0 w-16 h-16 rounded-full border-2 border-dashed border-gray-400 hover:border-white/50 bg-gray-100 flex items-center justify-center transition-all"
                >
                  <Upload className="w-6 h-6 text-white/50" />
                </button>
                <p className="text-[10px] text-white/60 text-center w-20">More</p>
              </div>
            )}
          </div>
        )
      }

      case 'outfits':
        const allOutfits = [...customOutfits, ...OUTFITS]
        return (
          <div className="flex gap-3">
            {allOutfits.map((outfit, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <button
                  onClick={() => handleOutfitSelect(outfit)}
                  className={`flex-shrink-0 w-16 h-16 rounded-full overflow-hidden border-2 transition-all ${
                    selectedOutfit?.name === outfit.name
                      ? 'border-pink-400 ring-2 ring-pink-400/50'
                      : 'border-gray-300 hover:border-gray-500'
                  }`}
                >
                  <img
                    src={outfit.image}
                    alt={outfit.name}
                    className="w-full h-full object-cover"
                  />
                </button>
                <p className="text-[10px] text-white/60 text-center w-20 line-clamp-1">{outfit.name}</p>
              </div>
            ))}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => setShowOutfitPanel(true)}
                className="flex-shrink-0 w-16 h-16 rounded-full border-2 border-dashed border-gray-400 hover:border-white/50 bg-gray-100 flex items-center justify-center transition-all"
              >
                <Upload className="w-6 h-6 text-white/50" />
              </button>
              <p className="text-[10px] text-white/60 text-center w-20">More</p>
            </div>
          </div>
        )

      case 'people':
        return (
          <div className="flex gap-3">
            {AVATARS.map((avatar, idx) => {
              const isSelected = selectedElements.some(el => el.id === avatar.id)
              return (
                <div key={avatar.id} className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => handleAvatarClick(avatar)}
                    className={`flex-shrink-0 w-16 h-16 rounded-full overflow-hidden border-2 transition-all ${
                      isSelected
                        ? 'border-blue-400 ring-2 ring-blue-400/50'
                        : 'border-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <img
                      src={avatar.image}
                      alt={avatar.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                  <p className="text-[10px] text-white/60 text-center w-20 line-clamp-1">{avatar.name}</p>
                </div>
              )
            })}
          </div>
        )

      case 'emotion':
        return (
          <div className="flex gap-3">
            {EMOTIONS.map((emotion, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <button
                  onClick={() => handleEmotionClick(emotion)}
                  className="flex-shrink-0 w-16 h-16 rounded-full border-2 border-gray-300 hover:border-gray-500 bg-gray-100 flex items-center justify-center text-3xl transition-all hover:scale-105 active:scale-95"
                >
                  {emotion.emoji}
                </button>
                <p className="text-[10px] text-white/60 text-center w-20 line-clamp-1">{emotion.name}</p>
              </div>
            ))}
          </div>
        )

      case 'activities':
        return (
          <div className="flex gap-3">
            {ACTIVITIES.map((activity, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <button
                  onClick={() => handleActivityClick(activity)}
                  className="flex-shrink-0 w-16 h-16 rounded-full border-2 border-gray-300 hover:border-gray-500 bg-gray-100 flex items-center justify-center text-3xl transition-all hover:scale-105 active:scale-95"
                >
                  {activity.emoji}
                </button>
                <p className="text-[10px] text-white/60 text-center w-20 line-clamp-1">{activity.name}</p>
              </div>
            ))}
          </div>
        )

      case 'pose':
        return (
          <div className="flex gap-3">
            {POSES.map((pose, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <button
                  onClick={() => handlePoseClick(pose)}
                  className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300 hover:border-gray-500 transition-all hover:scale-105 active:scale-95"
                  title={pose.name}
                >
                  <img
                    src={pose.image}
                    alt={pose.name}
                    className="w-full h-full object-cover"
                  />
                </button>
                <p className="text-[10px] text-white/60 text-center w-20 line-clamp-1">{pose.name}</p>
              </div>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="w-full liquid-glass rounded-3xl p-4 flex flex-col gap-4">
      {/* Category Pills with Steal Elements Button */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-white text-blue-600'
                  : 'bg-gray-200/50 text-gray-900 hover:bg-white/20'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Steal Elements Button */}
        <button
          onClick={() => setShowStealElementsPanel(true)}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          title="Steal Elements from Photo"
        >
          <Scissors className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Swipeable Elements Panel */}
      <div className="relative">
        {/* Left scroll button */}
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-gray-900" />
        </button>

        {/* Scrollable content */}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-hide px-10"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {renderCategoryContent()}
        </div>

        {/* Right scroll button */}
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-all"
        >
          <ChevronRight className="w-5 h-5 text-gray-900" />
        </button>
      </div>

      {/* Prompt Input with Identity Avatar and Send Button */}
      <div className="relative flex items-center gap-2">
        {/* Identity Avatar with Dropdown (left side) */}
        {hasIdentity && identityImage && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowIdentityDropdown(!showIdentityDropdown)}
              className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border-2 border-gray-400 hover:border-white/50 transition-all relative group"
              title="Switch identity"
            >
              <img
                src={identityImage}
                alt="Your identity"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                <ChevronDown className="w-4 h-4 text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>

            {/* Identity Dropdown Menu */}
            <AnimatePresence>
              {showIdentityDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 bottom-full mb-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-300 overflow-hidden z-50"
                >
                  <div className="p-2 max-h-80 overflow-y-auto">
                    {/* Add New Identity */}
                    <button
                      onClick={() => {
                        fileInputRef.current?.click()
                        setShowIdentityDropdown(false)
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-200/50 transition-all"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-200/50 flex items-center justify-center border-2 border-dashed border-gray-400">
                        <Upload className="w-5 h-5 text-white/60" />
                      </div>
                      <span className="text-gray-900 font-medium">Add New Identity</span>
                    </button>

                    {savedIdentities.length > 0 && (
                      <div className="my-2 h-px bg-gray-200/50" />
                    )}

                    {/* Saved Identities */}
                    {savedIdentities.map((identity) => (
                      <div
                        key={identity.id}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-200/50 transition-all group"
                      >
                        <button
                          onClick={() => handleSwitchIdentity(identity)}
                          className="flex items-center gap-3 flex-1"
                        >
                          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-400">
                            <img
                              src={identity.image}
                              alt={identity.name}
                              className="w-full h-full object-cover"
                            />
                            {currentIdentity === identity.id && (
                              <div className="absolute inset-0 bg-blue-500/20 border-2 border-blue-400" />
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="text-gray-900 font-medium text-sm">{identity.name}</div>
                            {identity.isPrimary && (
                              <div className="text-white/40 text-xs">Primary</div>
                            )}
                          </div>
                        </button>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!identity.isPrimary && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSetPrimary(identity.id)
                              }}
                              className="p-1 hover:bg-gray-200/50 rounded-lg"
                              title="Set as primary"
                            >
                              <Star className="w-4 h-4 text-white/60" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteIdentity(identity.id)
                            }}
                            className="p-1 hover:bg-red-500/20 rounded-lg"
                            title="Delete identity"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Prompt textarea */}
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            placeholder="Describe a Genmoji"
            className="ios-input w-full h-14 px-4 py-3 pr-14 text-gray-900 resize-none placeholder:text-white/40 text-sm rounded-2xl"
            disabled={isGenerating}
            rows={1}
          />

          {/* Revert and Send buttons inside textarea */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {hasGenerated && onRevert && (
              <button
                onClick={onRevert}
                className="w-9 h-9 rounded-full bg-gray-200/50 hover:bg-white/20 border border-gray-400 transition-all flex items-center justify-center"
                title="Revert to element selection"
              >
                <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
            )}
            <button
              onClick={handleSendClick}
              disabled={isGenerating || !prompt.trim() || !hasIdentity}
              className="w-9 h-9 rounded-full bg-white hover:bg-white/90 disabled:bg-white/30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              <Send className="w-4 h-4 text-blue-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Upload Identity Button (if no identity) */}
      {!hasIdentity && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="ios-button-secondary px-4 py-3 text-sm flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4 text-gray-900" />
          <span className="text-gray-900">Upload Your Photo</span>
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Location panel */}
      <LocationPanel
        isOpen={showLocationPanel}
        onClose={() => setShowLocationPanel(false)}
        onSelect={(loc) => {
          handleLocationSelect(loc)
          setShowLocationPanel(false)
        }}
        customLocations={customLocations}
        onAddCustomLocation={handleAddCustomLocation}
      />

      {/* Outfit panel */}
      <OutfitPanel
        isOpen={showOutfitPanel}
        onClose={() => setShowOutfitPanel(false)}
        onSelect={(outfit) => {
          handleOutfitSelect(outfit)
          setShowOutfitPanel(false)
        }}
      />

      {/* Steal Elements panel */}
      <StealElementsPanel
        isOpen={showStealElementsPanel}
        onClose={() => setShowStealElementsPanel(false)}
        onSaveLocation={handleSaveStealLocation}
        onSaveOutfit={handleSaveStealOutfit}
      />
    </div>
  )
}
