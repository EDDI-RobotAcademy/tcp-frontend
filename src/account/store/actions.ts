import { ActionContext, Commit } from "vuex"
import { Account, AccountState } from "./states"
import { AxiosResponse } from "axios"
import axiosInst from "@/utility/axiosInstance"

export type AccountActions = {
    requestEmailDuplicationCheckToDjango(context: ActionContext<AccountState, any>, payload: any): Promise<boolean>
    requestNicknameDuplicationCheckToDjango(context: ActionContext<AccountState, any>, payload: any): Promise<boolean>
    requestCreateNewAccountToDjango(context: ActionContext<AccountState, any>, accountInfo: { email: string, nickname: string }): Promise<void>
    requestNicknameToDjango(context: ActionContext<AccountState, any>, email: string): Promise<Account>
    // requestEmailToDjango(context: ActionContext<AccountState, any>, email: string): Promise<Account>
    requestWithdrawalToDjango(context: ActionContext<AccountState, unknown>, payload: { reason: string }): Promise<AxiosResponse>
    requestGenderToDjango(context: ActionContext<AccountState, any>, email: string): Promise<Account>
    requestBirthyearToDjango(context: ActionContext<AccountState, any>, email: string): Promise<Account>
    requestCheckPasswordToDjango(context: ActionContext<AccountState, any>,
        payload: { email: string, password: string }): Promise<boolean>
}

const actions: AccountActions = {
    async requestEmailDuplicationCheckToDjango(context: ActionContext<AccountState, any>, payload: any): Promise<boolean> {
        const { email } = payload
        
        return axiosInst.djangoAxiosInst.post(
            '/account/email-duplication-check',
            { email: email }
        )
            .then((res) => {
                if (res.data.isDuplicate) {
                    alert('중복된 이메일입니다.')
                    return true
                } else {
                    alert('사용 가능한 이메일입니다.')
                    return false
                }
            })
    },
    async requestNicknameDuplicationCheckToDjango(context: ActionContext<AccountState, any>, payload: any): Promise<boolean> {
        const { newNickname } = payload

        return axiosInst.djangoAxiosInst.post(
            '/account/nickname-duplication-check',
            { newNickname: newNickname }
        )
            .then((res) => {
                if (res.data.isDuplicate) {
                    alert('중복된 닉네임입니다.')
                    return true
                } else {
                    alert('사용 가능한 닉네임입니다.')
                    return false
                }
            })
    },
    async requestCreateNewAccountToDjango(context: ActionContext<AccountState, any>,
        accountInfo: { email: string, nickname: string }): Promise<void> {
        try {
            alert('신규 계정이 생성되었습니다!')
            await axiosInst.djangoAxiosInst.post('/account/register', accountInfo)
        } catch (error) {
            console.error('신규 계정 생성 실패:', error)
            throw error
        }
    },
    async requestNicknameToDjango(context: ActionContext<AccountState, any>, email: string): Promise<Account> {
        try {
            // const userToken = localStorage.getItem("userToken");
            const res: AxiosResponse<Account> =
                await axiosInst.djangoAxiosInst.post('/account/nickname', { email });
            console.log('data:', res.data)
            context.commit('REQUEST_NICKNAME_TO_DJANGO', res.data);
            return res.data
        } catch (error) {
            console.error('requestNicknameToDjango() 문제 발생:', error);
            throw error
        }
    },
    // async requestEmailToDjango(context: ActionContext<AccountState, any>, email: string): Promise<Account> {
    //     try {
    //         const userToken = localStorage.getItem("userToken");
    //         const res: AxiosResponse<Account> =
    //             await axiosInst.djangoAxiosInst.post('/account/email', { userToken: userToken });
    //         console.log('data:', res.data)
    //         context.commit('REQUEST_EMAIL_TO_DJANGO', res.data);
    //         return res.data
    //     } catch (error) {
    //         console.error('requestEmailToDjango() 문제 발생:', error);
    //         throw error
    //     }
    // },
    async requestWithdrawalToDjango(context: ActionContext<AccountState, unknown>, payload: { reason: string }): Promise<AxiosResponse> {
        console.log('requestWithdrawalToDjango()')
        const userToken = localStorage.getItem("userToken");
        const { reason } = payload
        console.log('전송할 데이터:', { reason })
        try {
            const res: AxiosResponse = await axiosInst.djangoAxiosInst.post('/account/withdraw', { reason: reason, userToken: userToken })
            console.log('res:', res.data)
            return res.data
        } catch (error) {
            alert('requestWithdrawalToDjango() 문제 발생!')
            throw error
        }
    },
    async requestGenderToDjango(context: ActionContext<AccountState, any>, email: string): Promise<Account> {
        try {
            // const userToken = localStorage.getItem("userToken");
            const res: AxiosResponse<Account> =
                await axiosInst.djangoAxiosInst.post('/account/gender', { email });
            console.log('data:', res.data)
            context.commit('REQUEST_GENDER_TO_DJANGO', res.data);
            return res.data
        } catch (error) {
            console.error('requestGenderToDjango() 문제 발생:', error);
            throw error
        }
    },
    async requestBirthyearToDjango(context: ActionContext<AccountState, any>, email: string): Promise<Account> {
        try {
            // const userToken = localStorage.getItem("userToken");
            const res: AxiosResponse<Account> =
                await axiosInst.djangoAxiosInst.post('/account/birthyear', { email });
            console.log('data:', res.data)
            context.commit('REQUEST_BIRTHYEAR_TO_DJANGO', res.data);
            return res.data
        } catch (error) {
            console.error('requestBirthyearToDjango() 문제 발생:', error);
            throw error
        }
    },
    async requestCheckPasswordToDjango(context: ActionContext<AccountState, any>, 
        payload: { email: string, password: string }): Promise<boolean> {
            try {
                const res = await axiosInst.djangoAxiosInst.post('/account/password-check', payload)
                console.log('isCollect', res.data.isCollect)
                return res.data.isCollect
            } catch (error) {
                console.error('requestCheckPasswordToDjango() 문제 발생:', error)
                throw error
            }
    },
};

export default actions;