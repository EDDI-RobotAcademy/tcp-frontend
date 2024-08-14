import actions, { UserInputActions } from "./actions"
import mutations, { UserInputMutations } from "./mutations"
import state, { UserInputState } from "./states"


export interface UserInputModule {
    namespaced: true
    state: UserInputState
    actions: UserInputActions,
    mutations: UserInputMutations
}

const userInputModule: UserInputModule = {
    namespaced: true,
    state,
    actions,
    mutations
}

export default userInputModule