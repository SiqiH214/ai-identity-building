import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

// GET: Fetch all custom locations
export async function GET(request: NextRequest) {
  try {
    // Return empty array if Supabase is not configured
    if (!isSupabaseConfigured || !supabase) {
      console.log('Supabase not configured, returning empty locations array')
      return NextResponse.json({ success: true, locations: [] })
    }

    const { data, error } = await supabase
      .from('custom_locations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching locations:', error)
      // Return empty array if table doesn't exist yet
      return NextResponse.json({ success: true, locations: [], error: error.message })
    }

    return NextResponse.json({ success: true, locations: data || [] })
  } catch (error) {
    console.error('Exception fetching locations:', error)
    // Return empty array on error to avoid breaking the frontend
    return NextResponse.json({ success: true, locations: [], error: 'Server error' })
  }
}

// POST: Save a new custom location
export async function POST(request: NextRequest) {
  try {
    // Return error if Supabase is not configured
    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json(
        { error: 'Cloud storage not configured. Please add Supabase environment variables.' },
        { status: 503 }
      )
    }

    const { name, image, city } = await request.json()

    if (!name || !image) {
      return NextResponse.json(
        { error: 'Missing required fields: name and image' },
        { status: 400 }
      )
    }

    // Upload image to Vercel Blob Storage
    let imageUrl = image

    // If image is a base64 string, upload to Blob
    if (image.startsWith('data:image')) {
      const base64Data = image.split(',')[1]
      const buffer = Buffer.from(base64Data, 'base64')
      const filename = `locations/${Date.now()}-${name.replace(/\s+/g, '-')}.jpg`

      const blob = await put(filename, buffer, {
        access: 'public',
        contentType: 'image/jpeg',
      })

      imageUrl = blob.url
    }

    // Save to Supabase
    const { data, error } = await supabase
      .from('custom_locations')
      .insert([
        {
          name,
          image: imageUrl,
          city: city || 'Custom',
        },
      ])
      .select()

    if (error) {
      console.error('Error saving location:', error)
      return NextResponse.json({ error: 'Failed to save location' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      location: data[0],
      message: 'Location saved to cloud successfully'
    })
  } catch (error) {
    console.error('Exception saving location:', error)
    return NextResponse.json({
      error: 'Server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// DELETE: Remove a custom location
export async function DELETE(request: NextRequest) {
  try {
    // Return error if Supabase is not configured
    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json(
        { error: 'Cloud storage not configured. Please add Supabase environment variables.' },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing location ID' }, { status: 400 })
    }

    const { error } = await supabase
      .from('custom_locations')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting location:', error)
      return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Location deleted' })
  } catch (error) {
    console.error('Exception deleting location:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
