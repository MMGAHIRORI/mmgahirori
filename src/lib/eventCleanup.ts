import { supabase } from '@/integrations/supabase/client';

/**
 * Automatically clean up past events from the database
 * This function can be called periodically to remove old events
 */
export const cleanupPastEvents = async (): Promise<{
  deletedCount: number;
  error?: string;
}> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day
    
    // Get events that are older than today
    const { data: pastEvents, error: fetchError } = await supabase
      .from('events')
      .select('id, title, event_date')
      .lt('event_date', today.toISOString().split('T')[0]);
    
    if (fetchError) {
      throw fetchError;
    }
    
    if (!pastEvents || pastEvents.length === 0) {
      return { deletedCount: 0 };
    }
    
    // Delete past events
    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .lt('event_date', today.toISOString().split('T')[0]);
    
    if (deleteError) {
      throw deleteError;
    }
    
    console.log(`Cleaned up ${pastEvents.length} past events`);
    return { deletedCount: pastEvents.length };
    
  } catch (error: any) {
    console.error('Error cleaning up past events:', error);
    return { 
      deletedCount: 0, 
      error: error.message || 'Failed to cleanup past events' 
    };
  }
};

/**
 * Get upcoming events only (today or future)
 */
export const getUpcomingEvents = async () => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('event_date', today)
    .order('event_date', { ascending: true });
    
  if (error) {
    throw error;
  }
  
  return data || [];
};

/**
 * Initialize automatic cleanup service
 * This can be called when the app starts to set up periodic cleanup
 */
export const initializeEventCleanup = () => {
  // Run cleanup immediately
  cleanupPastEvents();
  
  // Set up daily cleanup at midnight
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const msUntilMidnight = tomorrow.getTime() - now.getTime();
  
  // Schedule first cleanup at next midnight
  setTimeout(() => {
    cleanupPastEvents();
    
    // Then run cleanup every 24 hours
    setInterval(cleanupPastEvents, 24 * 60 * 60 * 1000);
  }, msUntilMidnight);
  
  console.log('Event cleanup service initialized');
};
