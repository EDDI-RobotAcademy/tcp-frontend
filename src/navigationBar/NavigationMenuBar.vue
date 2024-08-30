<template>
  <v-app-bar color="rgba(0, 0, 0, 1)" app dark height="64">
    <v-toolbar-title class="navbar-title">
      <v-btn text @click="goToHome" class="navbar-title-btn">        
        <v-icon class="home-icon"> mdi-console </v-icon>
        <span> &nbsp; Text Chat Prompt</span>
      </v-btn>
    </v-toolbar-title>
    <v-spacer></v-spacer>

    <!-- <v-btn text @click="goToProductList" class="btn-text">
      <span>논문 소개</span>
    </v-btn> -->

    <v-btn text @click="goToCommunityList" class="btn-text">
      <span>COMMUNITY Board</span>
    </v-btn>

    <!-- <v-btn text @click="goToReviewList" class="btn-text">
      <span>TCP REVIEW</span>
    </v-btn> -->

    <!-- <v-btn v-if="isAuthenticated" text @click="goToCart" class="btn-text">
      <span>Cart</span>
    </v-btn>

    <v-btn v-if="isAuthenticated" text @click="goToOrder" class="btn-text">
      <span>Order</span>
    </v-btn> -->

    <v-menu close-on-content-click>
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" class="btn-text">
          <!-- <b>Report</b> -->
          <b>My Document</b>
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-for="(item, index) in reportItems"
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
      reportItems: [
        {
          title: "내가 저장한 논문 요약",
          action: () => {
            this.goToPurchaseTrendAnalysisPage();
          },
        },
        {
          title: "내가 저장한 논문 원본",
          action: () => {
            this.goToCustomerChurnPredictionPage();
          },
        },
      ],
      myPageItems: [
        {
          title: "MY PAGE",
          action: () => {
            this.goToMyPage();
          },
        },
        {
          title: "LOGOUT",
          action: () => {
            this.signOut();
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
    goToReport() {
      router.push("/report");
    },
    goToProductList() {
      router.push("/product/list");
    },
    goToCommunityList() {
      router.push("/community/list");
    },
    goToReviewList() {
      router.push("/review/list");
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
    goToCart() {
      router.push("/cart/list");
    },
    goToOrder() {
      router.push("/order/list");
    },
    goToMyPage() {
      router.push("/account/mypage");
    },
    goToPurchaseTrendAnalysisPage() {
      router.push("/report/purchase-trend-analysis");
    },
    goToCustomerChurnPredictionPage() {
      router.push("/report/customer-churn-prediction");
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
  background-color: rgba(0, 255, 55, 0.1);  
  color: darkgreen;
  border: 2px solid green;
}

.v-list-item:hover {
  background-color: rgba(0, 255, 55, 0.25);
}

</style>
