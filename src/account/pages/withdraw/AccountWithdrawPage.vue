<template>
    <v-container>
        <v-form class="reason-section">
            <h3>서비스 품질 향상을 위해 탈퇴 사유를 선택해주세요.</h3>
            <v-radio-group class="radio-group-section" v-model="selectedReason">
                <v-radio
                    v-for="(reason, index) in reasons"
                    :key="index"
                    :label="reason.label"
                    :value="reason.value"
                ></v-radio>
            </v-radio-group>
            <v-btn
                :disabled="!isButtonEnabled"
                @click="submitWithdrawal"
            >
                탈퇴 신청
            </v-btn>
        </v-form>
        <v-dialog v-model="dialog" max-width="500">
            <v-card>
                <v-card-title class="headline">알림</v-card-title>
                <v-card-text>회원 탈퇴가 완료되었습니다.</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" text @click="closeDialog">확인</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
import { mapActions } from 'vuex'

const accountModule = 'accountModule'
const authenticationModule = 'authenticationModule'

export default {
    data () {
        return {
            reasons: [
                { label: '서비스 품질 불만족', value: 'SERVICE_DISSATISFACTION' },
                { label: '사용 빈도 낮음', value: 'LOW_USAGE' },
                { label: '다른 서비스 사용', value: 'OTHER_SERVICE' },
                { label: '개인정보 보호 우려', value: 'PRIVACY_CONCERN' },
                { label: '기타', value: 'OTHER' },
            ],
            selectedReason: null,
            dialog: false,
        }
    },
    computed: {
        isButtonEnabled() {
            return this.selectedReason != null
        }
    },
    methods: {
        ...mapActions(accountModule, ['requestWithdrawalToDjango']),
        ...mapActions(authenticationModule, ["requestLogoutToDjango"]),
        submitWithdrawal() {
            const reasonString = this.selectedReason ? String(this.selectedReason) : '';
            console.log('탈퇴 신청 사유:', reasonString);
            this.requestWithdrawalToDjango({ reason: reasonString })
                .then(() => {
                    this.dialog = true;
                })
                .catch(err => {
                    console.error('탈퇴 신청 실패:', err);
                });
        },
        closeDialog() {
            this.dialog = false;
            // 로그아웃 처리
            this.requestLogoutToDjango();
            this.$router.push('/');
        }
    }
}
</script>

<style scoped>

.reason-section {
    margin-top: 30px;
}

.radio-group-section {
    margin-top: 30px;
    margin-bottom: 10px;
}

</style>
