const admin = require('firebase-admin');

// Firebase Admin SDK初期化
admin.initializeApp({
  projectId: process.env.FIREBASE_PROJECT_ID || 'medical-english-shadowing-app',
});

module.exports = admin;