'use client'

import { useState, useRef } from 'react'
import IdentitySection from '@/components/IdentitySection'
import CreationSection from '@/components/CreationSection'
import ResultsSection from '@/components/ResultsSection'
import GenerationPreviewPage from '@/components/GenerationPreviewPage'
import { generateImages, generateImagesByteplus } from '@/lib/api'
import type { Avatar } from '@/lib/avatars'
import type { City } from '@/lib/constants'

export interface SelectedElement {
  id: string
  type: 'avatar' | 'location' | 'outfit' | 'identity' | 'emotion' | 'activity' | 'pose'
  data: Avatar | { name: string; image?: string; emoji?: string; prompt?: string } | null
}

export default function Home() {
  const [currentIdentity, setCurrentIdentity] = useState<string | null>(null)
  const [identityImage, setIdentityImage] = useState<string | null>(null)
  const [identityName, setIdentityName] = useState<string>('Identity')
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [hasGenerated, setHasGenerated] = useState(false)
  const [lastPrompt, setLastPrompt] = useState<string>('')
  const [selectedElements, setSelectedElements] = useState<SelectedElement[]>([])
  const [useByteplus, setUseByteplus] = useState(true) // BytePlus Seedream is now the default model
  const [selectedCity, setSelectedCity] = useState<City>('Los Angeles')
  const [prompt, setPrompt] = useState<string>('') // Lift prompt state to page level
  const [showPreviewPage, setShowPreviewPage] = useState(false) // Show preview page after generation
  const resetTimerRef = useRef<(() => void) | null>(null) // Store reference to timer reset function

  const handleRevert = () => {
    setHasGenerated(false)
    setGeneratedImages([])
  }

  const handleRemoveElement = (elementId: string) => {
    // Find the element being removed
    const element = selectedElements.find(el => el.id === elementId)

    // Remove from selected elements
    setSelectedElements(prev => prev.filter(el => el.id !== elementId))

    // Remove text from prompt if element has associated text
    if (element && element.data) {
      let textToRemove = ''

      if (element.type === 'location' && 'name' in element.data) {
        // Remove " in {Location Name}"
        textToRemove = ` in ${element.data.name}`
      } else if ((element.type === 'pose' || element.type === 'emotion' || element.type === 'activity') && 'prompt' in element.data && element.data.prompt) {
        // Remove the pose/emotion/activity prompt text
        textToRemove = element.data.prompt
      }

      if (textToRemove) {
        setPrompt(prev => {
          // Remove the text (with potential trailing/leading space)
          let newPrompt = prev.replace(textToRemove + ' ', '')
          newPrompt = newPrompt.replace(' ' + textToRemove, '')
          newPrompt = newPrompt.replace(textToRemove, '')
          return newPrompt.trim()
        })
      }
    }

    // Reset the auto-generate timer (triggers 3s countdown)
    if (resetTimerRef.current) {
      resetTimerRef.current()
    }
  }

  const handleGenerate = async (prompt: string, location?: string) => {
    if (!identityImage) {
      return
    }

    setIsGenerating(true)
    setErrorMessage(null)
    setLastPrompt(prompt)

    // Parse @mentions from prompt
    const mentionRegex = /@(\w+)/g
    const mentions = Array.from(prompt.matchAll(mentionRegex)).map(match => match[1].toLowerCase())

    // Collect character images based on mentions in the prompt
    const coCreateImages: string[] = []
    const processedNames = new Set<string>()

    // Use async forEach to convert images to base64
    for (const mentionName of mentions) {
      if (processedNames.has(mentionName)) continue
      processedNames.add(mentionName)

      // Check if it's the user's identity
      if (mentionName === identityName.toLowerCase()) {
        // User's own identity - already the main selfie, skip
        continue
      }

      // Find in selected elements
      const element = selectedElements.find(el =>
        el.data && 'username' in el.data &&
        el.data.username.toLowerCase() === `@${mentionName}`
      )

      if (element && element.data && 'image' in element.data && element.data.image) {
        try {
          // Convert avatar image path to base64
          const response = await fetch(element.data.image)
          const blob = await response.blob()
          const base64Image = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.readAsDataURL(blob)
          })
          coCreateImages.push(base64Image)
          console.log(`✅ Loaded avatar: ${mentionName}`)
        } catch (error) {
          console.error(`❌ Failed to load avatar for @${mentionName}:`, error)
        }
      }
    }

    console.log('📝 Mentions found:', mentions)
    console.log('🖼️ Co-create images collected:', coCreateImages.length)

    // Check if user has selected an outfit
    const outfitElement = selectedElements.find(el => el.type === 'outfit')
    let outfitImageBase64: string | undefined = undefined

    if (outfitElement && outfitElement.data && 'image' in outfitElement.data) {
      const outfitPath = outfitElement.data.image
      if (outfitPath) {
        try {
          // Fetch the local outfit image and convert to base64
          const response = await fetch(outfitPath)
          const blob = await response.blob()
          outfitImageBase64 = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.readAsDataURL(blob)
          })
          console.log('👔 Outfit image loaded:', outfitElement.data.name)
        } catch (error) {
          console.error('❌ Failed to load outfit image:', error)
        }
      }
    }

    // Check if user has selected a pose
    const poseElement = selectedElements.find(el => el.type === 'pose')
    let poseImageBase64: string | undefined = undefined

    if (poseElement && poseElement.data && 'image' in poseElement.data) {
      const posePath = poseElement.data.image
      if (posePath) {
        try {
          const response = await fetch(posePath)
          const blob = await response.blob()
          poseImageBase64 = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.readAsDataURL(blob)
          })
          console.log('🧘 Pose image loaded:', poseElement.data.name)
        } catch (error) {
          console.error('❌ Failed to load pose image:', error)
        }
      }
    }

    // Check if user has selected a location
    const locationElement = selectedElements.find(el => el.type === 'location')
    let locationImageBase64: string | undefined = undefined

    if (locationElement && locationElement.data && 'image' in locationElement.data) {
      const locationPath = locationElement.data.image
      if (locationPath) {
        try {
          const response = await fetch(locationPath)
          const blob = await response.blob()
          locationImageBase64 = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.readAsDataURL(blob)
          })
          console.log('📍 Location image loaded:', locationElement.data.name)
        } catch (error) {
          console.error('❌ Failed to load location image:', error)
        }
      }
    }

    try {
      // Choose API based on toggle
      const apiFunction = useByteplus ? generateImagesByteplus : generateImages
      console.log(`🔧 Using ${useByteplus ? 'BytePlus Seedream' : 'Gemini'} for generation`)

      const result = await apiFunction({
        selfie: identityImage,
        prompt,
        location,
        coCreateImages: coCreateImages.length > 0 ? coCreateImages : undefined,
        outfitImage: outfitImageBase64,
        poseImage: poseImageBase64,
        locationImage: locationImageBase64,
      })

      if (result.images && result.images.length > 0) {
        setGeneratedImages(result.images)
        setHasGenerated(true)
        setShowPreviewPage(true) // Show preview page after generation
        console.log('✅ Generation successful:', result.note || 'Completed')
      } else {
        throw new Error(result.error || 'Unknown error')
      }
    } catch (error: any) {
      console.error('❌ Generation failed:', error)

      // Display detailed error information
      let errorMsg = 'Image generation failed'

      if (error.message) {
        errorMsg = error.message
      }

      // If there are more detailed error messages, add them to the message
      if (error.details) {
        if (Array.isArray(error.details)) {
          errorMsg += '\n\nDetails:\n' + error.details.join('\n')
        } else {
          errorMsg += '\n\nDetails: ' + error.details
        }
      }

      if (error.suggestion) {
        errorMsg += '\n\n💡 ' + error.suggestion
      }

      setErrorMessage(errorMsg)
      alert(errorMsg)
    } finally {
      setIsGenerating(false)
    }
  }

  // Show preview page if generation is complete
  if (showPreviewPage && generatedImages.length > 0) {
    return (
      <GenerationPreviewPage
        images={generatedImages}
        onBack={() => setShowPreviewPage(false)}
        onPostImage={() => {
          // TODO: Implement post image functionality
          alert('Post image feature coming soon!')
        }}
        onAnimate={() => {
          // TODO: Implement animate functionality
          alert('Animate feature coming soon!')
        }}
        prompt={lastPrompt}
        identityImage={identityImage}
        identityName={identityName}
      />
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center py-safe">
      <div className="w-full max-w-md mx-auto min-h-screen flex flex-col py-4 gap-4">
        {/* API Provider Toggle - Top Right */}
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={() => setUseByteplus(!useByteplus)}
            className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium shadow-lg hover:bg-white/20 transition-all"
          >
            {useByteplus ? '🚀 BytePlus' : '🤖 Gemini'}
          </button>
        </div>

        {/* Identity/Results image area */}
        <div className="flex-1 min-h-0 flex items-center justify-center px-6">
          {generatedImages.length > 0 && !isGenerating ? (
            <ResultsSection
              images={generatedImages}
              onRegenerate={handleGenerate}
              identityImage={identityImage}
            />
          ) : (
            <IdentitySection
              currentIdentity={currentIdentity}
              identityImage={identityImage}
              onIdentityChange={setCurrentIdentity}
              onImageChange={setIdentityImage}
              onIdentityNameChange={setIdentityName}
              isGenerating={isGenerating}
              selectedElements={selectedElements}
              hasGenerated={hasGenerated}
              identityName={identityName}
              selectedCity={selectedCity}
              onCityChange={setSelectedCity}
              onElementsChange={setSelectedElements}
              onRemoveElement={handleRemoveElement}
            />
          )}
        </div>

        {/* Creation area */}
        <div className="flex-none px-6 pb-2">
          <CreationSection
            onGenerate={handleGenerate}
            onRevert={handleRevert}
            isGenerating={isGenerating}
            hasIdentity={!!identityImage}
            hasGenerated={hasGenerated}
            lastPrompt={lastPrompt}
            selectedElements={selectedElements}
            onElementsChange={setSelectedElements}
            identityImage={identityImage}
            identityName={identityName}
            currentIdentity={currentIdentity}
            onIdentityChange={setCurrentIdentity}
            onImageChange={setIdentityImage}
            onIdentityNameChange={setIdentityName}
            selectedCity={selectedCity}
            prompt={prompt}
            onPromptChange={setPrompt}
            onTimerReset={(resetFn) => {
              resetTimerRef.current = resetFn
            }}
          />
        </div>
      </div>
    </main>
  )
}

