<template>
  <v-container>
  <v-icon class="left-arrow" @click="$router.push({ name: 'CommunityReadPage', params: { communityId } })">mdi-chevron-left</v-icon>
    <v-card class="main" v-if="community" outlined>
      <v-text-field class="headline" v-model="title"></v-text-field>
      <v-card-subtitle
        style="display: flex; justify-content: space-between; align-items: center"
      >
        <div>
          <v-icon small style="margin-right: -12px; margin-bottom: 2px"
            >mdi-account</v-icon
          >
          <span style="margin-right: 12px">{{ community.writer }}</span> |
          <v-icon small style="margin-right: -12px; margin-bottom: 2px"
            >mdi-calendar</v-icon
          >
          {{ formatDate(community.regDate) }}
        </div>
      </v-card-subtitle>
      <v-divider></v-divider>
      <v-card-text class="card-text">
        <v-textarea v-model="content" auto-grow />
      </v-card-text>
    </v-card>
    <v-icon class="right-arrow" @click="onModify"
      >mdi-check</v-icon
    >
  </v-container>
</template>

<script>
import { mapActions, mapState } from "vuex";

const communityModule = "communityModule";
const accountModule = 'accountModule';

export default {
  props: {
    communityId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      title: "",
      writer: "",
      content: "",
      currentUserNickname: "",
    };
  },
  computed: {
    ...mapState(communityModule, ["community"]),
    ...mapState(accountModule, ["nickname"]),
  },
  methods: {
    ...mapActions(communityModule, [
      "requestCommunityToDjango",
      "requestModifyCommunityToDjango",
    ]),
    ...mapActions(accountModule, ['requestNicknameToDjango']),
    async onModify() {
      const payload = {
        title: this.title,
        content: this.content,
        communityId: this.communityId,
      };

      await this.requestModifyCommunityToDjango(payload);
      await this.$router.push({
        name: "CommunityReadPage",
        params: { communityId: this.communityId },
      });
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
    this.currentUserNickname = await this.requestNicknameToDjango();

    await this.requestCommunityToDjango(this.communityId);
    
    if (this.community.writer !== this.currentUserNickname) {
      this.$router.push({ name: 'HomeView' });
    } else {
      this.title = this.community.title;
      this.writer = this.community.writer;
      this.content = this.community.content;
    }
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
</style>