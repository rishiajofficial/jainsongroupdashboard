// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://itczuhvcmjlwbfyyuidt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0Y3p1aHZjbWpsd2JmeXl1aWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwOTAyNDksImV4cCI6MjA1NjY2NjI0OX0.y1tzZ5IoX0rfPRX8ouY9zR7BMZrC0LiMWbaOig_D0vc";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);