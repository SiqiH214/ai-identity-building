'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, MapPin, Lightbulb, Sparkles, ChevronDown, Upload, Star, Edit2, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import LocationPanel from './LocationPanel'
import IdeasPanel from './IdeasPanel'
import OutfitPanel from './OutfitPanel'
import { AVATARS } from '@/lib/avatars'
import { LOCATIONS, OUTFITS } from '@/lib/constants'
import type { SelectedElement } from '@/app/page'

interface SavedIdentity {
  id: string
  name: string
  image: string
  isPrimary: boolean
}

interface CreationSectionProps {
  onGenerate: (prompt: string, location?: string) => void
  isGenerating: boolean
  hasIdentity: boolean
  hasGenerated?: boolean
  lastPrompt?: string
  identityImage?: string | null
  identityName?: string
  onIdentityClick?: () => void
  selectedElements?: SelectedElement[]
  onElementsChange?: (elements: SelectedElement[]) => void
  onIdentityChange?: (id: string | null) => void
  onImageChange?: (image: string | null) => void
  onIdentityNameChange?: (name: string) => void
}

export default function CreationSection({
  onGenerate,
  isGenerating,
  hasIdentity,
  hasGenerated = false,
  lastPrompt = '',
  identityImage = null,
  identityName = 'Identity',
  onIdentityClick,
  selectedElements = [],
  onElementsChange,
  onIdentityChange,
  onImageChange,
  onIdentityNameChange,
}: CreationSectionProps) {
  const [prompt, setPrompt] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<typeof LOCATIONS[0] | null>(null)
  const [showLocationPanel, setShowLocationPanel] = useState(false)
  const [selectedOutfit, setSelectedOutfit] = useState<typeof OUTFITS[0] | null>(null)
  const [showOutfitPanel, setShowOutfitPanel] = useState(false)
  const [showIdeasPanel, setShowIdeasPanel] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false)
  const [mentionSearch, setMentionSearch] = useState('')
  const [selectedCoCreateFriend, setSelectedCoCreateFriend] = useState<typeof AVATARS[0] | null>(null)
  const [hasInitializedPrompt, setHasInitializedPrompt] = useState(false)
  const [showIdentityDropdown, setShowIdentityDropdown] = useState(false)
  const [savedIdentities, setSavedIdentities] = useState<SavedIdentity[]>([])
  const [customLocations, setCustomLocations] = useState<Array<{ name: string; image: string; city: string }>>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-populate prompt with [@identity name] when identity is first available
  useEffect(() => {
    if (identityImage && identityName && !hasInitializedPrompt && !prompt) {
      const initialPrompt = `@${identityName} `
      setPrompt(initialPrompt)
      setHasInitializedPrompt(true)

      // Add identity to selected elements on canvas
      if (onElementsChange) {
        onElementsChange([{
          id: 'self-identity',
          type: 'identity',
          data: {
            id: 'self-identity',
            name: identityName,
            username: `@${identityName}`,
            image: identityImage
          }
        }])
      }
    }
  }, [identityImage, identityName, hasInitializedPrompt, prompt, onElementsChange])

  // Sync selectedElements with mentions in prompt (for backspace deletion)
  useEffect(() => {
    if (!onElementsChange) return

    // Extract all @mentions from current prompt
    const mentionRegex = /@(\w+)/g
    const currentMentions = new Set(
      Array.from(prompt.matchAll(mentionRegex)).map(match => match[1].toLowerCase())
    )

    // Remove elements that are no longer mentioned in prompt
    const updatedElements = selectedElements.filter(el => {
      if (el.type !== 'avatar' && el.type !== 'identity') return true
      if (!el.data || !('username' in el.data)) return true

      const username = el.data.username.replace('@', '').toLowerCase()
      return currentMentions.has(username)
    })

    // Only update if there's a change
    if (updatedElements.length !== selectedElements.length) {
      onElementsChange(updatedElements)
    }
  }, [prompt, selectedElements, onElementsChange])

  // Load saved identities from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedIdentities')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSavedIdentities(parsed)
      } catch (error) {
        console.error('Failed to parse saved identities:', error)
      }
    }
  }, [])

  // Save identities to localStorage whenever they change
  useEffect(() => {
    if (savedIdentities.length > 0) {
      localStorage.setItem('savedIdentities', JSON.stringify(savedIdentities))
    }
  }, [savedIdentities])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      const newId = Date.now().toString()
      const defaultName = `Identity ${savedIdentities.length + 1}`

      const newIdentity: SavedIdentity = {
        id: newId,
        name: defaultName,
        image: base64,
        isPrimary: savedIdentities.length === 0, // First identity is primary
      }

      setSavedIdentities(prev => [...prev, newIdentity])

      // Set as current identity
      if (onIdentityChange) onIdentityChange(newId)
      if (onImageChange) onImageChange(base64)
      if (onIdentityNameChange) onIdentityNameChange(defaultName)

      setShowIdentityDropdown(false)
    }
    reader.readAsDataURL(file)
  }

  const handleRename = (id: string, newName: string) => {
    if (!newName.trim()) return

    setSavedIdentities(prev =>
      prev.map(identity =>
        identity.id === id ? { ...identity, name: newName } : identity
      )
    )

    // If renaming current identity, update it
    if (identityImage === savedIdentities.find(i => i.id === id)?.image) {
      if (onIdentityNameChange) onIdentityNameChange(newName)
    }

    setEditingId(null)
  }

  const handleSetPrimary = (id: string) => {
    setSavedIdentities(prev =>
      prev.map(identity => ({
        ...identity,
        isPrimary: identity.id === id,
      }))
    )
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this identity?')) {
      setSavedIdentities(prev => prev.filter(identity => identity.id !== id))

      // If deleting current identity, clear it
      if (identityImage === savedIdentities.find(i => i.id === id)?.image) {
        if (onIdentityChange) onIdentityChange(null)
        if (onImageChange) onImageChange(null)
      }
    }
  }

  const getCurrentIdentityName = () => {
    if (!identityImage) return 'Identity'
    const current = savedIdentities.find(id => id.image === identityImage)
    return current?.name || identityName
  }

  const handlePromptChange = (value: string) => {
    setPrompt(value)

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

    // Check for @ mentions
    const cursorPos = textareaRef.current?.selectionStart || 0
    const textBeforeCursor = value.slice(0, cursorPos)
    const lastAtIndex = textBeforeCursor.lastIndexOf('@')

    if (lastAtIndex !== -1 && lastAtIndex === cursorPos - 1) {
      // Just typed @
      setShowMentionSuggestions(true)
      setMentionSearch('')
    } else if (lastAtIndex !== -1 && cursorPos > lastAtIndex) {
      // Typing after @
      const searchTerm = textBeforeCursor.slice(lastAtIndex + 1)
      if (!/\s/.test(searchTerm)) {
        // No space after @, show suggestions
        setShowMentionSuggestions(true)
        setMentionSearch(searchTerm.toLowerCase())
      } else {
        setShowMentionSuggestions(false)
      }
    } else {
      setShowMentionSuggestions(false)
    }

    // Simple suggestion system
    if (value.length > 3 && !showMentionSuggestions) {
      const mockSuggestions = [
        'Cooking at home',
        'Walking in the park',
        'Reading in a café',
      ]
      setSuggestions(mockSuggestions.filter(s =>
        s.toLowerCase().includes(value.toLowerCase())
      ))
    } else {
      setSuggestions([])
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

      // Clear selected friend if it was this one
      if (selectedCoCreateFriend?.id === avatar.id) {
        setSelectedCoCreateFriend(null)
      }

      return
    }

    // Select: add to selectedElements
    setSelectedCoCreateFriend(avatar)

    if (onElementsChange) {
      onElementsChange([...selectedElements, {
        id: avatar.id,
        type: 'avatar',
        data: avatar
      }])
    }

    const cursorPos = textareaRef.current?.selectionStart || prompt.length
    const textBeforeCursor = prompt.slice(0, cursorPos)
    const textAfterCursor = prompt.slice(cursorPos)

    // Add space before @ if needed
    const needsSpaceBefore = textBeforeCursor.length > 0 && !textBeforeCursor.endsWith(' ')
    const newPrompt = textBeforeCursor + (needsSpaceBefore ? ' ' : '') + avatar.username + ' ' + textAfterCursor

    setPrompt(newPrompt)

    // Focus textarea
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 0)
  }

  const handleMentionSelect = (username: string) => {
    const cursorPos = textareaRef.current?.selectionStart || 0
    const textBeforeCursor = prompt.slice(0, cursorPos)
    const textAfterCursor = prompt.slice(cursorPos)

    // Find the @ symbol before cursor
    const lastAtIndex = textBeforeCursor.lastIndexOf('@')

    if (lastAtIndex !== -1) {
      const before = textBeforeCursor.slice(0, lastAtIndex)
      const newPrompt = before + username + ' ' + textAfterCursor
      setPrompt(newPrompt)
      setShowMentionSuggestions(false)

      // Focus textarea
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 0)
    }
  }

  const filteredAvatars = showMentionSuggestions
    ? AVATARS.filter(avatar =>
        avatar.username.toLowerCase().includes(mentionSearch) ||
        avatar.name.toLowerCase().includes(mentionSearch)
      )
    : []

  const handleGenerate = () => {
    if (!hasIdentity) {
      alert('Please upload your selfie first 😊')
      return
    }
    if (!prompt.trim()) {
      alert('Please describe what you are doing')
      return
    }
    onGenerate(prompt, selectedLocation?.name || undefined)
  }

  const handleLocationSelect = (location: typeof LOCATIONS[0]) => {
    setSelectedLocation(location)
    setShowLocationPanel(false)

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
  }

  const handleAddCustomLocation = (location: { name: string; image: string; city: string }) => {
    setCustomLocations([...customLocations, location])
  }

  const handleOutfitSelect = (outfit: typeof OUTFITS[0]) => {
    setSelectedOutfit(outfit)
    setShowOutfitPanel(false)

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
  }

  const handleIdeaSelect = (idea: string) => {
    setPrompt(idea)
    setShowIdeasPanel(false)
  }

  const handleShortcutClick = (shortcut: string) => {
    setPrompt(shortcut)
  }

  // Suggested shortcuts that appear after first generation
  const suggestedShortcuts = [
    'having coffee',
    'walking around',
    'taking a photo',
    'reading a book',
    'listening to music',
    'working on laptop'
  ]

  return (
    <div className="w-full liquid-glass rounded-3xl p-4 flex flex-col gap-3">
      {/* Main input area */}
      <div className="flex flex-col gap-3">
        {/* Co-Create Avatars with Location and Outfit */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {/* Location Bubble */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLocationPanel(true)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
            >
              <div className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-colors backdrop-blur-xl flex items-center justify-center ${
                selectedLocation
                  ? 'border-blue-400 ring-2 ring-blue-400/50'
                  : 'border-white/20 group-hover:border-white/50'
              }`}>
                {selectedLocation ? (
                  <img
                    src={selectedLocation.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              <span className="text-xs text-white/70 group-hover:text-white transition-colors">
                {selectedLocation ? selectedLocation.name.slice(0, 8) + '...' : 'Location'}
              </span>
            </motion.button>

            {/* Outfit/Style Bubble */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowOutfitPanel(true)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
            >
              <div className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-colors backdrop-blur-xl flex items-center justify-center ${
                selectedOutfit
                  ? 'border-pink-400 ring-2 ring-pink-400/50'
                  : 'border-white/20 group-hover:border-white/50'
              }`}>
                {selectedOutfit ? (
                  <img
                    src={selectedOutfit.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-500/30 to-orange-500/30 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              <span className="text-xs text-white/70 group-hover:text-white transition-colors">
                {selectedOutfit ? selectedOutfit.name.slice(0, 8) + (selectedOutfit.name.length > 8 ? '...' : '') : 'Outfit'}
              </span>
            </motion.button>

            {/* Co-create Avatars */}
            {AVATARS.map((avatar, idx) => (
              <motion.button
                key={avatar.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (idx + 2) * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAvatarClick(avatar)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 group relative"
              >
                <div className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-colors ${
                  selectedCoCreateFriend?.id === avatar.id
                    ? 'border-blue-400 ring-2 ring-blue-400/50'
                    : 'border-white/20 group-hover:border-white/50'
                }`}>
                  <img
                    src={avatar.image}
                    alt={avatar.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs text-white/70 group-hover:text-white transition-colors">
                  {avatar.username}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="relative">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            placeholder="Describe what you are doing... (use @ to mention)"
            className="ios-input w-full h-16 px-3 py-2.5 pr-12 text-white resize-none placeholder:text-white/40 text-sm"
            disabled={isGenerating}
            rows={2}
          />

          {/* Ideas button inside textarea */}
          <button
            onClick={() => setShowIdeasPanel(true)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/10 transition-colors"
            title="Get ideas"
          >
            <Lightbulb className="w-5 h-5 text-white/50 hover:text-white" />
          </button>

          {/* @mention autocomplete suggestions - above the input */}
          <AnimatePresence>
            {showMentionSuggestions && filteredAvatars.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full mb-1.5 w-full rounded-2xl p-2 z-10 max-h-64 overflow-y-auto backdrop-blur-3xl border border-white/20"
                style={{
                  background: 'rgba(40, 40, 40, 0.85)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                }}
              >
                {filteredAvatars.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => handleMentionSelect(avatar.username)}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/15 transition-colors flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30 flex-shrink-0">
                      <img
                        src={avatar.image}
                        alt={avatar.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-white font-semibold">{avatar.username}</span>
                      <span className="text-xs text-white/60">{avatar.name}</span>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Auto-complete suggestions */}
          <AnimatePresence>
            {suggestions.length > 0 && !showMentionSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full mt-1.5 w-full vibrancy-material rounded-xl p-1.5 z-10"
              >
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPrompt(suggestion)
                      setSuggestions([])
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-xs text-white"
                  >
                    {suggestion}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Identity dropdown and Generate button row */}
        <div className="flex items-center justify-between gap-3">
          {/* Identity Dropdown or Upload Button */}
          <div className="relative">
            {hasIdentity ? (
              <button
                onClick={() => setShowIdentityDropdown(!showIdentityDropdown)}
                className="ios-button-secondary px-4 py-2.5 text-sm flex items-center gap-2"
              >
                {identityImage && (
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-white/50">
                    <img
                      src={identityImage}
                      alt="Identity"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <span className="text-white">{getCurrentIdentityName()}</span>
                <ChevronDown className="w-4 h-4 text-white" />
              </button>
            ) : (
              <motion.button
                onClick={() => fileInputRef.current?.click()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="ios-button-secondary px-4 py-2.5 text-sm flex items-center gap-2"
              >
                <Upload className="w-4 h-4 text-white" />
                <span className="text-white">Upload Photo</span>
              </motion.button>
            )}

            <AnimatePresence>
              {showIdentityDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 bottom-full mb-2 w-72 glass-card rounded-2xl p-2 z-50"
                >
                  {savedIdentities.length > 0 && (
                    <>
                      {savedIdentities.map((identity) => (
                        <div
                          key={identity.id}
                          className="group relative w-full rounded-xl hover:bg-white/10 transition-colors"
                        >
                          {editingId === identity.id ? (
                            <div className="px-4 py-3 flex items-center gap-2">
                              <input
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleRename(identity.id, editingName)
                                  } else if (e.key === 'Escape') {
                                    setEditingId(null)
                                  }
                                }}
                                className="ios-input flex-1 px-2 py-1 text-white text-sm"
                                autoFocus
                              />
                              <button
                                onClick={() => handleRename(identity.id, editingName)}
                                className="text-white/70 hover:text-white text-xs"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                // Update prompt to replace old identity mention with new one
                                if (identityName) {
                                  const oldMention = `@${identityName}`
                                  const newMention = `@${identity.name}`
                                  const updatedPrompt = prompt.replace(new RegExp(oldMention, 'g'), newMention)
                                  setPrompt(updatedPrompt)
                                }

                                // Update identity
                                if (onIdentityChange) onIdentityChange(identity.id)
                                if (onImageChange) onImageChange(identity.image)
                                if (onIdentityNameChange) onIdentityNameChange(identity.name)
                                setShowIdentityDropdown(false)
                              }}
                              className="w-full text-left px-4 py-3 flex items-center gap-3"
                            >
                              <img
                                src={identity.image}
                                alt={identity.name}
                                className="w-8 h-8 rounded-full object-cover border border-white/20"
                              />
                              <div className="flex-1 flex items-center gap-2">
                                <span className="text-white text-sm">{identity.name}</span>
                                {identity.isPrimary && (
                                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                )}
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingId(identity.id)
                                    setEditingName(identity.name)
                                  }}
                                  className="p-1 rounded hover:bg-white/20"
                                  title="Rename"
                                >
                                  <Edit2 className="w-3 h-3 text-white/70" />
                                </button>
                                {!identity.isPrimary && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleSetPrimary(identity.id)
                                    }}
                                    className="p-1 rounded hover:bg-white/20"
                                    title="Set as Primary"
                                  >
                                    <Star className="w-3 h-3 text-white/70" />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDelete(identity.id)
                                  }}
                                  className="p-1 rounded hover:bg-white/20"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3 h-3 text-white/70" />
                                </button>
                              </div>
                            </button>
                          )}
                        </div>
                      ))}
                      <div className="border-t border-white/10 my-2" />
                    </>
                  )}
                  <button
                    onClick={() => {
                      fileInputRef.current?.click()
                      setShowIdentityDropdown(false)
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-white/70 flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>New Identity</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="ios-button px-6 py-3 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed gap-2"
          >
            <Sparkles className="w-5 h-5 text-black" />
            <span className="text-sm font-semibold text-black">Generate</span>
          </button>
        </div>

        {/* Hidden file input for image upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Location panel */}
      <LocationPanel
        isOpen={showLocationPanel}
        onClose={() => setShowLocationPanel(false)}
        onSelect={handleLocationSelect}
        customLocations={customLocations}
        onAddCustomLocation={handleAddCustomLocation}
      />

      {/* Outfit panel */}
      <OutfitPanel
        isOpen={showOutfitPanel}
        onClose={() => setShowOutfitPanel(false)}
        onSelect={handleOutfitSelect}
      />

      {/* Ideas panel */}
      <IdeasPanel
        isOpen={showIdeasPanel}
        onClose={() => setShowIdeasPanel(false)}
        onSelect={handleIdeaSelect}
      />
    </div>
  )
}

