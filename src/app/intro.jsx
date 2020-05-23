import { observer, useLocalStore } from 'mobx-react'
import React from 'react'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/fontawesome-pro-light'

import { send } from '../lib/firebase'

const CHOOSE = 'CHOOSE'
const JOIN_GAME = 'JOIN_GAME'
const NEW_GAME = 'NEW_GAME'

const Choose = ({ onChoose }) => (
  <section className='choose'>
    <button onClick={onChoose.bind(null, JOIN_GAME)}>Join Existing Game</button>
    <p> ― OR ― </p>
    <button onClick={onChoose.bind(null, NEW_GAME)}>Create New Game</button>
  </section>
)

const nonAlphanumericRegex = /[^ a-zA-Z0-9]+/g
const nonUppercaseAlphaRegex = /[^A-Z]+/g
const nameCharacterLimit = 20
const gameCodeCharacterLimit = 4

const useNameState = () => {
  return useLocalStore(() => ({
    name: '',
    nameValid: true,
    setName (name = '') {
      name = name
      .replace(nonAlphanumericRegex, '')
      .substring(0, nameCharacterLimit)

      this.setNameValid(true)
      this.name = name
    },
    setNameValid (isValid) {
      this.nameValid = isValid
    },
  }))
}

const JoinGame = observer(({ onJoining }) => {
  const state = useLocalStore(() => ({
    gameCode: '',
    gameCodeValid: true,
    setGameCode (gameCode) {
      gameCode = gameCode
      .toUpperCase()
      .replace(nonUppercaseAlphaRegex, '')
      .trim()
      .substring(0, gameCodeCharacterLimit)

      this.setGameCodeValid(true)
      this.gameCode = gameCode
    },
    setGameCodeValid (isValid) {
      this.gameCodeValid = isValid
    },
  }))

  const nameState = useNameState()

  const updateName = (e) => {
    nameState.setName(e.target.value)
  }

  const updateGameCode = (e) => {
    state.setGameCode(e.target.value)
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    const gameCode = state.gameCode

    // TODO: validate name and game code
    // TODO: add user to game
    // TODO: add game code to localStorage

    await send('joinGame', {
      name: nameState.name,
      gameCode,
    })
    onJoining(gameCode)

    localStorage.gameCode = gameCode
  }

  return (
    <form onSubmit={onSubmit}>
      <fieldset>
        <label>Name</label>
        <input
          placeholder='Your Name'
          value={nameState.name}
          onChange={updateName}
        />
      </fieldset>
      <fieldset>
        <label>Room Code</label>
        <input
          placeholder='4 Letter Room Code'
          value={state.gameCode}
          onChange={updateGameCode}
        />
      </fieldset>
      <fieldset>
        <button type='submit'>Join Game</button>
      </fieldset>
    </form>
  )
})

const NewGame = observer(({ onJoining }) => {
  const nameState = useNameState()

  const updateName = (e) => {
    nameState.setName(e.target.value)
  }

  const createNewGame = async (e) => {
    e.preventDefault()

    // TODO: validate name
    // TODO: start loading animation

    const name = nameState.name

    const { gameCode } = await send('createGame', { name })

    onJoining(gameCode)
    // TODO: save game code in localStorage (also {creator: true} ?)
    // TODO: on load, look for uid and game code and take to right place
    // TODO: stop loading animation
  }

  return (
    <form onSubmit={createNewGame}>
      <fieldset>
        <label>Name</label>
        <input
          placeholder='Your Name'
          value={nameState.name}
          onChange={updateName}
        />
      </fieldset>
      <fieldset>
        <button type='submit'>Create New Game</button>
      </fieldset>
    </form>
  )
})

const Backable = ({ children, onBack }) => (
  <section className='new-game'>
    <button onClick={onBack}>
      <Icon className='icon' icon={faChevronLeft} /> Back
    </button>
    {children}
  </section>
)

const Intro = observer(({ onJoining }) => {
  const state = useLocalStore(() => ({
    state: CHOOSE,
    setState (state) {
      this.state = state
    },
  }))

  switch (state.state) {
    case JOIN_GAME:
      return (
        <Backable onBack={state.setState.bind(state, CHOOSE)}>
          <JoinGame onJoining={onJoining} />
        </Backable>
      )
    case NEW_GAME:
      return (
        <Backable onBack={state.setState.bind(state, CHOOSE)}>
          <NewGame onJoining={onJoining} />
        </Backable>
      )
    default:
      return <Choose onChoose={state.setState} />
  }
})

export default Intro

// var isOnIOS = navigator.userAgent.match(/iPad/i)
//   || navigator.userAgent.match(/iPhone/i)
//   || navigator.userAgent.match(/iPod/i);
// var eventType = isOnIOS ? 'pagehide' : 'unload';
// window.addEventListener(eventType, this.removeUser);
