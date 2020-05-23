const _ = require('lodash')
const functions = require('firebase-functions')
const admin = require('firebase-admin')
const debug = require('debug')('pixem')

admin.initializeApp()

const db = admin.firestore()

const storageBaseUrl = 'https://storage.googleapis.com'
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

const getRandomChar = () => {
  return chars.charAt(Math.floor(Math.random() * chars.length))
}

const createRandomGameCode = () => {
  return [
    getRandomChar(),
    getRandomChar(),
    getRandomChar(),
    getRandomChar(),
  ].join('')
}

const getUniqueGameCode = (existingCodes) => {
  const randomGameCode = createRandomGameCode()

  if (!existingCodes[randomGameCode]) return randomGameCode

  return getUniqueGameCode(existingCodes)
}

const getGameCode = async () => {
  const gamesSnapshot = await db.collection('games').get()
  const existingCodes = {}

  gamesSnapshot.forEach((doc) => {
    const gameCode = doc.data().gameCode

    existingCodes[gameCode] = true
  })

  return getUniqueGameCode(existingCodes)
}

const getDeck = async () => {
  const bucket = admin.storage().bucket()
  const [files] = await bucket.getFiles({ directory: 'deck-a' })
  const deck = []

  files.forEach((file) => {
    const { bucket, name, size } = file.metadata

    if (parseInt(size, 10) === 0) return // it's the directory

    deck.push(`${storageBaseUrl}/${bucket}/${name}`)
  })

  return _.shuffle(deck)
}

exports.createGame = functions.https.onCall(async (data, context) => {
  const player = {
    id: context.auth.uid,
    name: data.name,
  }

  debug('createGame (player: %o)', player)

  const gameCode = await getGameCode()
  const deck = await getDeck()

  await db.collection('games').doc(gameCode).set({
    state: 'JOINING',
    gameCode,
    deck,
    creatorId: player.id,
    players: [
      player,
    ],
  })

  return { gameCode }
})

exports.joinGame = functions.https.onCall(async (data, context) => {
  const player = {
    id: context.auth.uid,
    name: data.name,
  }
  const gameCode = data.gameCode

  debug('joinGame (gameCode: %s | player: %o)', gameCode, player)

  const gameDoc = db.collection('games').doc(gameCode)
  const gameSnapshot = await gameDoc.get()
  const players = gameSnapshot.data().players

  debug('current players: %o', players)

  players.push(player)

  await gameDoc.set({
    players,
  }, {
    merge: true,
  })
})

exports.leaveGame = functions.https.onCall(async (data, context) => {
  const gameCode = data.gameCode
  const playerId = context.auth.uid

  debug('leaveGame (gameCode: %s | player id: %o)', gameCode, playerId)

  const gameDoc = db.collection('games').doc(gameCode)
  const gameSnapshot = await gameDoc.get()
  let players = gameSnapshot.data().players

  debug('current players: %o', players)

  players = players.filter((player) => player.id !== playerId)

  debug('remaining players: %o', players)

  await gameDoc.set({
    players,
  }, {
    merge: true,
  })
})
