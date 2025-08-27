-- Update the sample live stream settings with a working YouTube URL for testing
UPDATE live_stream_settings 
SET 
  youtube_embed_url = 'https://www.youtube.com/embed/jfKfPfyJRdk',
  is_live = true,
  stream_title = 'महर्षि मंगल गिरि आश्रम लाइव कथा',
  stream_description = 'नित्य भागवत कथा और आध्यात्मिक सत्संग'
WHERE id = '4d4725b5-6754-43d7-a15d-1cc1ce536881';

-- Update events to have current/future dates so they show on homepage
UPDATE events 
SET event_date = '2025-08-15 10:00:00+00'
WHERE id = '3ae4fcaa-6d75-4730-a5e1-ac259f992c66';

UPDATE events 
SET 
  event_date = '2025-08-20 06:00:00+00',
  is_featured = true
WHERE id = '8aecdcbf-c8ec-4e3d-a3e0-f462d07212af';