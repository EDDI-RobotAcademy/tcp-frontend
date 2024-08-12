<template>
    <div></div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

const googleAuthenticationModule = 'googleAuthenticationModule'
const accountModule = 'accountModule'

export default {
    computed: {
    ...mapState(accountModule, ["loginType"]),
    },
    methods: {
        ...mapActions(googleAuthenticationModule,
        ['requestAccessTokenToDjangoRedirection', 'requestUserInfoToDjango', 'requestAddRedisAccessTokenToDjango']),
        ...mapActions(accountModule, ['requestEmailDuplicationCheckToDjango']),

        async setRedirectData () {
            const code = this.$route.query.code
            await this.requestAccessTokenToDjangoRedirection({ code })
            const googleUserInfo = await this.requestUserInfoToDjango()
            if (!googleUserInfo) {
                console.error('userInfo is undefined.')
                return
            }
            console.log('googleUserInfo:', googleUserInfo)

            const email = googleUserInfo.email
            console.log('email: ', email)

            const isEmailDuplication = await this.requestEmailDuplicationCheckToDjango({ email })
            if (isEmailDuplication === true) {
                console.log('기존 가입 고객입니다.')
                const accessToken = localStorage.getItem("googleAccessToken");
                
                if (accessToken) {
                    await this.requestAddRedisAccessTokenToDjango({ email, accessToken });  // Fix: Pass as object directly
                } else {
                    console.error('AccessToken is missing');
                }
                this.$store.state.accountModule.email = email
                this.$store.state.accountModule.loginType = 'GOOGLE'
                console.log('loginType:', this.$store.state.accountModule.loginType)

                this.$router.push('/')
            } else {
                console.log('신규 가입 고객입니다.')
                this.$router.push('/account/google-register')
            }
        }
    },
    async created () {
        await this.setRedirectData()
    }
}
</script>