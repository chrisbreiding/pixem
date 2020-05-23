import { observable, action } from 'mobx'

class GameModel {
  @observable state
  @observable gameCode
  @observable deck = []
  @observable creatorId
  @observable players = []

  @action update (props) {
    Object.assign(this, props)
  }
}

export default new GameModel()
