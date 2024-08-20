<template>
  <v-container class="register-container" fill-height>
    <v-row align="center" justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card>
          <v-card-title>
            <span class="headline">일반 회원가입</span>
          </v-card-title>
          <v-responsive class="mx-auto" min-width="400">
            <v-form ref="form" v-model="formValid" lazy-validation>
              <v-row align="center">
                <v-col cols="10">
                  <v-text-field
                    v-model="email"
                    label="example@gmail.com"
                    required
                    :rules="emailRules"
                    :error-messages="emailErrorMessages"
                  />
                </v-col>
                <v-col cols="2">
                  <v-btn
                    color="rgba(0, 255, 55, 0.75)"
                    style="color: black; width: 90px"
                    small
                    :disabled="!isEmailFormatted || isEmailValid"
                    type="button"
                    @click="checkEmailDuplication"
                  >
                    중복 검사
                  </v-btn>
                </v-col>
              </v-row>

              <v-row align="center">
                <v-col cols="10">
                  <v-text-field
                    v-model="password"
                    label="password"
                    required
                    :rules="passwordRules"
                    :append-inner-icon="visible ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="visible ? 'text' : 'password'"
                    @click:append-inner="visible = !visible"
                  />
                </v-col>
              </v-row>

              <v-row align="center">
                <v-col cols="10">
                  <v-text-field
                    v-model="nickname"
                    label="Nickname"
                    required
                    :rules="nicknameRules"
                    :error-messages="nicknameErrorMessages"
                  />
                </v-col>
                <v-col cols="2">
                  <v-btn
                    color="rgba(0, 255, 55, 0.75)"
                    style="color: black; width: 90px"
                    small
                    :disabled="nickname === '' || isNicknameValid"
                    type="button"
                    @click="checkNicknameDuplication"
                  >
                    중복 검사
                  </v-btn>
                </v-col>
              </v-row>

              <div
                v-if="isNicknameValid"
                class="valid-nickname-box"
                style="color: chartreuse"
              >
                사용 가능한 닉네임입니다.
              </div>

              <div style="margin-top: 32px">
                <v-radio-group v-model="gender" inline label="성별" color="black">
                  <v-radio
                    label="남성"
                    value="MALE"
                    color="cyan"
                    base-color="white"
                  ></v-radio>
                  <v-radio
                    label="여성"
                    value="FEMALE"
                    color="pink"
                    base-color="white"
                  ></v-radio>
                </v-radio-group>
              </div>

              <v-text-field
                v-model="birthyear"
                label="출생년도"
                :rules="birthyearRules"
                required
              />
            </v-form>
          </v-responsive>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="black" @click="submitForm" :disabled="!isValidForSubmission">
              회원가입 하기
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapState } from "vuex";

const authenticationModule = "authenticationModule";
const accountModule = "accountModule";

export default {
  data() {
    return {
      formValid: false,
      email: "",
      password: "",
      nickname: "",
      emailRules: [
        (v) => !!v || "Email 은 필수입니다!",
        (v) => /.+@.+\..+/.test(v) || "영문자로 시작하는 유효한 Email 주소를 입력하세요!",
      ],
      passwordRules: [
        (v) => !!v || "Password는 필수입니다!",
        (v) => v.length >= 8 || "Password는 8자리 이상이어야 합니다!",
        (v) => v.length <= 20 || "Password는 20자리 이하여야 합니다!",
        (v) => /[a-zA-Z]/.test(v) || "Password에는 적어도 하나의 영문자가 포함되어야 합니다!",
        (v) => /\d/.test(v) || "Password에는 적어도 하나의 숫자가 포함되어야 합니다!",
      ],
      nicknameRules: [(v) => !!v || "Nickname은 필수입니다!"],
      gender: "man",
      birthyear: "",
      emailErrorMessages: [],
      isEmailValid: false,
      nicknameErrorMessages: [],
      isNicknameValid: false,
      birthyearRules: [
        (v) => !!v || "출생년도는 필수입니다!",
        (v) => /^\d+$/.test(v) || "출생년도는 숫자여야 합니다!",
        (v) => v.length === 4 || "출생년도는 4자리여야 합니다!",
      ],
      loginType: "NORMAL",
      visible: false,
    };
  },
  watch: {
    email(email) {
      // 이메일이 변경될 때마다 중복 검사 상태 초기화
      this.isEmailValid = false;
      this.emailErrorMessages = [];
    },
    nickname(newNickname) {
      // 닉네임이 변경될 때마다 중복 검사 상태 초기화
      this.isNicknameValid = false;
      this.nicknameErrorMessages = [];
    },
  },
  computed: {
    isValidForSubmission() {
      return this.formValid && this.isNicknameValid && this.age !== 0;
    },
    isEmailFormatted() {
      // 이메일이 유효한 형식인지 확인
      return this.emailRules.every((rule) => rule(this.email) === true);
    },
  },
  methods: {
    ...mapActions(authenticationModule, [
      "requestUserInfoToDjango",
      "requestAddRedisAccessTokenToDjango",
    ]),
    ...mapActions(accountModule, [
      "requestEmailDuplicationCheckToDjango",
      "requestNicknameDuplicationCheckToDjango",
      "requestCreateNewAccountToDjango",
    ]),

    async requestUserInfo() {
      try {
        const userInfo = await this.requestUserInfoToDjango();
        if (userInfo && userInfo.kakao_account && userInfo.kakao_account.email) {
          this.email = userInfo.kakao_account.email;
        } else {
          this.email = ""; // 기본 이메일 설정
        }
      } catch (error) {
        console.error("에러:", error);
        alert("사용자 정보를 가져오는데 실패하였습니다!");
        this.email = ""; // 에러 발생 시 기본 이메일 설정
      }
    },
    async checkEmailDuplication() {
      this.isEmailValid = false;
      console.log("이메일 중복 검사 누름");
      try {
        const isDuplicatedEmail = await this.requestEmailDuplicationCheckToDjango({
          email: this.email.trim(),
        });
        if (isDuplicatedEmail) {
          this.emailErrorMessages = ["이 email은 이미 사용중입니다!"];
          this.isEmailValid = false;
        } else {
          this.emailErrorMessages = [];
          this.isEmailValid = true;
        }
      } catch (error) {
        alert("이메일 중복 확인에 실패했습니다!");
        this.isEmailValid = false;
      }
    },
    async checkNicknameDuplication() {
      this.isNicknameValid = false;
      console.log("닉네임 중복 검사 누름");
      try {
        const isDuplicatedNickname = await this.requestNicknameDuplicationCheckToDjango({
          newNickname: this.nickname.trim(),
        });
        if (isDuplicatedNickname) {
          this.nicknameErrorMessages = ["이 nickname은 이미 사용중입니다!"];
          this.isNicknameValid = false;
        } else {
          this.nicknameErrorMessages = [];
          this.isNicknameValid = true;
        }
      } catch (error) {
        alert("닉네임 중복 확인에 실패했습니다!");
        this.isNicknameValid = false;
      }
    },
    async submitForm() {
      console.log("회원가입 하기 누름");
      if (this.$refs.form.validate()) {
        const accountInfo = {
          email: this.email,
          nickname: this.nickname,
          password: this.password,
          gender: this.gender, // 성별 추가
          birthyear: this.birthyear, // 생년월일 추가
          loginType: this.loginType
        };
        await this.requestCreateNewAccountToDjango(accountInfo);
        console.log("전송한 데이터:", accountInfo);
        this.$store.state.accountModule.loginType = 'NORMAL';
        this.$router.push("/account/login");
      }
    },
  },
};
</script>


<style scoped>
/* 전체 화면을 가득 채우는 컨테이너 */
.register-container {
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

/* 카드 스타일링 */
.v-card {
    position: relative;
    z-index: 1;
    background-color: rgba(0, 0, 0, 0.9); /* 반투명한 검은색 배경 */
    color: white; /* 텍스트 색상: 흰색 */
    min-width: 400px; /* 카드의 최소 너비 */
    min-height: 500px; /* 카드의 최소 높이 */
    padding: 20px; /* 카드 내부의 패딩 */
    border-radius: 20px; /* 카드의 모서리 둥글게 */
}

/* 버튼 스타일링 */
.v-btn {
    position: relative;
    padding: 8px 16px; /* 버튼 내부 패딩 */
    margin-right: 10px; /* 오른쪽 여백 */
    background-color: rgba(0, 255, 55, 0.75); /* 버튼 배경색 */
}

/* 성별 라디오 그룹의 레이블 스타일링 */
:deep(.v-radio-group > .v-input__control > .v-label) {
    color: #fff !important; /* 레이블 색상: 흰색 */
    margin-inline-start: 0px !important; /* 레이블 시작 마진 제거 */
    margin-bottom: 12px !important; /* 레이블 하단 여백 */
    opacity: 1 !important; /* 투명도: 100% */
}

/* 성별 라디오 그룹의 선택 컨트롤 스타일링 */
:deep(
        .v-radio-group
            > .v-input__control
            > .v-label
            + .v-selection-control-group
    ) {
    padding-inline-start: 0px !important; /* 패딩 시작 부분 제거 */
    margin-top: 0px !important; /* 상단 여백 제거 */
}

/* 오류 메시지 스타일링 */
:deep(.v-messages__message) {
    color: rgba(0, 255, 55, 0.75)!important; /* 메시지 색상 */
    font-size: 18px; /* 메시지 폰트 크기 */
}

/* 텍스트 필드 에러 상태의 레이블 색상을 초록색으로 변경 */
:deep(.v-field--error:not(.v-field--disabled) .v-label.v-field-label) {
    color: rgba(0, 255, 55, 0.75) !important; /* 에러 상태의 레이블 색상을 초록색으로 변경 */
}
</style>
