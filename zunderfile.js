const zunder = require('zunder')

const { browserifyOptions } = zunder.config
const { babel } = zunder.defaults

// enable sourcemaps
browserifyOptions.debug = true
// enable async/await
browserifyOptions.transform[0][1].plugins.push([
  babel.pluginTransformRuntime.module,
  babel.pluginTransformRuntime.options,
])

// FIXME: why isn't mobx building in development mode?
zunder.setConfig({
  browserifyOptions,
  stylesheets: {
    'src/main.styl': {
      watch: ['src/**/*.styl'],
      output: 'app.css',
    },
  },
})
