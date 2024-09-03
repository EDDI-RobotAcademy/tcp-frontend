<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4" elevation="2">
          <v-card-title class="text-center">
            <h2>{{ document.title || '데이터를 불러오는 중입니다...' }}</h2>
          </v-card-title>
          <v-card-subtitle class="text-center text--secondary">
            작성자: {{ document.writer || '작성자 정보를 불러오는 중입니다...' }}
          </v-card-subtitle>
          <v-card-text class="text-center">
            <p>저장된 파일명: {{ getFileName(document.file) || '파일명 정보를 불러오는 중입니다...' }}</p>
            <p>등록일: {{ formatDate(document.regDate) || '등록일 정보를 불러오는 중입니다...' }}</p>
            
          </v-card-text>
          <v-card-actions class="d-flex justify-center">
            <v-btn class="menu-item" @click="downloadFile" :disabled="!document.file">
              <v-icon left>mdi-download</v-icon>
              파일 다운로드
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- 추가된 content 필드 -->
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4" elevation="2">
          <div v-if="document.content">
            <v-card-title class="text-center"><h3>논문 요약 내용</h3></v-card-title>
            <textarea class="summary-content" v-model="document.content" style="width: 100%; height: 300px; margin: 20px;"></textarea>            
          </div>
        </v-card>
      </v-col>
    </v-row>

    <div v-if="isAuthor" class="floating-menu-container" @mouseover="showMenu" @mouseleave="hideMenu">
      <v-btn class="floating-button" elevation="12">
        <v-icon>{{ menuOpen ? 'mdi-close' : 'mdi-menu' }}</v-icon>
      </v-btn>
      <div v-if="menuOpen" class="floating-menu">
        <v-btn
          class="menu-item"
          @click="$router.push({ name: 'DocumentModifyPage', params: { documentId } })"
        >
          수정
        </v-btn>
        <v-btn class="menu-item" @click="showDeleteDialog = true"> 삭제 </v-btn>
        <v-btn class="menu-item" @click="$router.push({ name: 'DocumentListPage' })">
          목록으로 이동
        </v-btn>
      </div>
    </div>
    <div v-if="!isAuthor" class="floating-menu-container">
      <v-btn class="floating-button" @click="$router.push({ name: 'DocumentListPage' })">
        <v-icon color="white">mdi-undo</v-icon>
      </v-btn>
    </div>

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

const documentModule = "documentModule";
const authenticationModule = "authenticationModule";
const googleAuthenticationModule = "googleAuthenticationModule";
const accountModule = "accountModule";

export default {
  props: {
    documentId: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    menuOpen: false,
    showDeleteDialog: false,
    currentUserNickname: '',
  }),
  computed: {
    ...mapState("documentModule", ["document"]),
    ...mapState("authenticationModule", ["isAuthenticatedKakao"]),
    ...mapState("googleAuthenticationModule", ["isAuthenticatedGoogle"]),
    ...mapState("accountModule", ["email"]),
    isAuthor() {
      if (!this.document || !this.document.writer) {
        return false;
      }
      return this.document.writer === this.currentUserNickname;
    },
    document() {
      return this.$store.state.documentModule.document || {}; // 기본값으로 빈 객체 설정
    },
  },
  
  methods: {
    ...mapActions("documentModule", [
      "requestDocumentToDjango",
      "requestDocumentListToDjango",
      "requestDeleteDocumentToDjango",
    ]),
    ...mapActions(accountModule, ['requestNicknameToDjango']),
    
    formatDate(dateString) {
      if (!dateString) return 'Invalid Date';
      const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      return new Date(dateString)
        .toLocaleDateString('ko-KR', options)
        .replace(/\./g, '-')
        .replace(/ /g, '')
        .slice(0, -1);
    },

    getFileName(file) {
      const encodedFileName = file ? file.split('/').pop() : '파일명을 불러올 수 없습니다';
      return decodeURIComponent(encodedFileName);
    },

    downloadFile() {
      if (this.document.file) {
        const link = document.createElement('a');
        const baseUrl = process.env.VUE_APP_BASE_URL;
        const encodedFileName = encodeURIComponent(this.getFileName(this.document.file));
        link.href = `${baseUrl}${this.document.file}`;
        link.target = '_blank';
        link.click();
      } else {
        alert('파일 경로를 불러오는 데 문제가 발생했습니다.');
      }
    },

    showMenu() {
      this.menuOpen = true;
    },

    hideMenu() {
      this.menuOpen = false;
    },

    async confirmDelete() {
      if (!this.documentId) {
        alert("삭제할 문서의 ID가 설정되지 않았습니다.");
        return;
      }
  
      try {
        await this.onDelete();
        this.showDeleteDialog = false;
      } catch (error) {
        console.error('삭제 중 오류가 발생했습니다:', error);
        alert('삭제 중 오류가 발생했습니다.');
      }
    },

    async onDelete() {
      try {
        await this.requestDeleteDocumentToDjango(this.documentId);
        this.$router.push({ name: "DocumentListPage" });
      } catch (error) {
        console.error('onDelete() 에러:', error);
        throw error;
      }
    },
  },

  async created() {
    await this.requestDocumentToDjango(this.documentId);
    const email = localStorage.getItem("email");
    this.currentUserNickname = await this.requestNicknameToDjango(email);
  },
  watch: {
    async documentId(newId) {
      const document = await this.requestDocumentToDjango(newId);
    },
  },
};
</script>

<style scoped>
.v-container {
  margin-top: 30px;
}

.floating-menu-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  z-index: 1000;
}

.floating-button {
  background-color: #000;
  color: #fff;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-file: center;
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.3);
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.floating-button .v-icon {
  font-size: 24px;
}

.floating-button:hover {
  background-color: #333;
  transform: scale(1.1);
}

.floating-menu {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}

.menu-item {
  background-color: #000;
  color: #fff;
  margin-bottom: 10px;
  width: 140px;
  height: 40px;
  text-align: center;
  line-height: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s ease;
  font-size: 16px;
}

.menu-item:hover {
  background-color: #333;
  color: #4caf50;
}

.black-white-dialog {
  background-color: black;
  color: white;
}
</style>
