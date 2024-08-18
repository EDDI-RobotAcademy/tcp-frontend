import { ActionContext } from "vuex"
import { AxiosResponse } from "axios"
import axiosInst from "@/utility/axiosInstance"
import { UserInputState } from "./states"

export type UserInputActions = {
    requestAnswerToFastAPI(
        context: ActionContext<UserInputState, any>,
        payload: { data: string }): Promise<string>
}

const actions: UserInputActions = {
    async requestAnswerToFastAPI(
        context: ActionContext<UserInputState, any>,
        payload: { data: string }): Promise<string> {

        try {
            console.log('requestAnswerToFastAPI()')
            const { data } = payload
            console.log("userInput:", data)
            const command = 6

            const response = await axiosInst.fastapiAxiosInst.post(
                '/request-ai-command', { command, "data":[data] })
            return response.data
        } catch (error) {
            console.log('requestAnswerToFastAPI() 중 문제 발생:', error)
            throw error
        }
    }
}

export default actions;