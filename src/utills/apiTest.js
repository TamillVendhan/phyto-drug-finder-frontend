import { plantsAPI, statsAPI, compoundsAPI } from '../api/api';

/**
 * Comprehensive API Testing Utility
 * Tests all critical endpoints used in Home component
 */

export const testAPIs = async () => {
  console.log('🚀 Starting API Tests...\n');
  
  const tests = [
    {
      name: 'Featured Plants',
      fn: () => plantsAPI.featured(),
      description: 'Fetches featured plants for homepage'
    },
    {
      name: 'Plant Stats',
      fn: () => plantsAPI.stats(),
      description: 'Gets database statistics'
    },
    {
      name: 'Search Plants',
      fn: () => plantsAPI.search('tulsi'),
      description: 'Tests plant search functionality'
    },
    {
      name: 'List Plants',
      fn: () => plantsAPI.list({ limit: 5 }),
      description: 'Gets paginated plant list'
    },
    {
      name: 'Plant Families',
      fn: () => plantsAPI.families(),
      description: 'Gets all plant families'
    }
  ];

  const results = {
    passed: 0,
    failed: 0,
    errors: []
  };

  for (const test of tests) {
    try {
      console.log(`📋 Testing: ${test.name}`);
      console.log(`   Description: ${test.description}`);
      
      const startTime = performance.now();
      const result = await test.fn();
      const endTime = performance.now();
      
      console.log(`   ✅ PASSED (${(endTime - startTime).toFixed(2)}ms)`);
      console.log(`   Response:`, result);
      console.log('');
      
      results.passed++;
    } catch (error) {
      console.error(`   ❌ FAILED: ${test.name}`);
      console.error(`   Error: ${error.message}`);
      console.error(`   Status: ${error.status || 'N/A'}`);
      console.error(`   Data:`, error.data);
      console.log('');
      
      results.failed++;
      results.errors.push({
        test: test.name,
        error: error.message,
        status: error.status
      });
    }
  }

  // Print Summary
  console.log('═══════════════════════════════════════');
  console.log('📊 TEST SUMMARY');
  console.log('═══════════════════════════════════════');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / tests.length) * 100).toFixed(1)}%`);
  
  if (results.errors.length > 0) {
    console.log('\n⚠️  Failed Tests:');
    results.errors.forEach(err => {
      console.log(`   • ${err.test}: ${err.error}`);
    });
  }
  
  console.log('═══════════════════════════════════════\n');
  
  return results;
};

/**
 * Test individual endpoint
 */
export const testEndpoint = async (name, apiFn) => {
  console.log(`\n🔍 Testing: ${name}`);
  try {
    const result = await apiFn();
    console.log('✅ Success:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Test response structure
 */
export const validateResponse = (response, expectedStructure) => {
  console.log('🔎 Validating Response Structure...');
  
  const errors = [];
  
  for (const [key, type] of Object.entries(expectedStructure)) {
    if (!(key in response)) {
      errors.push(`Missing field: ${key}`);
    } else if (typeof response[key] !== type) {
      errors.push(`Invalid type for ${key}: expected ${type}, got ${typeof response[key]}`);
    }
  }
  
  if (errors.length > 0) {
    console.error('❌ Validation Failed:');
    errors.forEach(err => console.error(`   • ${err}`));
    return false;
  }
  
  console.log('✅ Validation Passed');
  return true;
};

/**
 * Test API connection
 */
export const testConnection = async () => {
  console.log('🌐 Testing API Connection...');
  try {
    const result = await plantsAPI.stats();
    console.log('✅ Connected to API successfully');
    console.log('📊 Server Stats:', result);
    return true;
  } catch (error) {
    console.error('❌ Connection Failed:', error.message);
    console.error('💡 Check:');
    console.error('   1. Is the backend server running?');
    console.error('   2. Is REACT_APP_API_URL set correctly?');
    console.error('   3. Are CORS headers configured?');
    return false;
  }
};

export default testAPIs;
