import { ActionContext } from "vuex";
import { Board, BoardState } from './states'
import { AxiosResponse } from 'axios'
import axiosInst from '@/utility/axiosInstance'
import { REQUEST_BOARD_LIST_TO_DJANGO } from "./mutation-types";

export type BoardActions = {
    requestBoardListToDjango(context: ActionContext<BoardState, any>): Promise<void>
    requestCreateBoardToDjango(context: ActionContext<BoardState, unknown>, payload: {
        title: string, writer: string, content: string
    }): Promise<AxiosResponse>
}

const actions: BoardActions = {
    async requestBoardListToDjango(context: ActionContext<BoardState, any>): Promise<void> {
        try {
            const res: AxiosResponse<any, any> = await axiosInst.djangoAxiosInst.get('/board/list/')
            const data: Board[] = res.data
            context.commit('REQUEST_BOARD_LIST_TO_DJANGO', data)
        } catch (error) {
            console.error('Error fetching board list:', error)
            throw error
        }
    },
    async requestCreateBoardToDjango(context: ActionContext<BoardState, unknown>, payload: {
        title: string, writer: string, content: string
    }): Promise<AxiosResponse> {
        const { title, writer, content } = payload
        
        try {
            const res: AxiosResponse = await axiosInst.djangoAxiosInst.post(
                '/board/register', { title, writer, content }
            )
            return res.data
        } catch (error) {
            alert('requestCreateBoardToDjango() 문제 발생!')
            throw error
        }
    }
}

export default actions