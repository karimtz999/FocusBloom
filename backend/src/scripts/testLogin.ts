async function testLogin() {
  try {
    console.log('Testing login endpoint...');
    
    const response = await fetch('http://192.168.1.6:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@user.com',
        password: 'test123'
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    const data = await response.text();
    console.log('Response body:', data);
    
    if (response.ok) {
      console.log('✅ Login successful!');
    } else {
      console.log('❌ Login failed');
    }
    
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

testLogin();
