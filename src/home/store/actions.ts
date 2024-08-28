import { ActionContext } from "vuex"
import { AxiosResponse } from "axios"
import axiosInst from "@/utility/axiosInstance"
import { UserInputState } from "./states"

export type UserInputActions = {
    requestInferToFastAPI(
        context: ActionContext<UserInputState, any>,
        payload: { data: string }): Promise<string>
        requestInferedAnswerToFastAPI(context: ActionContext<UserInputState, any>): Promise<string>
}

const actions: UserInputActions = {
    async requestInferToFastAPI(
        context: ActionContext<UserInputState, any>,
        payload: { data: string }): Promise<string> {

        try {
            console.log('requestInferToFastAPI()')
            const { data } = payload
            console.log("userInput:", data)
            const command = 6

            const response = await axiosInst.fastapiAxiosInst.post(
                '/request-ai-command', { command, "data":[data] })
            return response.data
        } catch (error) {
            console.log('requestInferToFastAPI() 중 문제 발생:', error)
            throw error
        }
    },
    // async requestInferedAnswerToFastAPI(context: ActionContext<UserInputState, any>): Promise<string> {
    //     try {
    //         console.log('requestInferedAnswerToFastAPI()')
    //         const response = await axiosInst.fastapiAxiosInst.get(
    //             '/llama-three-test-result')
    //         console.log('response.data', response.data)
    //         return response.data
    //     } catch (error) {
    //         console.log('requestInferedAnswerToFastAPI() 중 문제 발생:', error)
    //         throw error
    //     }
    // },

    async requestInferedAnswerToFastAPI(context: ActionContext<UserInputState, any>): Promise<string> {
        try {
            console.log('requestInferedAnswerToFastAPI()')

            let response: AxiosResponse<any>;
            const maxAttempts = 30; // 최대 시도 횟수
            const delay = 2000; // 각 시도 사이의 지연시간 (ms)
            
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                response = await axiosInst.fastapiAxiosInst.get('/llama-three-test-result');

                if (response.data && response.data.generatedText) {
                    console.log('response.data', response.data);
                    return response.data;
                }

                console.log(`Attempt ${attempt} failed. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }

            throw new Error('결과를 가져오는 데 실패했습니다.');
        } catch (error) {
            console.log('requestInferedAnswerToFastAPI() 중 문제 발생:', error)
            throw error
        }
    },
}

export default actions;