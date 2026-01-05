import React, { useState } from 'react';
import testAPIs, { testConnection, testEndpoint } from '../utills/apiTest.js';
import { plantsAPI } from '../api/api';

const ApiTestPage = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const testResults = await testAPIs();
    setResults(testResults);
    setLoading(false);
  };

  const runConnectionTest = async () => {
    await testConnection();
  };

  const runSingleTest = async () => {
    await testEndpoint('Featured Plants', () => plantsAPI.featured());
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace' }}>
      <h1>🧪 API Testing Dashboard</h1>
      
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={runTests}
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            cursor: 'pointer'
          }}
        >
          {loading ? '⏳ Running...' : '▶️ Run All Tests'}
        </button>
        
        <button 
          onClick={runConnectionTest}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            cursor: 'pointer'
          }}
        >
          🌐 Test Connection
        </button>
        
        <button 
          onClick={runSingleTest}
          style={{ 
            padding: '10px 20px',
            cursor: 'pointer'
          }}
        >
          🔍 Test Featured Plants
        </button>
      </div>

      {results && (
        <div style={{ 
          marginTop: '30px', 
          padding: '20px', 
          backgroundColor: '#f5f5f5',
          borderRadius: '8px'
        }}>
          <h2>📊 Test Results</h2>
          <p>✅ Passed: {results.passed}</p>
          <p>❌ Failed: {results.failed}</p>
          <p>📈 Success Rate: {((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%</p>
          
          {results.errors.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3>⚠️ Failed Tests:</h3>
              <ul>
                {results.errors.map((err, i) => (
                  <li key={i}>{err.test}: {err.error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        backgroundColor: '#fff3cd',
        borderRadius: '8px'
      }}>
        <h3>💡 Instructions:</h3>
        <ol>
          <li>Open Browser Console (F12)</li>
          <li>Click "Run All Tests"</li>
          <li>Check console for detailed logs</li>
        </ol>
      </div>
    </div>
  );
};

export default ApiTestPage;
