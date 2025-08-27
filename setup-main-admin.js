// Manual script to set current logged-in user as main admin
// Run this in browser console while logged in as admin

const setMainAdminManually = async () => {
  try {
    console.log('Setting up main admin...');
    
    // This will use the setCurrentUserAsMainAdmin function
    const response = await fetch('/api/setup-main-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('Main admin setup successful!');
      alert('You have been set as main admin! Please refresh the page.');
      window.location.reload();
    } else {
      console.error('Setup failed');
    }
  } catch (error) {
    console.error('Error setting up main admin:', error);
    
    // Alternative: Try direct database update (only if you have direct access)
    console.log('Alternative: Go to User Management page and look for the setup dialog');
  }
};

// Usage: Run setMainAdminManually() in browser console
console.log('Main Admin Setup Script Loaded');
console.log('1. Make sure you are logged in as admin');
console.log('2. Go to /admin/users page');
console.log('3. Look for main admin setup dialog');
console.log('Or run: setMainAdminManually()');
