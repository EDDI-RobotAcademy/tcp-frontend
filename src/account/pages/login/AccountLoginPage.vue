<template>
    <v-container class="container">
        <div class="login-wrapper">
            <div>                
                <span style="color: red;"> ● &nbsp;</span>
                <span style="color: yellow;"> ● &nbsp;</span>
                <span style="color: green;"> ● &nbsp;</span>

                <div :style="{ marginBottom: login_flag ? '20px' : '10px', textAlign: 'center', fontSize: '25px'}">
                        LOGIN
                </div>

                <div v-if="login_flag == false && this.isEmailCollect == false" class="login-error-box">
                    <!-- {{ email }}의 비밀번호가 올바르지 않습니다. -->
                    이메일이 올바르지 않습니다.
                    <br />
                    올바른 이메일을 입력하거나,
                    <br />
                    다른 간편로그인을  시도해 보세요.
                </div>
                <div v-if="login_flag == false && this.isEmailCollect == true && this.isPasswordCollect == false" class="login-error-box">
                    비밀번호가 올바르지 않습니다.
                    <br />
                    올바른 비밀번호를 입력하거나,
                    <br />
                    다른 간편로그인을  시도해 보세요.
                </div>

                <v-responsive class="mx-auto" min-width="300">
                    <v-form v-model="form" @submit.prevent="onSubmit">
                        <v-text-field
                            label="이메일 주소"
                            variant="solo"
                            v-model="email"
                            color="#fff"
                            bg-color="rgba(0, 0, 0, 0.5)"
                            clearable
                            :rules="[emailRequired]"
                        />

                        <v-text-field
                            label="비밀번호"
                            variant="solo"
                            v-model="password"
                            color="#fff"
                            bg-color="rgba(0, 0, 0, 0.5)"
                            :rules="[passwordRequired]"
                            :append-inner-icon="
                                visible ? 'mdi-eye' : 'mdi-eye-off'
                            "
                            :type="visible ? 'text' : 'password'"
                            @click:append-inner="visible = !visible"
                        />

                        <v-btn
                            width="100%"
                            color="white"
                            :loading="loading"
                            type="submit"
                            variant="elevated"
                            block
                            style="font-size: 13px; margin-top:20px;"
                        >
                            로그인
                        </v-btn>
                    </v-form>
                </v-responsive>
                <!-- 회원가입 버튼 -->
                <v-btn
                    width="100%"
                    color="purple darken-2"
                    class="black--text mt-2"
                    block
                    style="font-size: 13px;"
                    :to="{ name: 'NomalAccountRegisterPage' }"
                >
                    회원가입
                </v-btn>

                <v-divider :thickness="3" style="margin-top: 20px; margin-bottom: 20px;"></v-divider>
                

                <v-btn color="#FEE500" class="black--text mt-2 kakao-login-btn" block @click="goToKakaoLogin">
                </v-btn>
                <v-btn color="#ffffff" class="black--text mt-2 google-login-btn" block @click="goToGoogleLogin">
                </v-btn>
            </div>
        </div>
    </v-container>
</template>

<script>
import router from "@/router";
import { useStore, mapActions, mapState } from "vuex";

const accountModule = 'accountModule'
const authenticationModule = 'authenticationModule'
const googleAuthenticationModule = 'googleAuthenticationModule'

export default {
    data: () => ({
        form: false,
        email: null,
        password: null,
        visible: false,
        loading: false,
        login_flag: true,
        isEmailCollect: false,
        isPasswordCollect: false,
    }),

    setup() {
        const store = useStore();

        const goToKakaoLogin = async () => {
            localStorage.setItem("loginType", "KAKAO") 

            await store.dispatch(
                "authenticationModule/requestKakaoOauthRedirectionToDjango"
            );
            

        };
        const goToGoogleLogin = async () => {
            localStorage.setItem("loginType", "GOOGLE") 
            await store.dispatch(
                "googleAuthenticationModule/requestGoogleOauthRedirectionToDjango"
            )
            
        }

        return {
            goToKakaoLogin,
            goToGoogleLogin,
        };
    },
    computed: {
    ...mapState(authenticationModule, ["isAuthenticatedKakao"]),
    ...mapState(accountModule, ["isAuthenticatedNormal", "loginType"]),
    ...mapState(googleAuthenticationModule, ["isAuthenticatedGoogle"]),
    },
    methods: {
        ...mapActions(accountModule, ['requestCheckNormalLoginToDjango']),
        goToHome() {
            router.push("/");
        },

        goToSignUp() {
            router.push("/account/register"); 
        },

        async onSubmit() {
            if (!this.form) return;

            this.loading = true;

            try {
                const response = await this.checkPassword();
                // console.log('response', response)
                this.isEmailCollect = response.isEmailCollect
                this.isPasswordCollect = response.isPasswordCollect

                if (this.isEmailCollect && this.isPasswordCollect) {
                // 이메일과 비밀번호가 모두 일치하면 로그인 성공
                    this.login_flag = true;
                    localStorage.setItem('normalToken', true)
                    localStorage.setItem('email', this.email)
                    localStorage.setItem('loginType', 'NORMAL')
                    this.$store.state.accountModule.isAuthenticatedNormal = true
                    this.goToHome();

                } else {
                // 이메일 또는 비밀번호가 일치하지 않으면 로그인 실패
                    this.login_flag = false;
                }
            } catch (error) {
                console.error("로그인 중 에러 발생: ", error);
                this.login_flag = false;
            } finally {
                this.loading = false;
            }

            // setTimeout(
            //     () => ((this.loading = false), (this.login_flag = true)),
            //     2000
            // );

            // setTimeout(
            //     () => ((this.loading = false), (this.login_flag = false)),
            //     2000
            // );
        },

        emailRequired(v) {
            return !!v || "정확한 이메일 주소를 입력하세요.";
        },

        passwordRequired(v) {
            return !!v || "비밀번호는 8~20자 사이여야 합니다.";
        },
        async checkPassword() {
            try {
                console.log("이메일, 비밀번호 확인")
                const payload = {
                    email: this.email,
                    password: this.password
                }
                const response = await this.requestCheckNormalLoginToDjango(payload)
                return response
            } catch (error) {
                console.error("비밀번호 확인 중 에러 발생: ", error)
            }
        },
    },
};
</script>



<style scoped>
.container {
    margin: 0;
    width: 100%;
    max-width: 100vw;
    height: 100%;
    display: flex;                  /* Flexbox 사용하여 가운데 정렬 */
    justify-content: center;        /* 수평 가운데 정렬 */
    align-items: center;            /* 수직 가운데 정렬 */
    padding: 0;
    background: url("@/assets/images/fixed/login_bg.png") no-repeat center center; /* 배경 이미지 설정 */
    background-size: cover;                                                     /* 배경 이미지 크기 조정 */
}

/* 로그인 박스 설정 */
.login-wrapper {
    position: relative;
    z-index: 1;    
    color: white;
    width: 400px;
    padding: 20px;
    background-color: rgba(0, 0, 0, 0.75); /* 반투명 배경 */
    border-radius: 20px; /* 모서리 둥글게 */
}

/* 에러 메시지 박스 설정 */
.login-error-box {
    background-color: rgba(255, 0, 0, 0.85);
    padding: 16px;
    margin-bottom: 16px;
    border-radius: 10px;
    color: #fff;
}

/* Kakao 로그인 버튼 설정 */
.kakao-login-btn {
    background-image: url("@/assets/images/fixed/kakao_login.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Google 로그인 버튼 설정 */
.google-login-btn {
    background-image: url("@/assets/images/fixed/google_login.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* 로그인 폼의 텍스트 필드 라벨 색상 설정 */
:deep(.v-label.v-field-label) {
    color: rgba(255, 255, 255, 0.8) !important;
}

/* 로그인 폼의 텍스트 필드 입력값 색상 설정 */
:deep(.v-text-field input) {
    color: #fff;
}

/* 눈 아이콘 색상 설정 */
:deep(.mdi-eye::before), :deep(.mdi-eye-off::before) {
    color: rgba(255, 255, 255, 0.8) !important;
}

/* 오류 메시지 스타일링 */
:deep(.v-messages__message) {
    color: rgba(0, 255, 55, 0.75)!important; /* 메시지 색상 */
    font-size: 15px; /* 메시지 폰트 크기 */
}

/* 텍스트 필드 에러 상태의 레이블 색상을 초록색으로 변경 */
:deep(.v-field--error:not(.v-field--disabled) .v-label.v-field-label) {
    color: rgba(0, 255, 55, 0.75) !important; /* 에러 상태의 레이블 색상을 초록색으로 변경 */
}

</style>