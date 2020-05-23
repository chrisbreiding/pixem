import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import 'firebase/firestore'
import 'firebase/functions'

// Events

export const watchDoc = (path, callback) => {
  return firebase.firestore().doc(path).onSnapshot((snapshot) => {
    if (!snapshot.exists) return

    callback(snapshot.data())
    // callback({
    //   id: snapshot.id,
    //   value: snapshot.data(),
    // })
  })
}

const watchCollection = (path, callbacks) => {
  return firebase.firestore().collection(path).onSnapshot((snapshot) => {
    snapshot.docChanges.forEach((change) => {
      if (callbacks[change.type]) {
        callbacks[change.type]({
          id: change.doc.id,
          value: change.doc.data(),
        })
      }
    })
  })
}

const when = (path) => {
  return firebase.firestore().doc(path).get().then((snapshot) => {
    if (!snapshot.exists) return

    return {
      id: snapshot.key,
      value: snapshot.data(),
    }
  })
}

const whenLoaded = () => {
  return Promise.all([
    firebase.firestore().collection('lists').get(),
    firebase.firestore().collection('users').get(),
  ])
}

// Data

const add = (path, value) => {
  return firebase.firestore().collection(path).add(value).then((docRef) => {
    return docRef.id
  })
}

const remove = (path) => {
  return firebase.firestore().doc(path).delete()
}

const update = (path, value) => {
  return firebase.firestore().doc(path).set(value, { merge: true })
}


//
// ---------------------------
//


// App

export const initialize = () => {
  firebase.initializeApp({
    apiKey: 'AIzaSyCSfdwRWP5_uPWGE5A8MlVxEOdCNRuqwm0',
    authDomain: 'pixem1.firebaseapp.com',
    databaseURL: 'https://pixem1.firebaseio.com',
    projectId: 'pixem1',
    storageBucket: 'pixem1.appspot.com',
    messagingSenderId: '474617285054',
    appId: '1:474617285054:web:79a7d129e93e426aee51ef',
    measurementId: 'G-0XF0VDJKZB',
  })

  if (location.hostname === 'localhost') {
    firebase.functions().useFunctionsEmulator('http://localhost:5001')
  }

  // firebase.analytics()
}

// Auth

export const getCurrentUser = () => {
  return firebase.auth().currentUser
}

// const onAuthStateChanged = (callback) => {
//   firebase.auth().onAuthStateChanged(callback)
// }

export const signIn = async () => {
  const result = await firebase.auth().signInAnonymously()

  console.log('signed in, uid:', result.user.uid)

  return result
}

const signOut = async () => {
  return await firebase.auth().signOut()
}

// Functions

export const send = async (message, data) => {
  const result = await firebase.functions().httpsCallable(message)(data)

  return result.data
}
