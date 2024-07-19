import actions, { BoardActions } from './actions'
import mutations, { BoardMutations } from './mutations'
import state, { BoardState } from './states'

export interface BoardModule {
    namespaced: true
    state: BoardState
    actions: BoardActions
    mutations: BoardMutations
}

const boardModule: BoardModule = {
    namespaced: true,
    state,
    actions,
    mutations,
}

export default boardModule