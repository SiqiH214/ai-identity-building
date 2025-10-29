/**
 * Application constants
 */

// City options for the dropdown
export const CITIES = ['San Francisco', 'Los Angeles', 'Home'] as const
export type City = typeof CITIES[number]

export const LOCATIONS = [
  // San Francisco - 10 famous locations
  {
    name: 'Golden Gate Bridge',
    image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&auto=format&fit=crop',
    city: 'San Francisco',
  },
  {
    name: 'Fishermans Wharf',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&auto=format&fit=crop',
    city: 'San Francisco',
  },
  {
    name: 'Alcatraz Island',
    image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&auto=format&fit=crop',
    city: 'San Francisco',
  },
  {
    name: 'Lombard Street',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&auto=format&fit=crop',
    city: 'San Francisco',
  },
  {
    name: 'Union Square',
    image: 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=400&auto=format&fit=crop',
    city: 'San Francisco',
  },
  {
    name: 'Painted Ladies',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&auto=format&fit=crop',
    city: 'San Francisco',
  },
  {
    name: 'Coit Tower',
    image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&auto=format&fit=crop',
    city: 'San Francisco',
  },
  {
    name: 'Ferry Building',
    image: 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=400&auto=format&fit=crop',
    city: 'San Francisco',
  },
  {
    name: 'Palace of Fine Arts',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&auto=format&fit=crop',
    city: 'San Francisco',
  },
  {
    name: 'Chinatown SF',
    image: 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=400&auto=format&fit=crop',
    city: 'San Francisco',
  },

  // Los Angeles - 10 famous locations
  {
    name: 'Hollywood Boulevard',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&auto=format&fit=crop',
    city: 'Los Angeles',
  },
  {
    name: 'Venice Beach',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&auto=format&fit=crop',
    city: 'Los Angeles',
  },
  {
    name: 'Santa Monica Pier',
    image: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=400&auto=format&fit=crop',
    city: 'Los Angeles',
  },
  {
    name: 'Griffith Observatory',
    image: 'https://images.unsplash.com/photo-1609897925380-a163b317f133?w=400&auto=format&fit=crop',
    city: 'Los Angeles',
  },
  {
    name: 'Hollywood Sign',
    image: 'https://images.unsplash.com/photo-1598524722892-4b9b2d8a2b1d?w=400&auto=format&fit=crop',
    city: 'Los Angeles',
  },
  {
    name: 'Rodeo Drive',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&auto=format&fit=crop',
    city: 'Los Angeles',
  },
  {
    name: 'The Getty Center',
    image: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=400&auto=format&fit=crop',
    city: 'Los Angeles',
  },
  {
    name: 'Downtown LA',
    image: 'https://images.unsplash.com/photo-1534190239940-9ba8944ea261?w=400&auto=format&fit=crop',
    city: 'Los Angeles',
  },
  {
    name: 'Malibu Beach',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop',
    city: 'Los Angeles',
  },
  {
    name: 'Beverly Hills',
    image: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=400&auto=format&fit=crop',
    city: 'Los Angeles',
  },

  // Home - Indoor locations (user will provide images)
  {
    name: 'Bedroom',
    image: '/locations/home/bedroom.jpg',
    city: 'Home',
  },
  {
    name: 'Living Room',
    image: '/locations/home/living-room.jpg',
    city: 'Home',
  },
  {
    name: 'Bathroom',
    image: '/locations/home/bathroom.jpg',
    city: 'Home',
  },
  {
    name: 'Kitchen',
    image: '/locations/home/kitchen.jpg',
    city: 'Home',
  },
  {
    name: 'Balcony',
    image: '/locations/home/balcony.jpg',
    city: 'Home',
  },
  {
    name: 'Dining Room',
    image: '/locations/home/dining-room.jpg',
    city: 'Home',
  },

  // Other cities (kept for backward compatibility)
  {
    name: 'Times Square',
    image: 'https://images.unsplash.com/photo-1560574188-6a6774965120?w=400',
    city: 'New York',
  },
  {
    name: 'Central Park',
    image: 'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=400',
    city: 'New York',
  },
  {
    name: 'Brooklyn Bridge',
    image: 'https://images.unsplash.com/photo-1541336032412-2048a678540d?w=400',
    city: 'New York',
  },
  {
    name: 'Miami Beach',
    image: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400',
    city: 'Miami',
  },
  {
    name: 'Las Vegas Strip',
    image: 'https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=400',
    city: 'Las Vegas',
  },

  // Europe
  {
    name: 'Eiffel Tower',
    image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400',
    city: 'Paris',
  },
  {
    name: 'Big Ben',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400',
    city: 'London',
  },
  {
    name: 'Colosseum',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400',
    city: 'Rome',
  },
  {
    name: 'Santorini',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400',
    city: 'Greece',
  },
  {
    name: 'Barcelona Beach',
    image: 'https://images.unsplash.com/photo-1562883676-8c7feb83f09b?w=400',
    city: 'Barcelona',
  },
  {
    name: 'Amsterdam Canals',
    image: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400',
    city: 'Amsterdam',
  },
  {
    name: 'Swiss Alps',
    image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400',
    city: 'Switzerland',
  },

  // Asia
  {
    name: 'Tokyo Tower',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
    city: 'Tokyo',
  },
  {
    name: 'Shibuya Crossing',
    image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400',
    city: 'Tokyo',
  },
  {
    name: 'Seoul Tower',
    image: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=400',
    city: 'Seoul',
  },
  {
    name: 'Marina Bay Sands',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400',
    city: 'Singapore',
  },
  {
    name: 'Bali Beach',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400',
    city: 'Bali',
  },
  {
    name: 'Hong Kong Skyline',
    image: 'https://images.unsplash.com/photo-1536599424071-0c4fdb980a0c?w=400',
    city: 'Hong Kong',
  },
  {
    name: 'Dubai Marina',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400',
    city: 'Dubai',
  },

  // Australia & Oceania
  {
    name: 'Sydney Opera House',
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400',
    city: 'Sydney',
  },
  {
    name: 'Bondi Beach',
    image: 'https://images.unsplash.com/photo-1506374322094-e3c2e4e93a1c?w=400',
    city: 'Sydney',
  },

  // South America
  {
    name: 'Christ the Redeemer',
    image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=400',
    city: 'Rio de Janeiro',
  },
  {
    name: 'Machu Picchu',
    image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=400',
    city: 'Peru',
  },

  // Africa
  {
    name: 'Table Mountain',
    image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=400',
    city: 'Cape Town',
  },
  {
    name: 'Pyramids of Giza',
    image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=400',
    city: 'Cairo',
  },
]

export const OUTFITS = [
  {
    name: 'Blue Bikini',
    image: '/outfits/Blue Bikini.jpg',
    category: 'Beachwear',
  },
  {
    name: 'Blue Sporty',
    image: '/outfits/Blue Sporty.jpg',
    category: 'Athletic',
  },
  {
    name: 'Clean Fit',
    image: '/outfits/Clean Fit.jpg',
    category: 'Casual',
  },
  {
    name: 'Cozy Afternoon',
    image: '/outfits/Cozy Afternoon.jpg',
    category: 'Comfort',
  },
  {
    name: 'Cute',
    image: '/outfits/Cute.jpg',
    category: 'Sweet',
  },
  {
    name: 'Grey Style',
    image: '/outfits/Grey Style.jpg',
    category: 'Chic',
  },
  {
    name: 'Street Show',
    image: '/outfits/Street Show.jpg',
    category: 'Street',
  },
]

export const STYLE_PRESETS = [
  {
    name: 'Fashion',
    preview: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300',
    description: 'Trendy & Chic',
  },
  {
    name: 'Cinematic',
    preview: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300',
    description: 'Film Quality',
  },
  {
    name: 'Dreamy',
    preview: 'https://images.unsplash.com/photo-1518709414768-a88981a4515d?w=300',
    description: 'Soft & Ethereal',
  },
  {
    name: 'Street',
    preview: 'https://images.unsplash.com/photo-1558769132-cb1aea6c766e?w=300',
    description: 'Urban Vibe',
  },
  {
    name: 'Minimal',
    preview: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300',
    description: 'Clean & Modern',
  },
  {
    name: 'Vintage',
    preview: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=300',
    description: 'Retro Nostalgia',
  },
]

export const IDEA_CATEGORIES = [
  {
    title: 'Morning Vibes',
    ideas: [
      'making breakfast for friends in the kitchen',
      'resting on a park bench after morning run',
      'drinking coffee on balcony watching sunrise',
    ],
  },
  {
    title: 'City Explorer',
    ideas: [
      'dancing in the rain at Times Square',
      'sitting alone at a window seat in café',
      'walking through city streets at night',
    ],
  },
  {
    title: 'Peaceful Moments',
    ideas: [
      'reading a book in bed on a rainy day',
      'watching sunset at the beach',
      'studying focused at the library',
    ],
  },
  {
    title: 'Social Time',
    ideas: [
      'at a rooftop party with friends',
      'celebrating with a toast at restaurant',
      'enjoying music in a festival crowd',
    ],
  },
]

export const MOTION_TYPES = [
  { name: 'Walking', description: 'Walk forward a few steps' },
  { name: 'Turn Around', description: 'Turn to face camera' },
  { name: 'Smile', description: 'Show a smile' },
  { name: 'Wave', description: 'Wave at camera' },
  { name: 'Sit Down', description: 'Sit down' },
]

export const SOUND_TYPES = [
  { name: 'Café', preview: 'Soft jazz and conversation' },
  { name: 'Street', preview: 'City traffic and voices' },
  { name: 'Ocean Waves', preview: 'Calm wave sounds' },
  { name: 'Breeze', preview: 'Natural wind sounds' },
  { name: 'Music', preview: 'Background music' },
]

export const EMOTIONS = [
  { emoji: '😊', name: 'Happy', prompt: 'feeling happy and joyful' },
  { emoji: '😍', name: 'Love', prompt: 'feeling loved and affectionate' },
  { emoji: '😎', name: 'Cool', prompt: 'feeling confident and cool' },
  { emoji: '😌', name: 'Peaceful', prompt: 'feeling calm and peaceful' },
  { emoji: '🥳', name: 'Party', prompt: 'feeling celebratory and excited' },
  { emoji: '🤗', name: 'Warm', prompt: 'feeling warm and welcoming' },
  { emoji: '😴', name: 'Sleepy', prompt: 'feeling sleepy and relaxed' },
  { emoji: '🤔', name: 'Thoughtful', prompt: 'feeling thoughtful and contemplative' },
  { emoji: '😋', name: 'Yummy', prompt: 'enjoying delicious food' },
  { emoji: '🥰', name: 'Adoring', prompt: 'feeling absolutely adoring' },
]

export const ACTIVITIES = [
  { emoji: '☕', name: 'Coffee', prompt: 'having coffee' },
  { emoji: '🍜', name: 'Eating', prompt: 'enjoying a meal' },
  { emoji: '📚', name: 'Reading', prompt: 'reading a book' },
  { emoji: '🎵', name: 'Music', prompt: 'listening to music' },
  { emoji: '🏃', name: 'Running', prompt: 'going for a run' },
  { emoji: '🧘', name: 'Yoga', prompt: 'doing yoga' },
  { emoji: '🎨', name: 'Art', prompt: 'creating art' },
  { emoji: '💻', name: 'Working', prompt: 'working on laptop' },
  { emoji: '📸', name: 'Photo', prompt: 'taking photos' },
  { emoji: '🎮', name: 'Gaming', prompt: 'playing video games' },
  { emoji: '🛍️', name: 'Shopping', prompt: 'shopping' },
  { emoji: '🎬', name: 'Movies', prompt: 'watching movies' },
]

// HOW TO ADD PINTEREST IMAGES:
// 1. Go to https://www.pinterest.com/ideas/gen-z-photo-poses/893399866529/
// 2. Download 12 Gen Z pose images from Pinterest
// 3. Save them in /public/poses/ folder with these exact names:
//    - hip-out.jpg, lean-glance.jpg, sit-recline.jpg, side-profile.jpg
//    - arm-stretch.jpg, window-lean.jpg, frog-perspective.jpg, movement.jpg
//    - hands-pockets.jpg, mirror-selfie.jpg, sitting-edge.jpg, hair-flip.jpg
// 4. The app will automatically use your local images
export const POSES = [
  {
    name: 'Hip Out',
    image: '/poses/hip-out.jpg',
    prompt: 'standing with hip out to one side, extended arm in relaxed manner, slight lean, confident and effortless',
    description: 'Classic Gen Z hip-out pose'
  },
  {
    name: 'Lean & Glance',
    image: '/poses/lean-glance.jpg',
    prompt: 'relaxed shoulders, slightly elongated neck, fake step forward, glancing back casually',
    description: 'Pinterest-worthy lean and glance'
  },
  {
    name: 'Sit & Recline',
    image: '/poses/sit-recline.jpg',
    prompt: 'leaning back with arms behind, one leg extended with other leg on lap, chin tilted up slightly',
    description: 'Simple but edgy sitting pose'
  },
  {
    name: 'Side Profile',
    image: '/poses/side-profile.jpg',
    prompt: 'relaxed posture showing side profile, hands in pockets, looking away from camera',
    description: 'Cool side profile moment'
  },
  {
    name: 'Arm Out Stretch',
    image: '/poses/arm-stretch.jpg',
    prompt: 'stretching one arm way out to the side, playful expression, dynamic movement',
    description: 'Trendy arm stretch pose'
  },
  {
    name: 'Window Lean',
    image: '/poses/window-lean.jpg',
    prompt: 'leaning against window or wall, hand touching face or hair, dreamy aesthetic',
    description: 'Aesthetic window lean'
  },
  {
    name: 'Frog Perspective',
    image: '/poses/frog-perspective.jpg',
    prompt: 'shot from very low angle looking up, standing confidently, showing full outfit',
    description: 'Low angle frog perspective'
  },
  {
    name: 'Movement Shot',
    image: '/poses/lean-glance.jpg',
    prompt: 'captured mid-movement, hair flowing, walking or turning, natural and candid',
    description: 'Candid movement capture'
  },
  {
    name: 'Hands in Pockets',
    image: '/poses/hands-pockets.jpg',
    prompt: 'both hands casually in pockets, relaxed stance, looking slightly away',
    description: 'Effortless pocket pose'
  },
  {
    name: 'Mirror Selfie',
    image: '/poses/mirror-selfie.jpg',
    prompt: 'posing in front of mirror, showing off outfit, phone covering face or held at angle',
    description: 'Classic Gen Z mirror selfie'
  },
  {
    name: 'Sitting Edge',
    image: '/poses/sitting-edge.jpg',
    prompt: 'sitting on edge of surface with legs dangling, relaxed and casual vibe',
    description: 'Casual sitting on edge'
  },
  {
    name: 'Hair Flip',
    image: '/poses/hair-flip.jpg',
    prompt: 'captured mid hair flip or hair toss, movement and energy, carefree expression',
    description: 'Dynamic hair flip moment'
  },
]

