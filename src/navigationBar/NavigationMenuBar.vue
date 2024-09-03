<template>
  <v-app-bar color="rgba(0, 0, 0, 1)" app dark height="64">
    <v-toolbar-title class="navbar-title">
      <v-btn text @click="goToHome" class="navbar-title-btn">        
        <v-icon class="home-icon"> mdi-console </v-icon>
        <span> &nbsp; Text Chat Prompt</span>
      </v-btn>
    </v-toolbar-title>
    <v-spacer></v-spacer>

    <v-btn text @click="goToCommunityList" class="btn-text">
      <span>COMMUNITY Board</span>
    </v-btn>

    <v-menu close-on-content-click>
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" class="btn-text">          
          <b>AI-Document</b>
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-for="(item, index) in myDocumentItems"
          :key="index"
          @click="item.action"
        >
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <v-menu v-if="isAuthenticatedKakao || isAuthenticatedGoogle || isAuthenticatedNormal" close-on-content-click>
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" class="btn-text" style="margin-right: 16px">
          <b>My Page</b>
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-for="(item, index) in myPageItems"
          :key="index"
          @click="item.action"
        >
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <v-btn v-if="!isAuthenticatedKakao && !isAuthenticatedGoogle && !isAuthenticatedNormal" text @click="signIn" class="btn-text">
      <v-icon left>mdi-login</v-icon>
      <span> &nbsp; LOGIN</span>
    </v-btn>
    <v-btn v-else text @click="signOut" class="btn-text">
      <v-icon left>mdi-logout</v-icon>
      <span> &nbsp; LOGOUT</span>
    </v-btn>
  </v-app-bar>
</template>

<script>
import "@mdi/font/css/materialdesignicons.css";
import router from "@/router";
import { mapActions, mapState } from "vuex";

const accountModule = "accountModule";
const authenticationModule = "authenticationModule";
const googleAuthenticationModule = "googleAuthenticationModule";

export default {
  data() {
    return {
      myDocumentItems: [
        {
          title: "AI 논문 자료 정리",
          action: () => {
            this.goToDocumentList();
          },
        },
        // {
        //   title: "내가 저장한 논문 요약",
        //   action: () => {
        //     this.goToDocumentSummaryList();
        //   },
        // },        
      ],
      myPageItems: [
        {
          title: "회원 정보",
          action: () => {
            this.goToMyPage();
          },
        },        
      ],
      isUserAuthenticated: localStorage.getItem('isUserAuthenticated'),
    };
  },
  computed: {
    ...mapState(authenticationModule, ["isAuthenticatedKakao"]),
    ...mapState(googleAuthenticationModule, ["isAuthenticatedGoogle"]),
    ...mapState(accountModule, ["loginType", "isAuthenticatedNormal"]),
  },
  methods: {
    ...mapActions(authenticationModule, ["requestKakaoLogoutToDjango"]),
    ...mapActions(googleAuthenticationModule, ["requestGoogleLogoutToDjango"]),
    
    goToHome() {
      router.push("/");
    },    
    goToCommunityList() {
      router.push("/community/list");
    },

    goToDocumentList() {
      router.push("/document/list");
    },
    // goToDocumentSummaryList() {
    //   router.push("/documentSummary/list");
    // },

    goToMyPage() {
      router.push("/account/mypage");
    },

    signIn() {
      router.push("/account/login");
    },
    signOut() {
      if (localStorage.getItem('loginType') == 'KAKAO') {
        this.requestKakaoLogoutToDjango();
        this.$store.state.authenticationModule.isAuthenticatedKakao = false
      }
      if (localStorage.getItem('loginType') == 'GOOGLE') {
        this.requestGoogleLogoutToDjango();
        this.$store.state.googleAuthenticationModule.isAuthenticatedGoogle = false
      }
      if (localStorage.getItem('loginType') == 'NORMAL') {
        localStorage.removeItem("normalToken")
        localStorage.removeItem("email")
        localStorage.removeItem("loginType")
        this.$store.state.accountModule.isAuthenticatedNormal = false;
      }
      router.push("/");
    },    
  },

  mounted() {
    console.log("navigation bar mounted()");
    const userToken = localStorage.getItem("userToken");
    if (userToken) {
      console.log("You already has a userToken!");
      this.$store.state.authenticationModule.isAuthenticatedKakao = true
    }
    
    const googleUserToken = localStorage.getItem("googleUserToken")
    if (googleUserToken) {
      console.log("You already has a googleUserToken!")
      this.$store.state.googleAuthenticationModule.isAuthenticatedGoogle = true
    }
    const normalToken = localStorage.getItem("normalToken")
    if (normalToken) {
      this.$store.state.accountModule.isAuthenticatedNormal = true
    }
  },
};
</script>

<style scoped>
.navbar-title {
  font-size: 24px;
  font-weight: bold;
  color: white;
}

.navbar-title-btn {
  color: white;
}

.v-icon.home-icon {
  font-size: 32px;
  margin-right: 0px;
  color: rgb(0, 255, 0);;
}

.mdi-icon {
  font-size: 32px;
  margin-right: 8px;
}

.btn-text {
  font-size: 14px;
  margin-right: 16px;
  color: white;
}

.v-btn {
  text-transform: uppercase;
}

.v-btn:hover {
  background-color: rgba(0, 255, 55, 0.25);
}

.v-btn:hover .btn-text {
  color: white;
}

.v-btn:focus {
  background-color: rgba(0, 255, 55, 0.25); /* 클릭해서 선택되었을시 표시 */
  color: white;
}

.v-btn:focus .btn-text {
  color: white;
}

.v-menu > .v-overlay__content > .v-card,
.v-menu > .v-overlay__content > .v-sheet,
.v-menu > .v-overlay__content > .v-list {
  background-color: rgba(2, 74, 27, 0.479);  
  color: rgb(0, 255, 0);
  border: 2px solid rgb(0, 255, 0);
}

.v-list-item:hover {
  background-color: rgba(0, 255, 55, 0.25);
}

</style>
