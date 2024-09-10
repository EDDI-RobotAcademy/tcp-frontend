import actions, { CommunityActions } from './actions'
import mutations, { CommunityMutations } from './mutations'
import state, { CommunityState } from './states'


export interface CommunityModule {
    namespaced: true
    state: CommunityState
    actions: CommunityActions
    mutations: CommunityMutations
}

const communityModule: CommunityModule = {
    namespaced: true,
    state,
    actions,
    mutations
}

export default communityModule