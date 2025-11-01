import { API_BASE_URL } from '@env';

export const testAPIConnection = async () => {
  console.log('Testing API connection...');
  console.log('API_BASE_URL:', API_BASE_URL);
  
  try {
    // Test 1: Basic connectivity
    console.log('\n1. Testing basic connectivity...');
    const response = await fetch(API_BASE_URL.replace('/api', ''), {
      method: 'GET',
    });
    console.log('Basic connection status:', response.status);
    
    // Test 2: Test login endpoint
    console.log('\n2. Testing login endpoint...');
    const loginResponse = await fetch(`${API_BASE_URL}/Auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'test123'
      })
    });
    
    console.log('Login endpoint status:', loginResponse.status);
    const loginText = await loginResponse.text();
    console.log('Login response:', loginText);
    
    // Test 3: Check CORS headers
    console.log('\n3. Checking CORS headers...');
    console.log('Access-Control-Allow-Origin:', loginResponse.headers.get('access-control-allow-origin'));
    console.log('Access-Control-Allow-Methods:', loginResponse.headers.get('access-control-allow-methods'));
    
    return {
      success: true,
      apiUrl: API_BASE_URL,
      basicConnection: response.status,
      loginEndpoint: loginResponse.status
    };
    
  } catch (error: any) {
    console.error('\n❌ Connection test failed:', error.message);
    console.error('Error details:', error);
    
    return {
      success: false,
      apiUrl: API_BASE_URL,
      error: error.message,
      errorDetails: error
    };
  }
};

// Function to display connection info
export const displayConnectionInfo = () => {
  console.log('\n📱 Mobile App Connection Info:');
  console.log('================================');
  console.log('API_BASE_URL:', API_BASE_URL);
  console.log('Expected format: http://YOUR_IP:5264/api');
  console.log('\n🔍 Troubleshooting tips:');
  console.log('1. Ensure backend is running with: dotnet run --urls "http://0.0.0.0:5264"');
  console.log('2. Check your IP with: ipconfig (look for IPv4 Address)');
  console.log('3. Ensure phone and computer are on same Wi-Fi');
  console.log('4. Check Windows Firewall allows port 5264');
  console.log('================================\n');
};
