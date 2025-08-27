// Debug script to test temporary user creation
// Run this in your browser console on the temp-setup page

console.log("=== Debugging Temporary User Creation ===");

// Test the temp user creation function
async function testTempUserCreation() {
  try {
    console.log("1. Testing database connection...");
    
    // Import the function (you'll need to run this on the actual page)
    const { createTempUser } = await import('/src/integrations/supabase/tempUsers.ts');
    
    console.log("2. Creating temporary user...");
    const result = await createTempUser(
      "mmgahirori@gmail.com", 
      "Admin@123", 
      "Sangam"
    );
    
    console.log("3. Success! User created:", result);
    
  } catch (error) {
    console.error("Error during temp user creation:", error);
    console.log("Error details:", {
      message: error.message,
      stack: error.stack
    });
  }
}

// Check Supabase connection
async function checkSupabaseConnection() {
  try {
    const { supabase } = await import('/src/integrations/supabase/client.ts');
    const { data: { session } } = await supabase.auth.getSession();
    console.log("Current session:", session);
    
    // Test database access
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
      
    if (error) {
      console.error("Database access error:", error);
    } else {
      console.log("Database accessible:", data);
    }
    
  } catch (error) {
    console.error("Supabase connection error:", error);
  }
}

console.log("Run these functions in console:");
console.log("1. checkSupabaseConnection()");
console.log("2. testTempUserCreation()");

// Make functions available globally
window.checkSupabaseConnection = checkSupabaseConnection;
window.testTempUserCreation = testTempUserCreation;
