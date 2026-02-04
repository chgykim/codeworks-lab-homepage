const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Admin email for authorization check (from environment variable)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';

// Initialize Firebase Admin SDK
let firebaseInitialized = false;

function initializeFirebase() {
    if (firebaseInitialized) return;

    try {
        // Try to load service account from file first (development)
        const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json');

        if (fs.existsSync(serviceAccountPath)) {
            const serviceAccount = require(serviceAccountPath);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            firebaseInitialized = true;
            console.log('Firebase Admin SDK initialized with service account file');
            return;
        }

        // Fall back to environment variables (production)
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            firebaseInitialized = true;
            console.log('Firebase Admin SDK initialized with environment variable');
            return;
        }

        if (
            process.env.FIREBASE_PROJECT_ID &&
            process.env.FIREBASE_PRIVATE_KEY &&
            process.env.FIREBASE_CLIENT_EMAIL
        ) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL
                })
            });
            firebaseInitialized = true;
            console.log('Firebase Admin SDK initialized with individual env vars');
            return;
        }

        console.warn('Firebase credentials not found. Firebase authentication will not work.');
    } catch (error) {
        console.error('Failed to initialize Firebase Admin SDK:', error.message);
    }
}

// Verify Firebase ID token
async function verifyIdToken(idToken) {
    if (!firebaseInitialized) {
        throw new Error('Firebase not initialized');
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        return {
            uid: decodedToken.uid,
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified,
            displayName: decodedToken.name,
            photoURL: decodedToken.picture,
            isAdmin: decodedToken.email === ADMIN_EMAIL
        };
    } catch (error) {
        console.error('Token verification failed:', error.message);
        throw error;
    }
}

// Check if user is admin by email
function isAdminEmail(email) {
    return email === ADMIN_EMAIL;
}

module.exports = {
    initializeFirebase,
    verifyIdToken,
    isAdminEmail,
    ADMIN_EMAIL
};
