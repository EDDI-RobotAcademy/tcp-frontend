<template style="overflow-y: hidden;">
  <div class="home-container">
    <div class="nav-container">
      <!-- 네비게이션 바 내용 -->
    </div>

    <div class="content-wrapper">
      <div class="text-and-buttons" style="margin-top: 3vh; line-height: 1.5;">
        <div class="text-container">
          <p class="subtitle">"Text Chat Prompt for TCP SINCE 2024"</p>
          <div style="margin-bottom: 10px"></div>
          <p class="description">
            TCP는 양질의 논문 컨텐츠로<br>
            AI 연구와 학습의 즐거움을<br>
            보다 많은 사람들과 공유할 수 있는 그 날까지
          </p>
        </div>

        <div class="buttons">
          <button class="goToCommunity-button" @click="goToCommunityList">
            <img :src="require('@/assets/images/fixed/icon-A.png')" class="button-icon">
            AI 논문 커뮤니티로<br>이동하기
          </button>
          <button class="goToDocument-button" @click="goToDocumentOriginList">
            <img :src="require('@/assets/images/fixed/icon-B.png')" class="button-icon">
            AI 논문 자료 구경하러<br>이동하기
          </button>
        </div>
      </div>

      <div class="prompt-container" @dragover.prevent @drop.prevent="handleDrop">
        <div class="chat-window">
          <div v-for="(message, index) in chatHistory" :key="index" :class="['message', message.type]">
            <img :src="message.type === 'user' ? userAvatar : aiAvatar" :alt="message.type + ' avatar'" class="avatar">
            <!-- <div class="message-content">{{ message.content }}</div> -->
            <div class="message-content" v-html="renderMessageContent(message)"></div>
          </div>

           <!-- 로딩 상태일 때 표시되는 ... 말풍선 -->
           <div v-if="isLoading" class="message ai">
            <img :src="aiAvatar" alt="ai avatar" class="avatar">
            <div class="loading-message">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          </div>
        </div>

        <div class="input-area">
          <textarea v-model="userInput" placeholder="메시지를 입력하세요..." @keyup.enter="sendMessage"></textarea>
          <button @click="sendMessage">전송</button>
          <!-- 파일 선택 버튼 추가 -->
          <input type="file" ref="fileInput" @change="handleFileSelect" style="display: none;" />
          <button @click="triggerFileSelect">파일 선택</button>
        </div>

        <!-- 선택된 파일명을 보여주기 위한 영역 -->
        <div v-if="selectedFileName" class="selected-file">
          <p>업로드된 파일: {{ selectedFileName }}</p>
        </div>
      </div>
    </div>

    <div class="footer-container">
      <p class="reserved-info">2024 Text Chat Prompt Korea LLC. All Rights Reserved.</p>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import userAvatarSrc from '@/assets/images/fixed/user-avatar.png'  // 사용자 아바타 이미지 경로
import aiAvatarSrc from '@/assets/images/fixed/ai-avatar.png'  // AI 아바타 이미지 경로
import router from "@/router";
import { mapActions, mapState } from "vuex";
import markdownIt from 'markdown-it'
import { s3Client, env } from "@/utility/awsFileS3Config"
import { PutObjectCommand} from '@aws-sdk/client-s3'

const authenticationModule = "authenticationModule";
const googleAuthenticationModule = "googleAuthenticationModule";
const userInputModule = 'userInputModule'

export default defineComponent({
  name: "HomeView",
  data() {
    return {
      userInput: '',
      userInputMessage: '',
      aiOutput: '',
      chatHistory: [
        { type: 'ai', content: '안녕하세요! 어떤 도움이 필요하신가요?' }
      ],
      userAvatar: userAvatarSrc,
      aiAvatar: aiAvatarSrc,

      isLoading: false,  // 로딩 상태 추가,
      md: new markdownIt(), // markdown-it
      
      selectedFile: null,  // 업로드된 파일을 저장하는 변수
      selectedFileName: '',  // 선택된 파일명을 저장하는 변수

    };
  },
  computed: {
    ...mapState(authenticationModule, ["isAuthenticatedKakao"]),
    ...mapState(googleAuthenticationModule, ["isAuthenticatedGoogle"]),
  },
  methods: {
    ...mapActions(authenticationModule, ["requestKakaoLogoutToDjango"]),
    ...mapActions(googleAuthenticationModule, ["requestGoogleLogoutToDjango"]),
    ...mapActions(userInputModule, ['requestInferToFastAPI', 'requestInferedAnswerToFastAPI']),
    renderMessageContent(message) {
      if (message.type !== 'user') {
        // markdown-it로 렌더링된 내용에 .markdown-content 클래스를 추가
        return `<div class="markdown-content">${this.md.render(message.content)}</div>`;
      } else {
        return message.content
      }
    },
    goToCommunityList() {
      router.push("/community/list");
    },
    goToDocumentOriginList() {
      router.push("/DocumentOrigin/list");
    },    

    async sendMessage() {
      if (this.userInput.trim() || this.selectedFile) {
        // 텍스트 메시지를 채팅 히스토리에 추가
        if (this.userInput.trim()) {
          this.chatHistory.push({ type: 'user', content: this.userInput });
          this.userInputMessage = this.userInput;
        }

        this.userInput = '';
        this.isLoading = true;  // ... 로딩 상태 활성화

        // FastAPI로 사용자 입력 또는 파일 전송
        await this.requestInferToFastAPI({ data: { text: this.userInputMessage } })

        let response = null;
        for (let i = 0; i < 30; i++) {
            response = await this.requestInferedAnswerToFastAPI();
            if (response && response.generatedText) {
                break;  // 응답이 오면 루프 탈출
            }
            await new Promise(resolve => setTimeout(resolve, 2000));  // 2초 대기
        }

        this.isLoading = false;  // 로딩 상태 해제

        if (response && response.generatedText) {
            this.chatHistory.push({ type: 'ai', content: response.generatedText });
        } else {
            console.log('서버에서 응답을 받지 못했습니다.');
        }
      }

      // S3에 파일 업로드
      if (this.selectedFile) {
        this.uploading = true;
        this.uploadSuccess = false;
        
        const BUCKET_NAME = process.env.VUE_APP_AWS_S3_BUCKET_NAME
        const params = {
            Bucket: BUCKET_NAME,
            Key: this.selectedFileName,
            Body: this.selectedFile,
            ACL: 'private'
        };

        try {
            console.log('Uploading file with params:', params); // Debug information
            const data = await s3Client.send(new PutObjectCommand(params));
            this.uploading = false;
            this.uploadSuccess = true;
            this.fileKey = params.Key;
            console.log('File uploaded successfully:', data);
            await this.requestAnalyzePaperFileToFastAPI({ "data": this.selectedFileName })
        } catch (err) {
            this.uploading = false;
            console.error('Error uploading file:', err);
        }
        console.log('selectedFileName: ', this.selectedFileName)

        // 선택된 파일 및 파일명을 초기화
        this.selectedFile = null;
        this.selectedFileName = '';
      }
    },

    triggerFileSelect() {
      this.$refs.fileInput.click();
    },

    handleFileSelect(event) {
      const file = event.target.files[0];
      if (file) {
        this.selectedFile = file;
        this.selectedFileName = file.name;  // 파일명을 저장하여 화면에 표시
      }
    },

    handleDrop(event) {
      const file = event.dataTransfer.files[0];
      if (file) {
        this.selectedFile = file;
        this.selectedFileName = file.name;  // 파일명을 저장하여 화면에 표시
      }
    }
  },
});
</script>

<style scoped>
/* 홈 화면의 전체 컨테이너 설정 */
.home-container {
  margin: 0;
  width: 100%;
  max-width: 100vw;
  height: 100%;
  display: flex;
  /* Flexbox 사용하여 가운데 정렬 */
  flex-direction: column;
  /* 세로 방향 정렬 */
  align-items: center;
  /* 수직 가운데 정렬 */
  padding: 0;
  background: url("@/assets/images/homeImages/home_bg.jpg") no-repeat center center;
  /* 배경 이미지 설정 */
  background-size: cover;
  /* 배경 이미지 크기 설정 */
}

/* 텍스트와 버튼을 함께 배치하기 위한 래퍼 */
.text-and-buttons {
  display: flex;
  /* Flexbox 사용하여 행으로 정렬 */
  align-items: center;
  /* 수직 가운데 정렬 */
  justify-content: space-between;
  /* 텍스트와 버튼 사이 여백 */
  width: 100%;
  max-width: 1200px;
  margin-bottom: 10px;
}

/* 텍스트와 버튼을 가운데 정렬하기 위한 래퍼 */
.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}

/* 채팅 프롬프트 컨테이너 */
.prompt-container {
  width: 80%;
  max-width: 1980px;
  margin: 33px auto;
  border-radius: 20px;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(1px);
  /* 배경 흐림 효과 */
  box-shadow: 0 0 15px 5px cyan, 0 0 25px 15px #2d00ff;
  /* 외부 테두리 그림자 효과 */
}

/* 채팅 창 */
.chat-window {
  height: 550px;
  overflow-y: auto;
  padding: 20px;
  background-color: transparent;
  /* 배경을 투명하게 설정 */
}

/* 각 메시지의 스타일 */
.message {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
  max-width: 75%;
}

.user {
  margin-left: auto;
  flex-direction: row-reverse;
}

.ai {
  margin-right: auto;
}

/* 아바타 이미지 스타일 */
.avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  margin: 0 10px;
  /* 아바타 좌우 여백 추가 */
  border: 2px solid transparent;
  /* 기본적으로 투명한 테두리 설정 */
  background-image: linear-gradient(45deg, cyan, #2d00ff), linear-gradient(45deg, cyan, #2d00ff);
  background-origin: border-box;
  background-clip: padding-box, border-box;
}

/* 메시지 내용 스타일 */
.message-content {
  padding: 10px 15px;
  border-radius: 18px;
  max-width: calc(100% - 60px);
  /* 아바타 크기를 고려한 최대 너비 */
  background-color: rgba(255, 255, 255, 0.8);
  /* 메시지 배경을 약간 투명하게 설정 */
}

.user .message-content {
  background-color: rgb(44, 44, 44);
  /* 사용자 메시지 배경 */
  color: white;
  border-radius: 20px 20px 0px 20px;
}

.ai .message-content {
  background-color: lightgray;
  /* AI 메시지 배경 */
  color: black;
  border-radius: 20px 20px 20px 0px;
}

/* 메시지 입력 영역 스타일 */
.input-area {
  display: flex;
  align-items: center;
  /* 세로 가운데 정렬 */
  margin: 1%;
  background-color: rgba(255, 255, 255, 0.1);
  /* 입력 영역 배경을 약간 투명하게 설정 */
  border-radius: 15px;
  /* 모서리를 둥글게 */
  width: 98%;
  /* 전체 너비 */

}

textarea {
  flex-grow: 1;
  border: none;
  padding: 10px;
  resize: none;
  /* 사용자가 크기를 조정할 수 없도록 설정 */
  overflow: hidden;
  /* 스크롤바를 숨김 */
  height: 40px;
  /* 고정된 높이 */
  border-radius: 10px;
  /* 모서리를 둥글게 */
  box-sizing: border-box;
  font-size: 15px;
  /* 글자 크기 조정 */
  background-color: rgba(255, 255, 255, 0.1);
  /* 메시지 입력 창 배경 */
  color: white;
  /* 글자 색상 */
}

/* 전송 버튼 스타일 */
button {
  background-color: white;
  color: black;
  border: none;
  padding: 10px 10px;
  margin-left: 10px;
  cursor: pointer;
  border-radius: 20px;
  font-size: 16px;
}

/* 텍스트 및 버튼 컨테이너 스타일 */
.text-container {
  text-align: left;
  /* 텍스트 정렬 */
  max-width: 700px;
}

/* 주요 타이틀 스타일 */
.subtitle {
  font-size: 30px;
  font-weight: bold;
  background: linear-gradient(to right, rgb(9, 209, 39), #2d00ff);
  /* 그라데이션 효과 */
  -webkit-background-clip: text;
  color: transparent;
}

/* 설명 텍스트 스타일 */
.description {
  margin-left: 10px;
  font-size: 15px;
  color: white;
}

/* 페이지 이동 버튼들 스타일 */
.buttons {
  display: flex;
  flex-direction: row;
  /* 버튼을 양옆으로 배치 */
  gap: 20px;
  /* 버튼 사이의 간격 */
  margin-left: 20px;
  /* 버튼과 텍스트 사이 간격 */
}

.goToDocument-button,
.goToCommunity-button {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background-color: rgba(0, 0, 0, 0.8);
  /* 버튼 배경 색상 */
  color: #fff;
  border: 1px solid lightgrey;
  padding: 15px 20px;
  cursor: pointer;
  border-radius: 15px;
  font-size: 15px;
  width: 250px;
  height: 120px;
  transition: background-color 0.3s ease;
}

.goToDocument-button:hover,
.goToCommunity-button:hover {
  background-color: rgba(0, 255, 55, 0.233);
  /* 호버시 배경 색상 변화 */
}

/* 버튼 아이콘 스타일 */
.button-icon {
  width: 30px;
  height: 30px;
  margin-right: 15px;
  /* 아이콘과 텍스트 사이 간격 */
}

/* 푸터 스타일 - 배경 투명화 */
.footer-container {
  background-color: rgba(0, 0, 0, 0.5);
  /* 배경을 반투명하게 설정 */
  color: #9b9b9b;
  font-size: 13px;
  text-align: center;
  padding: 10px;
  position: fixed;
  width: 100%;
  bottom: 0;
}


/* ★★★ ... 로딩 말풍선 */
.loading-message {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 15px;
  border-radius: 18px;
  background-color: rgba(233, 233, 235, 0.8);
  color: black;
  font-style: italic;
  width: 50px;
}

.loading-message .dot {
  height: 10px;
  width: 10px;
  margin: 0 2px;
  background-color: black;
  border-radius: 50%;
  display: inline-block;
  opacity: 0;
  animation: loading-animation 1.5s infinite ease-in-out;
}

.loading-message .dot:nth-child(1) {
  animation-delay: 0s;
}

.loading-message .dot:nth-child(2) {
  animation-delay: 0.3s;
}

.loading-message .dot:nth-child(3) {
  animation-delay: 0.6s;
}

@keyframes loading-animation {
  0%, 80%, 100% {
    opacity: 0;
  }
  40% {
    opacity: 1;
  }
}

/* 선택된 파일명과 전송 버튼을 표시하기 위한 스타일 */
.selected-file {
  margin-right: 20px;
  text-align: right;
  color: white;
}

</style>
