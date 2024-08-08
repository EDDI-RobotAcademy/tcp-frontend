<template>
  <v-container>
    <h2 class="mb-4 text-center" style="margin-top: 28px;">COMMUNITY</h2>
    <v-card class="mb-4" elevation="2">
      <v-card-text>
        <v-row no-gutters>
          <v-col cols="12" class="d-flex justify-center mb-4">
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="검색"
              single-line
              hide-details
              @input="filterByTitle"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-card class="mb-4">
      <v-row no-gutters>
        <v-col cols="1" class="pa-3 text-center"><strong>프로필</strong></v-col>
        <v-col cols="5" class="pa-3 text-center"><strong>제목</strong></v-col>
        <v-col cols="1" class="pa-3 text-center"><strong>작성자</strong></v-col>
        <v-col cols="2" class="pa-3 text-center"><strong>등록일</strong></v-col>
        <v-col cols="1" class="pa-3 text-center"><strong>조회수</strong></v-col>
        <v-col cols="2" class="pa-3 text-center"><strong>즐겨찾기</strong></v-col>
      </v-row>
    </v-card>
    <v-hover
      v-for="item in pagedItems"
      :key="item.communityId"
      v-slot:default="{ isHovering, props }"
    >
      <v-card
        class="mb-4"
        outlined
        v-bind="props"
        :class="{ 'hover-effect': isHovering }"
      >
        <v-row no-gutters align="center" @click="readRow(item)">
          <v-col cols="1" class="pa-3 d-flex justify-center">
            <v-avatar color="grey" size="40">
              <v-icon left>mdi-account</v-icon>
            </v-avatar>
          </v-col>
          <v-col cols="5" class="pa-3 text-center">
            <div class="subtitle-1 font-weight-medium">{{ item.title }}</div>
          </v-col>
          <v-col cols="1" class="pa-3 text-center">
            <div class="caption text--secondary">{{ item.writer }}</div>
          </v-col>
          <v-col cols="2" class="pa-3 text-center">
            <div class="subtitle-1 font-weight-medium">
              {{ formatDate(item.regDate) }}
            </div>
          </v-col>
          <v-col cols="1" class="pa-3 text-center">
            <div class="subtitle-1 font-weight-medium">{{ item.viewCount }}</div>
          </v-col>
          <v-col cols="2" class="pa-3 d-flex align-center justify-center">
            <v-btn icon color="amber" class="ml-2">
              <v-icon>mdi-star-outline</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-hover>

    <div class="text-right mb-4">
      <v-btn v-if="isAuthenticated" color="white" :to="{ name: 'CommunityRegisterPage' }">
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
    </div>

    <v-pagination
      v-model="pagination.page"
      :length="Math.ceil(filteredItems.length / perPage)"
      :total-visible="7"
      color="primary"
      @input="updateItems"
    ></v-pagination>
  </v-container>
</template>

<script>
import { mapActions, mapState } from "vuex";

const communityModule = "communityModule";
const authenticationModule = "authenticationModule";

export default {
  computed: {
    ...mapState(communityModule, ["communitys"]),
    ...mapState(authenticationModule, ["isAuthenticated"]),
    pagedItems() {
      const startIdx = (this.pagination.page - 1) * this.perPage;
      const endIdx = startIdx + this.perPage;
      return this.filteredItems.slice(startIdx, endIdx);
    },
    filteredItems() {
      return this.communitys
        .filter((item) => item.title.toLowerCase().includes(this.search.toLowerCase()))
        .sort((a, b) => new Date(b.regDate) - new Date(a.regDate));
    },
    startIndex() {
      return (this.pagination.page - 1) * this.perPage + 1;
    },
    endIndex() {
      return Math.min(this.startIndex + this.perPage - 1, this.communitys.length);
    },
  },
  mounted() {
    this.requestCommunityListToDjango();
  },
  methods: {
    ...mapActions(communityModule, ["requestCommunityListToDjango"]),
    readRow(item) {
      this.$router.push({
        name: "CommunityReadPage",
        params: { communityId: item.communityId.toString() },
      });
    },
    filterByTitle() {
      this.pagination.page = 1;
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
  data() {
    return {
      search: "",
      perPage: 5,
      pagination: {
        page: 1,
      },
    };
  },
};
</script>

<style>
.hover-effect {
  background-color: #f0f0f0;
}
.v-container {
  margin-top: 50px;
}
</style>
