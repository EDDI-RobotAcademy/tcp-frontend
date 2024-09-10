<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4" elevation="2">
          <v-card-title class="text-center">
            <v-text-field
              v-model="document.title"
              label="제목"
              outlined
              required
              placeholder="제목을 입력하세요"
            ></v-text-field>
          </v-card-title>
          <v-card-subtitle class="text-center text--secondary">
            작성자: {{ document.writer || '작성자 정보를 불러오는 중입니다...' }}
          </v-card-subtitle>
          <v-card-text class="text-center">
            <p>저장된 파일명: {{ getFileName(document.file) || '파일명 정보를 불러오는 중입니다...' }}</p>
            <p>등록일: {{ formatDate(document.regDate) || '등록일 정보를 불러오는 중입니다...' }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 수정 가능한 content 필드 -->
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4" elevation="2">
          <v-card-title class="text-center"><h3>논문 요약 내용 수정</h3></v-card-title>
          <v-textarea
            v-model="document.content"
            label="요약 내용"
            outlined
            required
            auto-grow
            style="width: 100%;"
          ></v-textarea>
        </v-card>
      </v-col>
    </v-row>

    <!-- 저장 및 취소 버튼 -->
    <v-row>
      <v-col cols="12" class="d-flex justify-center">
        <v-btn color="primary" @click="saveChanges">저장</v-btn>
        <v-btn color="grey" @click="cancelChanges">취소</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapState } from "vuex";

const documentModule = "documentModule";
const accountModule = "accountModule";

export default {
  props: {
    documentId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      title: "",
      writer: "",
      content: "",      
      currentUserNickname: '',
    }
  },
  computed: {
    ...mapState(documentModule, ["document"]),
    ...mapState(accountModule, ["email"]),
    // document() {
    //   return this.$store.state.documentModule.document || {}; // 기본값으로 빈 객체 설정
    // },
  },  
  methods: {
    ...mapActions("documentModule", [
      "requestDocumentToDjango",
      "requestModifyDocumentToDjango",
    ]),
    ...mapActions(accountModule, ['requestNicknameToDjango']),
    async saveChanges() {
      try {
        const payload = {          
          title: this.document.title,
          content: this.document.content,
          documentId: this.documentId,
        };        

        await this.requestModifyDocumentToDjango(payload);
        await this.$router.push({ 
          name: "DocumentReadPage", 
          params: { documentId: this.documentId } });
      } catch (error) {
        console.error('저장 중 오류가 발생했습니다:', error);
        alert('저장 중 오류가 발생했습니다.');
      }
    },
    cancelChanges() {
      this.$router.push({ name: "DocumentReadPage", params: { documentId: this.documentId } });
    },


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
    
  },

  async created() {
    await this.requestDocumentToDjango(this.documentId);
    const email = localStorage.getItem("email");
    this.currentUserNickname = await this.requestNicknameToDjango(email);
  },
};
</script>

<style scoped>
.v-container {
  margin-top: 30px;
}
</style>
