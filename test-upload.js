const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testUpload() {
    try {
        const formData = new FormData();
        
        // Create a simple test file
        const testContent = 'This is a test document for upload functionality.';
        fs.writeFileSync('test-upload.txt', testContent);
        
        // Add file to form data
        formData.append('document', fs.createReadStream('test-upload.txt'));
        formData.append('title', 'Test Upload Document');
        formData.append('description', 'Test document for upload functionality');
        formData.append('userId', 1) // Use valid user ID (1 for alice);
        
        console.log('Testing upload to http://localhost:3001/api/upload...');
        
        const response = await axios.post('http://localhost:3001/api/upload', formData, {
            headers: {
                ...formData.getHeaders(),
            },
            timeout: 30000
        });
        
        console.log('✅ Upload successful!');
        console.log('Response status:', response.status);
        console.log('Response data:', JSON.stringify(response.data, null, 2));
        
        // Clean up
        fs.unlinkSync('test-upload.txt');
        
    } catch (error) {
        console.error('❌ Upload failed:');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
            console.log('Headers:', error.response.headers);
        } else if (error.request) {
            console.log('No response received:', error.request);
        } else {
            console.log('Error:', error.message);
        }
        console.log('Full error:', error);
    }
}

testUpload();