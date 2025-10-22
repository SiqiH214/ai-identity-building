'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, MoveRight, RotateCw, Smile, Hand, CircleDot } from 'lucide-react'
import { useState } from 'react'

interface MotionPanelProps {
  isOpen: boolean
  onClose: () => void
  onApply: (motion: string) => void
}

const MOTIONS = [
  { name: '行走', icon: MoveRight, description: '向前走几步' },
  { name: '转身', icon: RotateCw, description: '转向镜头' },
  { name: '微笑', icon: Smile, description: '露出笑容' },
  { name: '挥手', icon: Hand, description: '向镜头挥手' },
  { name: '坐下', icon: CircleDot, description: '坐下来' },
]

export default function MotionPanel({
  isOpen,
  onClose,
  onApply,
}: MotionPanelProps) {
  const [selectedMotion, setSelectedMotion] = useState<string | null>(null)
  const [intensity, setIntensity] = useState(50)

  const handleApply = () => {
    if (selectedMotion) {
      onApply(`${selectedMotion}-${intensity}`)
    }
  }

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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg glass-panel rounded-3xl z-50 p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">添加动作</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-warm-gray-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* 动作选择 */}
              <div>
                <label className="block text-sm font-medium text-warm-gray-700 mb-3">
                  选择动作
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {MOTIONS.map((motionType, idx) => {
                    const Icon = motionType.icon
                    return (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedMotion(motionType.name)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          selectedMotion === motionType.name
                            ? 'border-warm-gray-900 bg-warm-gray-50'
                            : 'border-warm-gray-200 hover:border-warm-gray-300'
                        }`}
                      >
                        <Icon className="w-6 h-6 mx-auto mb-2" />
                        <p className="font-medium text-sm">{motionType.name}</p>
                        <p className="text-xs text-warm-gray-600 mt-1">
                          {motionType.description}
                        </p>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* 强度滑块 */}
              {selectedMotion && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <label className="block text-sm font-medium text-warm-gray-700 mb-3">
                    动作幅度: {intensity}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={intensity}
                    onChange={(e) => setIntensity(Number(e.target.value))}
                    className="w-full h-2 bg-warm-gray-200 rounded-lg appearance-none cursor-pointer accent-warm-gray-900"
                  />
                </motion.div>
              )}

              {/* 应用按钮 */}
              <button
                onClick={handleApply}
                disabled={!selectedMotion}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                应用动作
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

