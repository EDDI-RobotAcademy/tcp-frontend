import actions, { GoogleAuthenticationActions } from "./actions"
import mutations, { GoogleAuthenticationMutations } from "./mutations"
import state, { GoogleAuthenticationState } from "./states"

export interface GoogleAuthenticationModule {
    namespaced: true
    state: GoogleAuthenticationState
    actions: GoogleAuthenticationActions
    mutations: GoogleAuthenticationMutations 
}

const googleAuthenticationModule: GoogleAuthenticationModule = {
    namespaced: true,
    state,
    actions,
    mutations,
}

export default googleAuthenticationModule
