import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import { faImage } from '@fortawesome/fontawesome-pro-light'
import { observer, useLocalStore } from 'mobx-react'
import React, { useEffect } from 'react'

import Intro from './intro'
import { initialize, signIn, watchDoc, send } from '../lib/firebase'
import gameModel from '../lib/game-model'

const INTRO = 'INTRO'
const JOINING = 'JOINING'

const Joining = observer(({ gameCode }) => {
  useEffect(() => {
    watchDoc(`games/${gameCode}`, (gameData) => {
      console.log('gameData:', gameData)

      gameModel.update(gameData)
    })
  }, [true])

  return (
    <section className='joining'>
      <p>Game Code: {gameCode}</p>
      <ul className='players'>
        {gameModel.players.map(({ name, id }) => (
          <li className='image' key={id}>
            {name}
          </li>
        ))}
      </ul>
    </section>
  )
})

const App = observer(() => {
  const state = useLocalStore(() => ({
    gameCode: null,
    state: INTRO,
    setGameCode (gameCode) {
      this.gameCode = gameCode
    },
    setState (state) {
      this.state = state
    },
  }))

  useEffect(() => {
    initialize()
    signIn()

    const gameCode = localStorage.gameCode

    if (gameCode) {
      state.setGameCode(gameCode)
      state.setState(JOINING)
    }
  }, [true])

  const onJoining = (gameCode) => {
    state.setGameCode(gameCode)
    state.setState(JOINING)
  }

  // TODO: if creator leaves game, warn that the game will be
  // ended and then do it
  // optionally, allow to transfer ownership to another player
  const leaveGame = () => {
    send('leaveGame', { gameCode: state.gameCode })

    delete localStorage.gameCode
    state.setGameCode(null)
    state.setState(INTRO)
  }

  const content = () => {
    switch (state.state) {
      case JOINING:
        return <Joining gameCode={state.gameCode} />
      default:
        return <Intro onJoining={onJoining} />
    }
  }

  // TODO: add loader before data is initially loaded

  return (
    <div className='container'>
      <header>
        <Icon className='icon' icon={faImage} />
        <h1>Pix'em!</h1>
      </header>
      {state.gameCode && <div>
        <button onClick={leaveGame}>Leave Game</button>
      </div>}
      {content()}
    </div>
  )
})

export default App
