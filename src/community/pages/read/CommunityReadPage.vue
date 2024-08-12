<template>
  <v-container>
    <!-- <v-icon class="left-arrow" @click="navigateToPrevious">mdi-chevron-left</v-icon> -->
    <v-card class="main" v-if="community" outlined>
      <v-card-title class="headline">{{ community.title }}</v-card-title>
      <v-card-subtitle
        style="display: flex; justify-content: space-between; align-items: center"
      >
        <div>
          <v-icon small style="margin-right: -12px; margin-bottom: 2px;">mdi-account</v-icon>
          <span style="margin-right: 12px;">{{ community.writer }}</span> |
          <v-icon small style="margin-right: -12px; margin-bottom: 2px;">mdi-calendar</v-icon>
          {{ formatDate(community.regDate) }}
        </div>
        <div>
          <v-icon small style="margin-right: -12px; margin-bottom: 2px;">mdi-eye</v-icon>
          {{ community.viewCount }}
        </div>
      </v-card-subtitle>
      <v-divider></v-divider>
      <v-card-text class="card-text">{{ community.content }}</v-card-text>
    </v-card>

    <div v-if="isAuthor" class="floating-menu-container" @mouseover="showMenu" @mouseleave="hideMenu">
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
        <v-btn class="menu-item" @click="showDeleteDialog = true"> 삭제 </v-btn>
        <v-btn class="menu-item" @click="$router.push({ name: 'CommunityListPage' })">
          목록으로 이동
        </v-btn>
      </div>
    </div>
    <div v-if="!isAuthor" class="floating-menu-container" @mouseover="showMenu" @mouseleave="hideMenu">
      <v-btn class="floating-button" @click="$router.push({ name: 'CommunityListPage' })">
        <v-icon color="white">mdi-undo</v-icon>
      </v-btn>
    </div>
    <v-icon v-if="showNextArrow" class="right-arrow" @click="navigateToNext">mdi-chevron-right</v-icon>

    <v-dialog v-model="showDeleteDialog" max-width="500px">
      <v-card class="black-white-dialog">
        <v-card-text>정말로 삭제하시겠습니까?</v-card-text>
        <v-card-actions>
          <v-btn color="green" text @click="showDeleteDialog = false">취소</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="red" text @click="confirmDelete">확인</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapActions, mapState } from "vuex";

const communityModule = "communityModule";
const authenticationModule = "authenticationModule";
const googleAuthenticationModule = "googleAuthenticationModule";
const accountModule = 'accountModule'

export default {
  props: {
    communityId: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    menuOpen: false,
    showNextArrow: true,
    showDeleteDialog: false,
    currentUserNickname: '',
  }),
  computed: {
    ...mapState("communityModule", ["community"]),
    ...mapState("authenticationModule", ["isAuthenticatedKakao"]),
    ...mapState("googleAuthenticationModule", ["isAuthenticated"]),
    ...mapState("accountModule", ["email"]),
    isAuthor() {
      if (!this.community || !this.community.writer) {
        return false;
      }
      return this.community.writer === this.currentUserNickname;
    },
  },
  methods: {
    ...mapActions("communityModule", [
      "requestCommunityToDjango",
      "requestDeleteCommunityToDjango",
      "incrementCommunityViewCount",
    ]),
    ...mapActions(accountModule, ['requestNicknameToDjango']),
    async navigateToPrevious() {
      const previousId = Number(this.communityId) + 1;
      this.$router.push(`/community/read/${previousId}`);
      await this.requestCommunityToDjango(previousId);
      await this.incrementCommunityViewCount(previousId);
      this.showNextArrow = previousId !== 1;
    },
    async navigateToNext() {
      const nextId = Number(this.communityId) - 1;
      this.$router.push(`/community/read/${nextId}`);
      await this.requestCommunityToDjango(nextId);
      await this.incrementCommunityViewCount(nextId);
      this.showNextArrow = nextId !== 1;
    },
    async confirmDelete() {
      await this.onDelete();
      this.showDeleteDialog = false;
    },
    async onDelete() {
      await this.requestDeleteCommunityToDjango(this.communityId);
      this.$router.push({ name: "CommunityListPage" });
    },
    showMenu() {
      this.menuOpen = true;
    },
    hideMenu() {
      this.menuOpen = false;
    },
    formatDate(dateString) {
      const options = { year: "numeric", month: "2-digit", day: "2-digit" };
      return new Date(dateString)
        .toLocaleDateString("ko-KR", options)
        .replace(/\./g, "-")
        .replace(/ /g, "")
        .slice(0, -1);
    },
  },
  async created() {
    await this.requestCommunityToDjango(this.communityId);
    await this.incrementCommunityViewCount(this.communityId);
    this.showNextArrow = Number(this.communityId) !== 1;

    const email = this.$store.state.accountModule.email
    this.currentUserNickname = await this.requestNicknameToDjango(email);
  },
  watch: {
    async communityId(newId) {
      const community = await this.requestCommunityToDjango(newId);
      this.showNextArrow = Number(newId) !== 1;
      await this.incrementCommunityViewCount(newId);
    },
  },
};
</script>

<style scoped>
.headline {
  text-align: center;
  margin-top: 20px;
  font-weight: bold;
    font-size: 25px;
}

.v-card {
  max-width: 800px;
  margin: auto;
}

.main {
  margin-top: 90px;
}

.main:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s, box-shadow 0.3s;
}

.card-text {
  width: 100%;
  height: 300px;
  font-size: 16px;
  overflow: auto;
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

.left-arrow,
.right-arrow {
  font-size: 3rem;
  cursor: pointer;
  color: #000000;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.left-arrow {
  left: 100px;
}

.right-arrow {
  right: 100px;
}

.left-arrow:hover,
.right-arrow:hover {
  color: #4caf50;
}

.v-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.v-icon:hover {
  color: #4caf50;
}

.black-white-dialog {
  background-color: black;
  color: white;
}

.v-card-actions {
  justify-content: space-between;
}
</style>
