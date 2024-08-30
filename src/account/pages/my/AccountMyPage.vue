<template>
  <v-container class="container">
    <div class="id-card-container">
    <div class="lanyard"></div>
      <v-card class="id-card mx-auto" min-width="500" style="background-color: rgba(0, 255, 55, 0.1);  
  color: white;
  border: 2px solid green;">
        <div class="company-logo" style="color: white;">Text Chat Programmers</div>
        <v-avatar size="120" class="mt-8 avatar-margin" style="margin-top: 20px;">
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
.container {
    margin: 0;
    width: 100%;
    max-width: 100vw;
    height: 100%;
    display: flex;                  /* Flexbox 사용하여 가운데 정렬 */
    justify-content: center;        /* 수평 가운데 정렬 */    
    padding: 0;
    background: url("@/assets/images/fixed/mypage_bg.jpeg") no-repeat center center; /* 배경 이미지 설정 */
    background-size: 50%;
    background-color: #000;                                                     /* 배경 이미지 크기 조정 */
    background-position: center 400px; /* 수직으로 20px 아래로 이동 */
}

.id-card-container {
  position: relative;
  padding-top: 50px;
  display: flex;
  justify-content: center;
  margin-top: 200px;
  max-height: 37%;  
}

.id-card:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s, box-shadow 0.3s;
}

.lanyard {
  position: absolute;
  top: -120px;
  left: 50%;
  transform: translateX(-50%);
  width: 15px;
  height: 170px;
  background-color: rgba(0, 255, 55, 0.1);
  border-radius: 5px 5px 0 0;
}

.lanyard::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 10px;
  background-color: darkgreen;
  border-radius: 5px 5px 0 0;
}

.id-card {
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  position: relative;
  padding-top: 20px;
}

.company-logo {
  position: absolute;
  top: 15px;
  left: 0;
  right: 0;
  font-weight: bold;
  font-size: 1.2em;
  color: #333;
}

.avatar-margin {
  margin-top: 60px;
}

.v-avatar {
  margin: 0 auto;
  border: 3px solid #f0f0f0;
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
  margin-right: 13px;
}

.floating-button:hover {
  background-color: #333;
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
.menu-item:hover {
  background-color: #333;
  color: #4caf50;
}
</style>
