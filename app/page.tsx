'use client'

import { useState } from 'react'
import IdentitySection from '@/components/IdentitySection'
import CreationSection from '@/components/CreationSection'
import ResultsSection from '@/components/ResultsSection'
import { generateImages } from '@/lib/api'
import type { Avatar } from '@/lib/avatars'

export interface SelectedElement {
  id: string
  type: 'avatar' | 'location' | 'outfit' | 'identity'
  data: Avatar | { name: string; image: string } | null
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

    mentions.forEach(mentionName => {
      if (processedNames.has(mentionName)) return
      processedNames.add(mentionName)

      // Check if it's the user's identity
      if (mentionName === identityName.toLowerCase()) {
        // User's own identity - already the main selfie, skip
        return
      }

      // Find in selected elements
      const element = selectedElements.find(el =>
        el.data && 'username' in el.data &&
        el.data.username.toLowerCase() === `@${mentionName}`
      )

      if (element && element.data && 'image' in element.data && element.data.image) {
        coCreateImages.push(element.data.image)
      }
    })

    console.log('📝 Mentions found:', mentions)
    console.log('🖼️ Co-create images collected:', coCreateImages.length)

    // Check if user has selected an outfit
    const outfitElement = selectedElements.find(el => el.type === 'outfit')
    let outfitImageBase64: string | undefined = undefined

    if (outfitElement && outfitElement.data && 'image' in outfitElement.data) {
      const outfitPath = outfitElement.data.image
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

    try {
      const result = await generateImages({
        selfie: identityImage,
        prompt,
        location,
        coCreateImages: coCreateImages.length > 0 ? coCreateImages : undefined,
        outfitImage: outfitImageBase64,
      })

      if (result.images && result.images.length > 0) {
        setGeneratedImages(result.images)
        setHasGenerated(true)
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

  return (
    <main className="min-h-screen flex items-center justify-center py-safe">
      <div className="w-full max-w-md mx-auto min-h-screen flex flex-col py-4 gap-4">
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
            />
          )}
        </div>

        {/* Creation area */}
        <div className="flex-none px-6 pb-2">
          <CreationSection
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            hasIdentity={!!identityImage}
            hasGenerated={hasGenerated}
            lastPrompt={lastPrompt}
            selectedElements={selectedElements}
            onElementsChange={setSelectedElements}
            identityImage={identityImage}
            identityName={identityName}
            onIdentityChange={setCurrentIdentity}
            onImageChange={setIdentityImage}
            onIdentityNameChange={setIdentityName}
          />
        </div>
      </div>
    </main>
  )
}

