import { ActionContext } from 'vuex'
import { Document, DocumentState } from './states'
import axios, { AxiosResponse } from 'axios'
import axiosInst from '@/utility/axiosInstance'

export type DocumentActions = {
    requestCreateDocumentToDjango(context: ActionContext<DocumentState, unknown>, payload: {
        title: string,
        writer: string,
        file: File,
    }): Promise<AxiosResponse>
    requestDocumentListToDjango(context: ActionContext<DocumentState, any>): Promise<void>
    requestDocumentToDjango(context: ActionContext<DocumentState, any>, documentId: number): Promise<void>
    requestModifyDocumentToDjango(context: ActionContext<DocumentState, any>, payload: {
        title: string, content: string, documentId: number
    }): Promise<void>
    requestDeleteDocumentToDjango(context: ActionContext<DocumentState, unknown>, documentId: number): Promise<void>
}

const actions: DocumentActions = {
    async requestCreateDocumentToDjango(context: ActionContext<DocumentState, unknown>, payload: {
        title: string,
        writer: string,
        file: File,
        content: string,
    }): Promise<AxiosResponse> {
        const { title, writer, file, content } = payload
        const formData = new FormData()
        formData.append('title', title)
        formData.append('writer', writer)
        formData.append('file', file)
        formData.append('content', content)
    
        try {
            const res: AxiosResponse = await axiosInst.djangoAxiosInst.post('/document/register', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            return res.data
        } catch (error) {
            console.log('requestCreateDocumentToDjango() error')
            throw error
        }
    },

    async requestDocumentListToDjango(context: ActionContext<DocumentState, any>): Promise<void> {
        try {
            const res: AxiosResponse<any, any> = await axiosInst.djangoAxiosInst.get('/document/list/');
            const data: Document[] = res.data;
            context.commit('REQUEST_DOCUMENT_LIST_TO_DJANGO', data);  // 네임스페이스 제거
        } catch (error) {
            console.log('requestDocumentListToDjango() error')
            throw error
        }
    },

    async requestDocumentToDjango(context: ActionContext<DocumentState, any>, documentId: number): Promise<void> {
        try {
            const res: AxiosResponse<Document> = await axiosInst.djangoAxiosInst.get(`/document/read/${documentId}`);
            context.commit('REQUEST_DOCUMENT_TO_DJANGO', res.data);  // 네임스페이스 제거
            // await context.dispatch('incrementDocumentViewCount', documentId);
        } catch (error) {
            console.log('requestDocumentToDjango() error')
            throw error
        }
    },

    async requestModifyDocumentToDjango(context: ActionContext<DocumentState, any>, payload: {
        title: string, documentId: number, content: string,
    }): Promise<void> {
        const { title, documentId, content } = payload
        const formData = new FormData()
        formData.append('title', title)        
        formData.append('content', content)

        try {
            await axiosInst.djangoAxiosInst.put(`/document/modify/${documentId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
        } catch (error) {
            console.log('requestModifyDocumentToDjango() error')
            throw error
        }
    },

    async requestDeleteDocumentToDjango(context: ActionContext<DocumentState, unknown>, documentId: number): Promise<void> {
        try {
            console.log('requestDeleteDocumentToDjango()')
            await axiosInst.djangoAxiosInst.delete(`/document/delete/${documentId}`)
        } catch (error) {
            console.log('requestDeleteDocumentToDjango() error')
            throw error
        }
    },
}

export default actions
