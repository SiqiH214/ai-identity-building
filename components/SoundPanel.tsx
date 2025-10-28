'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Music, Wind, Waves, Coffee, Car, Volume2 } from 'lucide-react'
import { useState } from 'react'

interface SoundPanelProps {
  isOpen: boolean
  onClose: () => void
  onApply: (sound: string) => void
}

const SOUNDS = [
  { name: '咖啡馆', icon: Coffee, preview: '轻柔爵士和谈话声' },
  { name: '街道', icon: Car, preview: '城市交通和人声' },
  { name: '海浪', icon: Waves, preview: '平静的海浪声' },
  { name: '微风', icon: Wind, preview: '自然风声' },
  { name: '音乐', icon: Music, preview: '背景音乐' },
]

export default function SoundPanel({
  isOpen,
  onClose,
  onApply,
}: SoundPanelProps) {
  const [selectedSound, setSelectedSound] = useState<string | null>(null)
  const [volume, setVolume] = useState(70)

  const handleApply = () => {
    if (selectedSound) {
      onApply(`${selectedSound}-${volume}`)
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
              <h2 className="text-2xl font-semibold">添加声音</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-warm-gray-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* 声音选择 */}
              <div>
                <label className="block text-sm font-medium text-warm-gray-700 mb-3">
                  选择环境音
                </label>
                <div className="space-y-2">
                  {SOUNDS.map((sound, idx) => {
                    const Icon = sound.icon
                    return (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setSelectedSound(sound.name)}
                        className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                          selectedSound === sound.name
                            ? 'border-warm-gray-900 bg-warm-gray-50'
                            : 'border-warm-gray-200 hover:border-warm-gray-300'
                        }`}
                      >
                        <div className={`p-3 rounded-full ${
                          selectedSound === sound.name
                            ? 'bg-warm-gray-900 text-gray-900'
                            : 'bg-warm-gray-100 text-warm-gray-600'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium">{sound.name}</p>
                          <p className="text-sm text-warm-gray-600">
                            {sound.preview}
                          </p>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* 音量控制 */}
              {selectedSound && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <label className="block text-sm font-medium text-warm-gray-700 mb-3 flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    音量: {volume}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-full h-2 bg-warm-gray-200 rounded-lg appearance-none cursor-pointer accent-warm-gray-900"
                  />
                </motion.div>
              )}

              {/* 上传自定义音频 */}
              <div className="pt-4 border-t border-warm-gray-200">
                <button className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-warm-gray-300 hover:border-warm-gray-400 transition-colors text-warm-gray-600 hover:text-warm-gray-900">
                  或上传自定义音频
                </button>
              </div>

              {/* 应用按钮 */}
              <button
                onClick={handleApply}
                disabled={!selectedSound}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                应用声音
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

