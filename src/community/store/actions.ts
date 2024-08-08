import { ActionContext } from 'vuex'
import { Community, CommunityState } from './states'
import axios, { AxiosResponse } from 'axios'
import axiosInst from '@/utility/axiosInstance'

export type CommunityActions = {
    requestCreateCommunityToDjango(context: ActionContext<CommunityState, unknown>, payload: {
        title: string,
        writer: string,
        content: string,
    }): Promise<AxiosResponse>
    requestCommunityListToDjango(context: ActionContext<CommunityState, any>): Promise<void>
    requestCommunityToDjango(context: ActionContext<CommunityState, any>, communityId: number): Promise<void>
    requestModifyCommunityToDjango(context: ActionContext<CommunityState, any>, payload: {
        title: string, content: string, communityId: number
    }): Promise<void>
    requestDeleteCommunityToDjango(context: ActionContext<CommunityState, unknown>, communityId: number): Promise<void>
}

const actions: CommunityActions = {
    async requestCreateCommunityToDjango(context: ActionContext<CommunityState, unknown>, payload: {
        title: string,
        writer: string,
        content: string
    }): Promise<AxiosResponse> {
        const { title, writer, content } = payload
        try {
            const res: AxiosResponse = await axiosInst.djangoAxiosInst.post('/community/register', { title, writer, content })
            return res.data
        } catch (error) {
            console.log('requestCreateCommunityToDjango() error')
            throw error
        }
    },

    async requestCommunityListToDjango(context: ActionContext<CommunityState, any>): Promise<void> {
        try {
            const res: AxiosResponse<any, any> = await axiosInst.djangoAxiosInst.get('/community/list/');
            const data: Community[] = res.data;
            context.commit('REQUEST_COMMUNITY_LIST_TO_DJANGO', data);
        } catch (error) {
            console.log('requestCommunityListToDjango() error')
            throw error
        }
    },

    async requestCommunityToDjango(context: ActionContext<CommunityState, any>, communityId: number): Promise<void> {
        try {
            const res: AxiosResponse<Community> = await axiosInst.djangoAxiosInst.get(`/community/read/${communityId}`);
            context.commit('REQUEST_COMMUNITY_TO_DJANGO', res.data);
            await context.dispatch('incrementCommunityViewCount', communityId);
        } catch (error) {
            console.log('requestCommunityToDjango() error')
            throw error
        }
    },

    async requestModifyCommunityToDjango(context: ActionContext<CommunityState, any>, payload: {
        title: string, content: string, communityId: number
    }): Promise<void> {
        const { title, content, communityId } = payload
        try {
            await axiosInst.djangoAxiosInst.put(`/community/modify/${communityId}`, { title, content })
        } catch (error) {
            console.log('requestModifyCommunityToDjango() error')
            throw error
        }
    },

    async requestDeleteCommunityToDjango(context: ActionContext<CommunityState, unknown>, communityId: number): Promise<void> {
        try {
            console.log('requestDeleteCommunityToDjango()')
            await axiosInst.djangoAxiosInst.delete(`/community/delete/${communityId}`)
        } catch (error) {
            console.log('requestDeleteCommunityToDjango() error')
            throw error
        }
    },
}

export default actions