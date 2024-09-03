<template>
  <v-container>
    <h1 class="mb-4 text-center" style="font-size: x-large; color: white;">내가 저장한 논문 파일</h1>
    <v-card class="mb-4" elevation="2">
      <v-card-text>
        <v-row no-gutters>
          <v-col cols="12" class="d-flex justify-center mb-1">
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

    <v-row>
      <v-col v-for="(item, index) in filledItems" :key="index" cols="4" style="padding: 20px;">
        <v-hover v-slot:default="{ isHovering, props }">
          <v-card
            class="mb-4"
            outlined
            v-bind="props"
            :class="{'hover-effect': isHovering, 'empty-card': !item}"
            style="height: 60vh; width: 100%;"
            @click="item ? goToDocumentPage(item) : goToDocumentRegisterPage()"
          >
            <v-card-actions class="d-flex justify-center" v-if="item">
              <v-btn icon color="amber" style="width: 250px; height: 200px;">
                <img :src="require('@/assets/images/fixed/icon-B.png')" class="button-icon">
              </v-btn>
            </v-card-actions>

            <v-card-title class="text-center">
              <div class="subtitle-1 font-weight-medium" :class="{ 'empty-text': !item }">
                {{ item ? item.title : '빈 문서' }}
              </div>
            </v-card-title>

            <v-card-subtitle class="text-center">
              <div class="caption text--secondary" :class="{ 'empty-text': !item }">
                {{ item ? item.writer : '작성자 없음' }}
              </div>
            </v-card-subtitle>
            <v-card-text>
              <div class="text-center">
                <h1 style="color: black; font-size: 20px" v-if="item">
                  논문 파일명: {{ item ? getFileName(item.file) : '파일명 없음' }}
                </h1>
                <div v-if="item">
                  등록일: {{ item ? formatDate(item.regDate) : 'N/A' }}
                </div>
                <v-icon v-if="!item" color="grey lighten-2" size="80" class="empty-icon">mdi-file-document-outline</v-icon>
              </div>
            </v-card-text>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>

    <div class="text-right mb-4">
      <v-btn color="white" @click="goToDocumentRegisterPage">
        <v-icon>mdi-upload</v-icon>
        논문 파일 & 요약본 Upload
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

const documentModule = "documentModule";
const authenticationModule = "authenticationModule";
const googleAuthenticationModule = "googleAuthenticationModule";
const accountModule = "accountModule";

export default {
  computed: {
    ...mapState(documentModule, ["documents"]),
    ...mapState(authenticationModule, ["isAuthenticatedKakao"]),
    ...mapState(googleAuthenticationModule, ["isAuthenticatedGoogle"]),
    ...mapState(accountModule, ["isAuthenticatedNormal"]),
    pagedItems() {
      const startIdx = (this.pagination.page - 1) * this.perPage;
      const endIdx = startIdx + this.perPage;
      return this.filteredItems.slice(startIdx, endIdx);
    },
    filteredItems() {
      return this.documents
        .filter((item) => item.title.toLowerCase().includes(this.search.toLowerCase()))
        .sort((a, b) => new Date(b.regDate) - new Date(a.regDate));
    },
    filledItems() {
      // 빈 아이템을 포함하여 항상 3개의 카드가 표시되도록 함
      const items = this.pagedItems;
      while (items.length < this.perPage) {
        items.push(null); // 빈 아이템을 추가
      }
      return items;
    },
    startIndex() {
      return (this.pagination.page - 1) * this.perPage + 1;
    },
    endIndex() {
      return Math.min(this.startIndex + this.perPage - 1, this.documents.length);
    },
  },
  mounted() {
    this.requestDocumentListToDjango();
  },
  methods: {
    ...mapActions(documentModule, ["requestDocumentListToDjango"]),
    goToDocumentPage(item) {
      if (item) {
        // documentId를 올바르게 전달
        this.$router.push({
          name: "DocumentReadPage",
          params: { documentId: item.documentId.toString() },
        });
      } else {
        this.goToDocumentRegisterPage();
      }
    },
    goToDocumentRegisterPage() {
      this.$router.push({ name: "DocumentRegisterPage" });
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
    getFileName(file) {
      const encodedFileName = file ? file.split("/").pop() : "파일명을 불러올 수 없습니다";
      return decodeURIComponent(encodedFileName);
    },
  },
  data() {
    return {
      search: "",
      perPage: 3,
      pagination: {
        page: 1,
      },
    };
  },
};
</script>

<style scoped>
.hover-effect {
  background-color: #00ffd07f;
}

.v-container {
  margin: 0;
  width: 100%;
  max-width: 100vw;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding-top: 50px;
  background: url("@/assets/images/homeImages/home_bg.jpg") no-repeat center center;
  background-size: cover;
}
.v-card {
  background-color: rgba(255, 255, 255, 0.7);
}

.empty-card {
  background-color: rgba(255, 255, 255, 0.3); /* 희미한 배경색 */
  border: 0.5cap dashed rgba(121, 121, 121, 0.5); /* 희미한 테두리 */
}

.empty-text {
  margin-top: 15%;
  color: rgba(0, 0, 0, 0.5); /* 희미한 텍스트 색상 */
}

.empty-icon {
  margin-top: 20px;
}
</style>
