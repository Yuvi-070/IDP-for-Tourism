
import { createClient } from '@supabase/supabase-js';
import { Itinerary, ChatMessage } from '../types';

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
