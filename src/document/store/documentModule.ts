import actions, { DocumentActions } from './actions'
import mutations, { DocumentMutations } from './mutations'
import state, { DocumentState } from './states'


export interface DocumentModule {
    namespaced: true
    state: DocumentState
    actions: DocumentActions
    mutations: DocumentMutations
}

const documentModule: DocumentModule = {
    namespaced: true,
    state,
    actions,
    mutations
}

export default documentModule