const firebase = require('firebase/app')
require('firebase/auth')
require('firebase/firestore')
require('firebase/storage')

require('dotenv').config()

const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.DATABASE_URL,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDERID,
    appId: process.env.APP_ID
}

const init = firebase.initializeApp(firebaseConfig)

const db = init.firestore()
const auth = init.auth()
const fs = firebase.firestore
const fbauth = firebase.auth
const storage = firebase.storage().ref()

module.exports = { db, auth, fs, fbauth, storage }