// generate-env.js
const fs = require('fs');

// The path to the template and the output file in the public directory
const templatePath = 'public/env.template.js';
const outputPath = 'public/env.js';

// Read the template file
fs.readFile(templatePath, 'utf8', (err, data) => {
  if (err) {
    return console.error('Error reading env.template.js:', err);
  }

  // Get the CLIENT_ID from Vercel's environment variables.
  // Provide a fallback for local development if you have a .env file loaded.
  const clientId = process.env.CLIENT_ID || '';

  if (!clientId) {
    console.warn('Warning: CLIENT_ID environment variable not found.');
  }

  // Replace the placeholder with the actual environment variable
  const result = data.replace(/%CLIENT_ID%/g, clientId);

  // Write the final env.js file
  fs.writeFile(outputPath, result, 'utf8', (err) => {
    if (err) {
      return console.error('Error writing env.js:', err);
    }
    console.log('Successfully generated env.js');
  });
});