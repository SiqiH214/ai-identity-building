'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { Palette, Video, Volume2, Download, RotateCw, ChevronDown, User, ChevronLeft, ChevronRight } from 'lucide-react'
import StylePanel from './StylePanel'
import MotionPanel from './MotionPanel'
import SoundPanel from './SoundPanel'
import { downloadImage } from '@/lib/api'

interface ResultsSectionProps {
  images: string[]
  onRegenerate: (prompt: string) => void
  identityImage: string | null
}

export default function ResultsSection({
  images,
  onRegenerate,
  identityImage,
}: ResultsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [showStylePanel, setShowStylePanel] = useState(false)
  const [showMotionPanel, setShowMotionPanel] = useState(false)
  const [showSoundPanel, setShowSoundPanel] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const handleDragEnd = (event: any, info: PanInfo) => {
    const swipeThreshold = 50
    if (info.offset.x > swipeThreshold && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    } else if (info.offset.x < -swipeThreshold && currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

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
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* Carousel container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full aspect-[3/4] rounded-[3rem] overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #3d2a54 0%, #4a1d6e 50%, #5b21b6 100%)',
        }}
      >
        {/* Main swipeable image */}
        <div className="relative w-full h-full overflow-hidden">
          <AnimatePresence initial={false} custom={currentIndex}>
            <motion.div
              key={currentIndex}
              custom={currentIndex}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className="absolute inset-0 flex items-center justify-center p-8"
            >
              <img
                src={images[currentIndex]}
                alt={`Generated ${currentIndex + 1}`}
                className="w-full h-full object-contain rounded-2xl"
                onClick={() => setSelectedImage(images[currentIndex])}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Download button - top right */}
        <button
          onClick={() => downloadImage(images[currentIndex], `generated-${currentIndex + 1}.jpg`)}
          className="absolute top-6 right-6 p-3 rounded-full backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/30 transition-all z-10"
        >
          <Download className="w-5 h-5 text-white" />
        </button>

        {/* Left navigation button */}
        {currentIndex > 0 && (
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/30 transition-all z-10 active:scale-95"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Right navigation button */}
        {currentIndex < images.length - 1 && (
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/30 transition-all z-10 active:scale-95"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Pagination dots - bottom center */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`transition-all rounded-full ${
                idx === currentIndex
                  ? 'w-8 h-2 bg-white'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </motion.div>

      {/* Edit toolbar - removed as it was taking too much space */}
      {/* If needed, can be accessed through a button or menu */}

      {/* Image preview modal */}
      <AnimatePresence>
        {selectedImage && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8"
            >
              <motion.img
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                src={selectedImage}
                alt="Preview"
                className="max-w-full max-h-full rounded-2xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

