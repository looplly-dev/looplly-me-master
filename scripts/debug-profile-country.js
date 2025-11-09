// Debug script to check profile country_code data
// Run with: node scripts/debug-profile-country.js

console.log('🔍 Checking profile country_code data...\n');

// Instructions for manual debugging
console.log('To debug your profile, open your browser console and run:');
console.log('');
console.log('```javascript');
console.log('// 1. Get current user ID');
console.log('const { data: { session } } = await supabase.auth.getSession();');
console.log('console.log("User ID:", session.user.id);');
console.log('');
console.log('// 2. Check profile data');
console.log('const { data: profile } = await supabase');
console.log('  .from("profiles")');
console.log('  .select("user_id, mobile, country_code, first_name, last_name")');
console.log('  .eq("user_id", session.user.id)');
console.log('  .single();');
console.log('console.log("Profile data:", profile);');
console.log('');
console.log('// 3. If country_code is NULL but mobile exists, extract it');
console.log('if (!profile.country_code && profile.mobile) {');
console.log('  const match = profile.mobile.match(/^(\\+\\d{1,4})/);');
console.log('  if (match) {');
console.log('    const extracted = match[1];');
console.log('    console.log("Extracted country code:", extracted);');
console.log('    ');
console.log('    // Update the profile');
console.log('    const { error } = await supabase');
console.log('      .from("profiles")');
console.log('      .update({ country_code: extracted })');
console.log('      .eq("user_id", session.user.id);');
console.log('    ');
console.log('    if (error) {');
console.log('      console.error("Update failed:", error);');
console.log('    } else {');
console.log('      console.log("✅ Profile updated! Refresh the page.");');
console.log('    }');
console.log('  }');
console.log('}');
console.log('```');
console.log('');
console.log('Or use the Supabase dashboard:');
console.log('1. Go to https://supabase.com/dashboard');
console.log('2. Select your project');
console.log('3. Go to Table Editor > profiles');
console.log('4. Find your user row');
console.log('5. Check the country_code column');
console.log('6. If NULL, manually set it to your dial code (e.g., +27)');
console.log('');
console.log('💡 After fixing, hard refresh the page (Cmd+Shift+R)');
