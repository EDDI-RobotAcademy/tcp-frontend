import { ActionContext } from "vuex"
import { GoogleAuthenticationState } from "./states"
import { AxiosResponse } from "axios"
import axiosInst from "@/utility/axiosInstance"

export type GoogleAuthenticationActions = {
    requestGoogleOauthRedirectionToDjango(): Promise<void>
    requestGoogleAccessTokenToDjangoRedirection(
        context: ActionContext<GoogleAuthenticationState, any>,
        payload: { code: string }): Promise<void>
    requestGoogleUserInfoToDjango(
        context: ActionContext<GoogleAuthenticationState, any>): Promise<any>
    requestAddGoogleRedisAccessTokenToDjango(
        { commit, state }: ActionContext<GoogleAuthenticationState, any>,
        { email, accessToken }: { email: string, accessToken: string }
    ): Promise<any>
    requestGoogleLogoutToDjango(
        context: ActionContext<GoogleAuthenticationState, any>,
        userToken: string
    ): Promise<void>
}

const actions: GoogleAuthenticationActions = {
    async requestGoogleOauthRedirectionToDjango(): Promise<void> {
        return axiosInst.djangoAxiosInst.get('google_oauth/google').then((res) =>{
            window.location.href = res.data.url
        })
    },
    async requestGoogleAccessTokenToDjangoRedirection(
        context: ActionContext<GoogleAuthenticationState, any>,
        payload: { code: string }): Promise<void> {
            try {
                console.log('requestGoogleAccessTokenToDjangoRedirection()')
                const { code } = payload
                
                const response = await axiosInst.djangoAxiosInst.post(
                    'google_oauth/google/access-token', { code })
                localStorage.setItem("googleAccessToken", response.data.accessToken.access_token)
            } catch (error) {
                console.log('Google Access Token 요청 중 문제 발생:', error)
                throw error
            }
    },
    async requestGoogleUserInfoToDjango(
        context: ActionContext<GoogleAuthenticationState, any>): Promise<any> {
            try {
                const accessToken = localStorage.getItem("googleAccessToken")
                const userInfoResponse: AxiosResponse<any> =
                    await axiosInst.djangoAxiosInst.post(
                        '/google_oauth/google/user-info',
                        { access_token: accessToken })
                
                const googleUserInfo = userInfoResponse.data.user_info
                return googleUserInfo
            } catch (error) {
                alert('구글 사용자 정보 가져오기 실패!')
                throw error
            }
    },
    async requestAddGoogleRedisAccessTokenToDjango(
        { commit, state }: ActionContext<GoogleAuthenticationState, any>,
        { email, accessToken }: { email: string, accessToken: string }
    ): Promise<any> {
        try {
            const response: AxiosResponse<any> = await axiosInst.djangoAxiosInst.post(
                '/google_oauth/redis-access-token', {
                email: email,
                accessToken: accessToken
            })

            console.log('userToken:', response.data.userToken)

            localStorage.removeItem("googleAccessToken")
            localStorage.setItem("googleUserToken", response.data.userToken)
            commit('REQUEST_IS_GOOGLE_AUTHENTICATED_TO_DJANGO', true)
            return response.data
            
        } catch (error) {
            console.error('Error adding google redis access token:', error)
        }
    },
    async requestGoogleLogoutToDjango(
        context: ActionContext<GoogleAuthenticationState, any>,
        userToken: string
    ): Promise<void> {
        try {
            const userToken = localStorage.getItem("googleUserToken")
            const res =
                await axiosInst.djangoAxiosInst.post('/google_oauth/logout', {
                    userToken: userToken
                })
            console.log('googleOauth logout res:', res.data.isSuccess)
            if (res.data.isSuccess === true) {
                context.commit('REQUEST_IS_GOOGLE_AUTHENTICATED_TO_DJANGO', false)
            }
        } catch (error) {
            console.error('requestGoogleLogoutToDjango() 중 에러 발생:', error)
            throw error
        }
        localStorage.removeItem("googleUserToken")
        localStorage.removeItem("email")
        localStorage.removeItem("loginType")
        if (localStorage.getItem("fileKey")) {
            localStorage.removeItem("fileKey")
        }
    }

    

    
}

export default actions


