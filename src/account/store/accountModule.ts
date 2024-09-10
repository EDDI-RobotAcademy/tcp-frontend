import actions, { AccountActions } from "./actions"
import mutations, { AccountMutations } from "./mutations"
import state, { AccountState } from "./states"


export interface AccountModule {
    namespaced: true
    state: AccountState
    actions: AccountActions
    mutations: AccountMutations,
}

const accountModule: AccountModule = {
    namespaced: true,
    state,
    actions,
    mutations,
}

export default accountModule