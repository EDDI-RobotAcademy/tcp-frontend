import { ActionContext } from "vuex"
import { AxiosResponse } from "axios"
import axiosInst from "@/utility/axiosInstance"
import { UserInputState } from "./states"

export type UserInputActions = {
    requestAnswerToFastAPI(
        context: ActionContext<UserInputState, any>,
        payload: { userInput: string }): Promise<string>
}

const actions: UserInputActions = {
    async requestAnswerToFastAPI(
        context: ActionContext<UserInputState, any>,
        payload: { userInput: string }): Promise<string> {

        try {
            console.log('requestAnswerToFastAPI()')
            const { userInput } = payload
            console.log("userInput:", userInput)

            const response = await axiosInst.fastapiAxiosInst.post(
                '/openai-api-test', { userInput })
            return response.data
        } catch (error) {
            console.log('requestAnswerToFastAPI() 중 문제 발생:', error)
            throw error
        }
    }
}

export default actions;