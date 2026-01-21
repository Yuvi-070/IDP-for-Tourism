import { createClient } from '@supabase/supabase-js';
import { Itinerary, ChatMessage, Booking, RealtimeMessage } from '../types';

// Hardcoded credentials
// IMPORTANT: Ensure these match your specific Supabase project settings if you have created your own.
let SUPABASE_URL = 'https://whxzlfsetkcblmcjutwo.supabase.co';
let SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoeHpsZnNldGtjYmxtY2p1dHdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NTQ1MTIsImV4cCI6MjA4NDEzMDUxMn0.RBwCdDQuOX62YUi_fBSUOfXEKeqPs5FhlwA5sSvF1HU';

try {
  if (typeof process !== 'undefined' && process.env) {
    SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || SUPABASE_URL;
    SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;
  }
} catch (e) {
  console.warn("Environment access failed, using hardcoded Supabase credentials.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper for Google Login
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });
  if (error) throw error;
  return data;
};

// Helper to save finalized itinerary (Upsert logic)
export const saveItineraryToDB = async (userId: string, itinerary: Itinerary, recordId?: string) => {
  try {
    const cleanItinerary = { ...itinerary };
    
    if (recordId) {
      const { data, error } = await supabase
        .from('itineraries')
        .update({ data: cleanItinerary, deleted_at: null })
        .eq('id', recordId)
        .select();
      
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('itineraries')
        .insert([
          { user_id: userId, data: cleanItinerary }
        ])
        .select();
      
      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.warn("Save itinerary failed:", error);
    return null;
  }
};

// HARD DELETE HELPER
// Permanently removes the row from the database.
export const deleteItinerary = async (recordId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: { message: "Not authenticated" } };

    console.log(`[Delete] Permanently removing itinerary ${recordId}...`);

    const { error } = await supabase
      .from('itineraries')
      .delete()
      .eq('id', recordId);

    if (error) {
      console.error("[Delete] Database error:", error);
      return { success: false, error };
    }

    return { success: true };

  } catch (error: any) {
    console.error("[Delete] Unexpected exception:", error);
    return { success: false, error };
  }
};

// Helper to get user itineraries (Filtered)
export const getUserItineraries = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('itineraries')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null) // Only fetch active plans if using mixed modes, though hard delete removes rows.
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.warn("Fetch itineraries failed:", error);
    return [];
  }
};

// Helper to get recent itineraries (Filtered)
export const getRecentItineraries = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('itineraries')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(10); 

    if (error) throw error;
    return data;
  } catch (error) {
    console.warn("Fetch recent itineraries failed:", error);
    return [];
  }
};

// --- BOOKING & MESSAGING SERVICES ---

export const createBookingRequest = async (guideId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in");

  const { data, error } = await supabase
    .from('bookings')
    .insert([{ user_id: user.id, guide_id: guideId, status: 'pending' }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getMyBookings = async (role: 'user' | 'guide') => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const column = role === 'user' ? 'user_id' : 'guide_id';
  
  try {
    // Attempt 1: Standard Relational Query
    // This requires Foreign Keys to be correctly set up in the DB
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        guides:guide_id (*),
        profiles:user_id (email, id, first_name, last_name) 
      `)
      .eq(column, user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data.map((b: any) => ({
        ...b,
        guide: b.guides,
        traveler: b.profiles
      }));
    }

    // Attempt 2: Fallback if Foreign Keys are missing (PGRST200)
    // This allows the app to work even if the DB schema is slightly broken
    if (error && error.code === 'PGRST200') {
      console.warn("Foreign Key relationship missing in DB. Falling back to manual join.", error);

      // Fetch raw bookings
      const { data: rawBookings, error: rawError } = await supabase
        .from('bookings')
        .select('*')
        .eq(column, user.id)
        .order('created_at', { ascending: false });

      if (rawError) throw rawError;
      if (!rawBookings || rawBookings.length === 0) return [];

      // Collect IDs to fetch related data
      const guideIds = Array.from(new Set(rawBookings.map((b: any) => b.guide_id))).filter(Boolean);
      const userIds = Array.from(new Set(rawBookings.map((b: any) => b.user_id))).filter(Boolean);

      // Fetch related entities in parallel
      const [guidesRes, profilesRes] = await Promise.all([
        guideIds.length > 0 ? supabase.from('guides').select('*').in('id', guideIds) : { data: [] },
        userIds.length > 0 ? supabase.from('profiles').select('email, id, first_name, last_name').in('id', userIds) : { data: [] }
      ]);

      const guidesMap = new Map((guidesRes.data || []).map((g: any) => [g.id, g]));
      const profilesMap = new Map((profilesRes.data || []).map((p: any) => [p.id, p]));

      // Stitch data together
      return rawBookings.map((b: any) => ({
        ...b,
        guide: guidesMap.get(b.guide_id) || null,
        traveler: profilesMap.get(b.user_id) || null
      }));
    }

    // Throw if it's a different error
    if (error) throw error;
    
    return [];
  } catch (error) {
    console.error("Fetch bookings failed", error);
    return [];
  }
};

export const updateBookingStatus = async (bookingId: string, status: 'approved' | 'rejected') => {
  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId);

  if (error) throw error;
};

export const getMessages = async (bookingId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as RealtimeMessage[];
};

export const sendMessage = async (bookingId: string, content: string, type: 'text' | 'itinerary' = 'text', metadata?: any) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No user");

  const { error } = await supabase
    .from('messages')
    .insert([{
      booking_id: bookingId,
      sender_id: user.id,
      content,
      message_type: type,
      metadata
    }]);

  if (error) throw error;
};