'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Sparkles, MapPin, Camera } from 'lucide-react'
import { useState, useRef } from 'react'

interface AnalysisResult {
  location: {
    name: string
    description: string
    setting: string
    atmosphere: string
  }
  outfit: {
    name: string
    description: string
    style: string
    colors: string[]
  }
  pose: {
    name: string
    description: string
    mood: string
  }
}

interface StealElementsPanelProps {
  isOpen: boolean
  onClose: () => void
  onSaveLocation: (location: { name: string; image: string; city: string }) => void
  onSaveOutfit: (outfit: { name: string; image: string; category: string }) => void
}

export default function StealElementsPanel({
  isOpen,
  onClose,
  onSaveLocation,
  onSaveOutfit,
}: StealElementsPanelProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64Image = reader.result as string
      setUploadedImage(base64Image)
      setError(null)

      // Automatically analyze the image
      await analyzeImage(base64Image)
    }
    reader.readAsDataURL(file)
  }

  const analyzeImage = async (image: string) => {
    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed')
      }

      if (data.success && data.data) {
        setAnalysisResult(data.data)
        console.log('✅ Analysis complete:', data.data)
      } else {
        throw new Error('Invalid analysis response')
      }
    } catch (error) {
      console.error('Analysis error:', error)
      setError(error instanceof Error ? error.message : 'Analysis failed')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSaveLocation = () => {
    if (!analysisResult || !uploadedImage) return

    const location = {
      name: analysisResult.location.name,
      image: uploadedImage,
      city: analysisResult.location.setting,
    }

    onSaveLocation(location)
    alert(`Location "${location.name}" saved! Check the Location tab.`)
  }

  const handleSaveOutfit = () => {
    if (!analysisResult || !uploadedImage) return

    const outfit = {
      name: analysisResult.outfit.name,
      image: uploadedImage,
      category: analysisResult.outfit.style,
    }

    onSaveOutfit(outfit)
    alert(`Outfit "${outfit.name}" saved! Check the Outfits tab.`)
  }

  const handleReset = () => {
    setUploadedImage(null)
    setAnalysisResult(null)
    setError(null)
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
            className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-[10000]"
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center z-[10001] p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Steal Elements</h2>
                    <p className="text-sm text-white/60">Upload a photo to extract location, outfit & pose</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>
              </div>

              {/* Upload Area */}
              {!uploadedImage ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video rounded-2xl border-2 border-dashed border-white/30 hover:border-white/50 bg-white/5 flex flex-col items-center justify-center gap-3 transition-all hover:bg-white/10"
                >
                  <Camera className="w-12 h-12 text-white/50" />
                  <div className="text-center">
                    <p className="text-white font-medium">Upload Image</p>
                    <p className="text-white/50 text-sm">Click to select a photo to analyze</p>
                  </div>
                </button>
              ) : (
                <div className="space-y-4">
                  {/* Image Preview */}
                  <div className="relative aspect-video rounded-2xl overflow-hidden">
                    <img
                      src={uploadedImage}
                      alt="Uploaded"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={handleReset}
                      className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  {/* Analyzing State */}
                  {isAnalyzing && (
                    <div className="flex items-center justify-center gap-3 py-8">
                      <div className="w-6 h-6 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-white">Analyzing image with AI...</p>
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Analysis Results */}
                  {analysisResult && !isAnalyzing && (
                    <div className="space-y-4">
                      {/* Location */}
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-400" />
                            <h3 className="text-white font-semibold">Location</h3>
                          </div>
                          <button
                            onClick={handleSaveLocation}
                            className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm font-medium transition-colors"
                          >
                            Save to Locations
                          </button>
                        </div>
                        <p className="text-white font-medium mb-1">{analysisResult.location.name}</p>
                        <p className="text-white/60 text-sm mb-2">{analysisResult.location.description}</p>
                        <div className="flex gap-2 text-xs">
                          <span className="px-2 py-1 rounded bg-white/10 text-white/70">{analysisResult.location.setting}</span>
                          <span className="px-2 py-1 rounded bg-white/10 text-white/70">{analysisResult.location.atmosphere}</span>
                        </div>
                      </div>

                      {/* Outfit */}
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-pink-400" />
                            <h3 className="text-white font-semibold">Outfit</h3>
                          </div>
                          <button
                            onClick={handleSaveOutfit}
                            className="px-3 py-1.5 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 text-sm font-medium transition-colors"
                          >
                            Save to Outfits
                          </button>
                        </div>
                        <p className="text-white font-medium mb-1">{analysisResult.outfit.name}</p>
                        <p className="text-white/60 text-sm mb-2">{analysisResult.outfit.description}</p>
                        <div className="flex gap-2 text-xs flex-wrap">
                          <span className="px-2 py-1 rounded bg-white/10 text-white/70">{analysisResult.outfit.style}</span>
                          {analysisResult.outfit.colors.map((color, idx) => (
                            <span key={idx} className="px-2 py-1 rounded bg-white/10 text-white/70">{color}</span>
                          ))}
                        </div>
                      </div>

                      {/* Pose */}
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2 mb-3">
                          <Camera className="w-5 h-5 text-purple-400" />
                          <h3 className="text-white font-semibold">Pose</h3>
                        </div>
                        <p className="text-white font-medium mb-1">{analysisResult.pose.name}</p>
                        <p className="text-white/60 text-sm mb-2">{analysisResult.pose.description}</p>
                        <div className="flex gap-2 text-xs">
                          <span className="px-2 py-1 rounded bg-white/10 text-white/70">Mood: {analysisResult.pose.mood}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
