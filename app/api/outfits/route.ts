import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

// GET: Fetch all custom outfits
export async function GET(request: NextRequest) {
  try {
    // Return empty array if Supabase is not configured
    if (!isSupabaseConfigured || !supabase) {
      console.log('Supabase not configured, returning empty outfits array')
      return NextResponse.json({ success: true, outfits: [] })
    }

    const { data, error } = await supabase
      .from('custom_outfits')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching outfits:', error)
      // Return empty array if table doesn't exist yet
      return NextResponse.json({ success: true, outfits: [], error: error.message })
    }

    return NextResponse.json({ success: true, outfits: data || [] })
  } catch (error) {
    console.error('Exception fetching outfits:', error)
    // Return empty array on error to avoid breaking the frontend
    return NextResponse.json({ success: true, outfits: [], error: 'Server error' })
  }
}

// POST: Save a new custom outfit
export async function POST(request: NextRequest) {
  try {
    // Return error if Supabase is not configured
    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json(
        { error: 'Cloud storage not configured. Please add Supabase environment variables.' },
        { status: 503 }
      )
    }

    const { name, image, category } = await request.json()

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
      const filename = `outfits/${Date.now()}-${name.replace(/\s+/g, '-')}.jpg`

      const blob = await put(filename, buffer, {
        access: 'public',
        contentType: 'image/jpeg',
      })

      imageUrl = blob.url
    }

    // Save to Supabase
    const { data, error } = await supabase
      .from('custom_outfits')
      .insert([
        {
          name,
          image: imageUrl,
          category: category || 'Custom',
        },
      ])
      .select()

    if (error) {
      console.error('Error saving outfit:', error)
      return NextResponse.json({ error: 'Failed to save outfit' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      outfit: data[0],
      message: 'Outfit saved to cloud successfully'
    })
  } catch (error) {
    console.error('Exception saving outfit:', error)
    return NextResponse.json({
      error: 'Server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// DELETE: Remove a custom outfit
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
      return NextResponse.json({ error: 'Missing outfit ID' }, { status: 400 })
    }

    const { error } = await supabase
      .from('custom_outfits')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting outfit:', error)
      return NextResponse.json({ error: 'Failed to delete outfit' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Outfit deleted' })
  } catch (error) {
    console.error('Exception deleting outfit:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
