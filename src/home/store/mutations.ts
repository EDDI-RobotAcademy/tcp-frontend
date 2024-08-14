import { MutationTree } from "vuex";
import { UserInputState } from "./states";
import { REQUEST_USER_INPUT_TO_FASTAPI } from "./mutation-types";

export interface UserInputMutations extends MutationTree<UserInputState> {
    [REQUEST_USER_INPUT_TO_FASTAPI](state: UserInputState, settingValue: string): void
}

const mutations: MutationTree<UserInputState> = {
    [REQUEST_USER_INPUT_TO_FASTAPI](state: UserInputState, settingValue: string): void {
        state.userInput = settingValue
    }
}

export default mutations as UserInputMutations