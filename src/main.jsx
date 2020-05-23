// import { configure as configureMobx } from 'mobx'
import 'mobx-react/batchingForReactDom'
import React from 'react'
import { render } from 'react-dom'

import App from './app/app'

// TODO: figure out why useLocalStore fns trigger no action
// configureMobx({ enforceActions: 'observed' })

render(<App />, document.getElementById('app'))
