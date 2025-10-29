'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, MoreHorizontal, Trash2, ChevronRight } from 'lucide-react'
import Image from 'next/image'

interface GenerationPreviewPageProps {
  images: string[]
  onBack: () => void
  onPostImage: () => void
  onAnimate: () => void
  prompt: string
  identityImage: string | null
  identityName: string
}

export default function GenerationPreviewPage({
  images,
  onBack,
  onPostImage,
  onAnimate,
  prompt,
  identityImage,
  identityName,
}: GenerationPreviewPageProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showMenu, setShowMenu] = useState(false)

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-50 to-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <button
          onClick={onBack}
          className="p-2 rounded-full bg-gray-200/60 hover:bg-gray-300/60 transition-all"
        >
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </button>

        <h1 className="text-lg font-semibold text-gray-900">Edit</h1>

        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 rounded-full bg-gray-200/60 hover:bg-gray-300/60 transition-all relative"
        >
          <MoreHorizontal className="w-6 h-6 text-gray-900" />
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-16 right-4 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden min-w-[200px] z-50"
            >
              <button className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-red-500" />
                <span className="text-gray-900">Delete</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Image Area */}
      <div className="flex-1 flex items-center justify-center px-6 relative">
        {/* Image container with 3:4 aspect ratio to match pre-gen page */}
        <div className="relative w-full aspect-[3/4] max-w-md">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={images[currentIndex]}
              alt={`Generated ${currentIndex + 1}`}
              className="w-full h-full object-cover rounded-[3rem] border-2 border-gray-200 shadow-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            />
          </AnimatePresence>

          {/* Navigation Buttons */}
          {currentIndex > 0 && (
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all active:scale-95"
            >
              <ChevronLeft className="w-6 h-6 text-gray-900" />
            </button>
          )}

          {currentIndex < images.length - 1 && (
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all active:scale-95"
            >
              <ChevronRight className="w-6 h-6 text-gray-900" />
            </button>
          )}

          {/* "Like Jenny" badge (top right) */}
          {identityImage && (
            <div className="absolute top-6 right-6 flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 shadow-lg">
              <img
                src={identityImage}
                alt={identityName}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="text-sm font-medium text-gray-900">Like {identityName}</span>
            </div>
          )}

          {/* Save Draft text (bottom right) */}
          <div className="absolute bottom-6 right-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <span className="text-gray-900 font-semibold">Save Draft</span>
          </div>
        </div>
      </div>

      {/* Collapsed Prompt Preview */}
      <div className="px-6 py-3">
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md rounded-2xl px-4 py-3 border border-gray-200 shadow-sm">
          {identityImage && (
            <img
              src={identityImage}
              alt="Identity"
              className="w-12 h-12 rounded-2xl object-cover flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-600 truncate">{prompt}</p>
          </div>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="px-6 pb-8 pt-4 flex gap-4">
        <button
          onClick={onPostImage}
          className="flex-1 py-4 rounded-full border-2 border-gray-900 bg-transparent hover:bg-gray-100 transition-all active:scale-95"
        >
          <span className="text-gray-900 font-bold text-lg">POST IMAGE</span>
        </button>

        <button
          onClick={onAnimate}
          className="flex-1 py-4 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 transition-all active:scale-95 shadow-lg"
        >
          <span className="text-white font-bold text-lg">ANIMATE</span>
        </button>
      </div>

      {/* Bottom safe area spacer */}
      <div className="h-6" />
    </div>
  )
}
