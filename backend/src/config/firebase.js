const admin = require('firebase-admin'); 
 
if (!admin.apps.length) { 
  admin.initializeApp({ 
    projectId: process.env.FIREBASE_PROJECT_ID || 'medical-english-shadowing-app', 
  }); 
} 
 
module.exports = admin; 
