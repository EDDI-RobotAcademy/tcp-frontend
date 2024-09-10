<template>
  <v-container class="container">
    <div class="id-card-container">
    <div class="lanyard"></div>
      <v-card class="id-card mx-auto" min-width="500" style="background-color: rgba(0, 255, 55, 0.1);  
  color: white;
  border: 2px solid green;">
        <div class="company-logo" style="color: white;">Text Chat Programmers</div>
        <v-avatar size="120" class="mt-8 avatar-margin">
          <v-img :src="imageSrc"></v-img>
        </v-avatar>
        <v-card-text>
          <h2 class="text-h5 mb-2">{{ nickname }}</h2>
          <p class="subtitle-1">{{ email }}</p>
          <v-divider class="my-3"></v-divider>
          <v-row dense>
            <v-col cols="6">
              <v-icon>{{
                gender === "MALE" ? "mdi-gender-male" : "mdi-gender-female"
              }}</v-icon>
              <span class="ml-1">{{ gender === "MALE" ? "남성" : "여성" }}</span>
            </v-col>
            <v-col cols="6">
              <v-icon>mdi-calendar</v-icon>
              <span class="ml-1">{{ birthyear }}</span>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>
    <div class="floating-menu-container" @mouseover="showMenu" @mouseleave="hideMenu">
      <v-btn class="floating-button">
        <v-icon>{{ menuOpen ? "mdi-close" : "mdi-menu" }}</v-icon>
      </v-btn>
      <div v-if="menuOpen" class="floating-menu">
        <v-btn
          class="menu-item"
          @click="$router.push({ name: 'CommunityModifyPage', params: { communityId } })"
        >
          수정
        </v-btn>
        <v-btn class="menu-item" @click="$router.push({ name: 'AccountWithdrawPage' })">
          회원탈퇴
        </v-btn>
      </div>
    </div>
  </v-container>  
</template>

<script>
import { mapActions, mapState } from "vuex";

const accountModule = "accountModule";

export default {
  data() {
    return {
      imageSrc: require("@/assets/images/fixed/user-avatar.png"),
      email: "",
      nickname: "",
      gender: "",
      birthyear: "",
      menuOpen: false,
    };
  },
  computed: {
    ...mapState(accountModule, ["email"]),
    },
  async created() {
    try {
      const email = localStorage.getItem("email");
      console.log('email:', email)
      const nickname = await this.requestNicknameToDjango(email);      
      const gender = await this.requestGenderToDjango(email);
      const birthyear = await this.requestBirthyearToDjango(email);
      this.email = email;
      this.nickname = nickname;
      this.gender = gender;
      this.birthyear = birthyear;
    } catch (error) {
      console.log("사용자 정보를 가져오는 과정에서 에러 발생:", error);
    }
  },
  methods: {
    ...mapActions(accountModule, [
      "requestNicknameToDjango",
      "requestEmailToDjango",
      "requestGenderToDjango",
      "requestBirthyearToDjango",
    ]),
    onClickAccountWithdraw() {
      this.$router.push({ name: "AccountWithdrawPage" });
    },
    showMenu() {
      this.menuOpen = true;
    },
    hideMenu() {
      this.menuOpen = false;
    },
  },
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
/* 컨테이너 설정 */
.container {
  margin: 0;
  padding: 0;
  min-width: 100vw; /* 화면 전체 너비를 차지 */
  height: 100%; /* 화면 전체 높이를 차지 */
  display: flex;
  justify-content: center; /* 수평 가운데 정렬 */
  align-items: flex-end; /* 수직 가운데 정렬 */
  background: url("@/assets/images/fixed/mypage_bg.jpeg") no-repeat center center;
  background-size: 50%; /* 배경 이미지를 화면에 맞춤 */
  background-color: #000;
  padding-top: 25vh;
  padding-bottom: 40%;
}

/* id-card-container 설정 */
.id-card-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%; /* 컨테이너가 화면 너비를 꽉 채우도록 설정 */
}

/* id-card 스타일 */
.id-card {
  border-radius: 10px;
  overflow: hidden;
  text-align: center;
  width: 100%; /* id-card의 너비를 화면에 맞게 조정 */
  max-width: 500px; /* 최대 너비를 500px로 설정 */
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: rgba(0, 255, 55, 0.1); /* 배경색 */
  border: 2px solid green;
  color: white;
}

/* 기타 스타일 유지 */
.lanyard {
  position: absolute;
  top: -100px;
  width: 100%;
  height: 100px;
  background-color: rgba(0, 255, 55, 0.1);
  left: 50%;  
}

.lanyard::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;  
  width: 30px;
  height: 10px;
  background-color: darkgreen;
  border-radius: 5px 5px 0 0;
}

.company-logo {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 20px;
}

.v-avatar {
  margin: 0 auto;
  border: 3px solid #f0f0f0;
  margin-top: 20px;
}

.avatar-margin {
  margin-top: 20px;
}

.floating-menu-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column-reverse;
  align-items: flex-end;
}

.floating-button {
  background-color: #000;
  color: #fff;
  border-radius: 50%;
  width: 60px;
  height: 60px;
}

.floating-menu {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}

.menu-item {
  margin-bottom: 10px;
  background-color: #000;
  color: #fff;
}

@media (max-width: 600px) {
  .id-card {
    max-width: 90%; /* 작은 화면에서는 최대 너비를 줄임 */
  }

  .id-card-container {
    margin-top: 0; /* 작은 화면에서는 여백을 줄여서 중앙에 맞춤 */
  }
}
</style>
