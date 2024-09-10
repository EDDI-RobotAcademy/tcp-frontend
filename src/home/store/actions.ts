import { ActionContext } from "vuex"
import { AxiosResponse } from "axios"
import axiosInst from "@/utility/axiosInstance"
import { UserInputState } from "./states"
import { s3Client, env } from "@/utility/awsFileS3Config"
import { PutObjectCommand } from "@aws-sdk/client-s3"

export type UserInputActions = {
    requestInferToFastAPI(
        context: ActionContext<UserInputState, any>,
        payload: { text: string, fileKey: string | null, file: any | null }): Promise<string>
    requestInferedAnswerToFastAPI(context: ActionContext<UserInputState, any>): Promise<string>
    requestAnalyzePaperFileToFastAPI(
        context: ActionContext<UserInputState, any>,
        payload: { data: string }): Promise<string>
}

const actions: UserInputActions = {
    async requestInferToFastAPI(
        context: ActionContext<UserInputState, any>,
        payload: { text: string, fileKey: string | null, file: any | null }): Promise<string> {
        console.log("payload:", payload)
        const { text, fileKey, file } = payload
        try {
            console.log('requestInferToFastAPI()')
            console.log("userInput:", text)
            const command = 6

            if (fileKey) {
                const BUCKET_NAME = process.env.VUE_APP_AWS_S3_BUCKET_NAME
                const params = {
                    Bucket: BUCKET_NAME,
                    Key: fileKey,
                    Body: file,
                    // ACL: 'private'
                };
        
                try {
                    console.log('Uploading file with params:', params); // Debug information
                    await s3Client.send(new PutObjectCommand(params));
                    console.log(`upload ${fileKey} to S3 successfully.`)
                } catch (err) {
                    console.error('Error uploading file:', err);
                }
                console.log('selectedFileName: ', fileKey)
              }

            const response = await axiosInst.fastapiAxiosInst.post(
                '/request-ai-command', { command, "data":[text, fileKey] })
            return response.data
        } catch (error) {
            console.log('requestInferToFastAPI() 중 문제 발생:', error)
            throw error
        }
    },

    async requestInferedAnswerToFastAPI(context: ActionContext<UserInputState, any>): Promise<string> {
        try {
            console.log('requestInferedAnswerToFastAPI()')

            let response: AxiosResponse<any>;
            const maxAttempts = 50; // 최대 시도 횟수
            const delay = 2000; // 각 시도 사이의 지연시간 (ms)
            
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                response = await axiosInst.fastapiAxiosInst.get('/openai-api-result');

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

    async requestAnalyzePaperFileToFastAPI(
        context: ActionContext<UserInputState, any>,
        payload: { data: string }): Promise<string> {

        try {
            console.log('requestAnalyzePaperFileToFastAPI()')
            const { data } = payload
            console.log("userInput:", data)
            const command = 8

            const response = await axiosInst.fastapiAxiosInst.post(
                '/request-ai-command', { command, "data":[data] })
            return response.data
        } catch (error) {
            console.log('requestAnalyzePaperFileToFastAPI() 중 문제 발생:', error)
            throw error
        }
    },
}

export default actions;