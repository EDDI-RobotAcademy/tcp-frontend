<template>
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
          <button v-if="isAuthenticated" class="goToDocument-button" @click="goToDocumentOriginList">
            <img :src="require('@/assets/images/fixed/icon-B.png')" class="button-icon">
            AI 논문 자료 구경하러<br>이동하기
          </button>
        </div>
      </div>

      <div class="prompt-container" @dragover.prevent @drop.prevent="handleDrop">
        <div class="chat-window">
          <div
            v-for="(message, index) in chatHistory"
            :key="index"
            :class="['message', message.type]"
            @contextmenu.prevent="handleRightClick($event, message.content)"
          >
            <img :src="message.type === 'user' ? userAvatar : aiAvatar" :alt="message.type + ' avatar'" class="avatar">
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

        <!-- 입력창을 항상 맨 아래에 위치시키기 -->
        <div class="input-area">
          <textarea v-if="isAuthenticated"
            v-model="userInput" 
            placeholder="메시지를 입력하세요..." 
            @keydown.enter.exact.prevent="handleEnterKey"  
            @keydown.shift.enter="handleShiftEnter"
            @input="adjustTextareaHeight"
            ref="messageInput"
          ></textarea>

          <textarea v-else
            v-model="userInput" 
            placeholder="로그인 후 이용하실 수 있습니다." 
            @keydown.enter.exact.prevent="handleEnterKey"  
            @keydown.shift.enter="handleShiftEnter"
            @input="adjustTextareaHeight"
            ref="messageInput"
            :disabled="true"
          ></textarea>

          <button @click="sendMessage" :class="{'button-disabled': !isAuthenticated}">전송</button>
          <!-- 파일 선택 버튼 추가 -->
          <input type="file" ref="fileInput" @change="handleFileSelect" style="display: none;" />
          <button @click="triggerFileSelect" :class="{'button-disabled': !isAuthenticated}">파일 선택</button>
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

    <!-- 우클릭 메뉴 -->
    <div
      v-if="showContextMenu"
      :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }"
      class="context-menu"
      @mouseleave="hideContextMenu"
    >
      <ul>
        <li @click="copyContent">답변내용 복사</li>
        <li @click="openModal">MY DOCUMENT에 저장</li>
      </ul>
    </div>

    <!-- 모달 컴포넌트 -->
    <v-dialog v-model="showModal" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">MY DOCUMENT에 저장</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field v-model="title" label="제목" :rules="[v => v.length <= 30 || '제목은 최대 30글자까지 가능합니다.']" maxlength="30"/>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-file-input
                  v-model="file"
                  label="논문 파일을 업로드하거나 Drag & Drop 하세요"
                  accept=".pdf,.doc,.docx"
                  prepend-icon="mdi-upload"
                  show-size
                  required
                ></v-file-input>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-textarea
                  v-model="content"
                  label="복사한 요약 내용"
                  rows="5"
                  auto-grow
                  clearable
                  counter
                  maxlength="5000"
                  placeholder="복사한 내용을 Crtl+V로 붙여넣기 하세요 (최대 5000자)"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-btn color="green" @click="submitDocument" style="text-justify: auto;">저장</v-btn>
          <v-btn text @click="showModal = false">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import userAvatarSrc from '@/assets/images/fixed/user-avatar.png'  // 사용자 아바타 이미지 경로
import aiAvatarSrc from '@/assets/images/fixed/ai-avatar.png'  // AI 아바타 이미지 경로
import router from "@/router";
import { mapActions, mapState } from "vuex";
import markdownIt from 'markdown-it'

const authenticationModule = "authenticationModule";
const googleAuthenticationModule = "googleAuthenticationModule";
const userInputModule = 'userInputModule'
const documentModule = 'documentModule'
const accountModule = 'accountModule'

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
      selectedFileName: null,  // 선택된 파일명을 저장하는 변수,

      showContextMenu: false,
      contextMenuX: 0,
      contextMenuY: 0,
      selectedContent: '',
      showModal: false,
      
      title: '',      // 모달 제목
      file: null,     // 모달 업로드 파일
      content: '',     // 모달 요약
      currentAIMessage: '',  // 현재 AI 메시지를 저장하는 변수
    };
  },
  computed: {
    ...mapState(authenticationModule, ["isAuthenticatedKakao"]),
    ...mapState(googleAuthenticationModule, ["isAuthenticatedGoogle"]),
    ...mapState(accountModule, ["loginType", "isAuthenticatedNormal"]),
    isAuthenticated() {
      return this.isAuthenticatedKakao || this.isAuthenticatedGoogle || this.isAuthenticatedNormal;
    }
  },
  methods: {
    ...mapActions(authenticationModule, ["requestKakaoLogoutToDjango"]),
    ...mapActions(googleAuthenticationModule, ["requestGoogleLogoutToDjango"]),
    ...mapActions(userInputModule, ['requestInferToFastAPI', 'requestInferedAnswerToFastAPI']),
    ...mapActions(documentModule, ['requestCreateDocumentToDjango']),
    ...mapActions(accountModule, ['requestNicknameToDjango']),

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
      router.push("/document/list");
    },

    chunkText(text, chunkSize) {
      const chunks = [];
      for (let i = 0; i < text.length; i += chunkSize) {
        chunks.push(text.substring(i, i + chunkSize));
      }
      return chunks;
    },
    
    async streamText(chunks) {
      this.currentAIMessage = '';  // 초기화
      let index = 0;
      const interval = setInterval(() => {
        if (index < chunks.length) {
          this.currentAIMessage += chunks[index];
          this.updateAIMessage();  // AI 메시지 업데이트 메소드 호출
          index++;
        } else {
          clearInterval(interval);
        }
      }, 10); // 10ms마다 조각 추가
    },

    updateAIMessage() {
      // chatHistory를 갱신하여 화면에 업데이트
      const lastIndex = this.chatHistory.length - 1;
      if (this.chatHistory[lastIndex] && this.chatHistory[lastIndex].type === 'ai') {
        this.chatHistory[lastIndex].content = this.currentAIMessage;
      } else {
        this.chatHistory.push({ type: 'ai', content: this.currentAIMessage });
      }
    },

    adjustTextareaHeight() {
      const textarea = this.$refs.messageInput;
      textarea.style.height = "auto";  // 높이를 자동으로 설정
      textarea.style.height = `${textarea.scrollHeight}px`;  // 내용에 따라 높이 설정
    },

    handleEnterKey(event) {
      if (!event.shiftKey) {
        // Shift 키가 눌리지 않은 경우에만 메시지 전송
        this.sendMessage();
      }
    },

    handleShiftEnter(event) {
      // 기본 줄바꿈 동작을 유지함으로써 커서가 줄바꿈되도록 함
      this.adjustTextareaHeight();  // 줄바꿈 후 높이 조정
    },

    async sendMessage(event) {
      if (!this.isAuthenticated) {
        // 로그인하지 않은 상태에서는 sendMessage 트리거 무시
        event.preventDefault();
        return;
      }

      if (this.userInput.trim() || this.selectedFile) {
        // 텍스트 메시지를 채팅 히스토리에 추가
        if (this.userInput.trim()) {
          this.chatHistory.push({ type: 'user', content: this.userInput });
          this.userInputMessage = this.userInput;
        }

        if (this.selectedFile) {
          localStorage.setItem("fileKey", this.selectedFileName)
        }

        this.userInput = '';
        this.adjustTextareaHeight();  // 전송 후 높이도 초기화
        this.isLoading = true;  // ... 로딩 상태 활성화
        const payload = { text: this.userInputMessage, fileKey: localStorage.getItem("fileKey"), file: this.selectedFile }

        // FastAPI로 사용자 입력 또는 파일 전송
        await this.requestInferToFastAPI(payload)
        this.selectedFile = null
        this.selectedFileName = null

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
            // this.chatHistory.push({ type: 'ai', content: response.generatedText });
          const chunks = this.chunkText(response.generatedText, 1); // 숫자는 청크 단위로 나눌 글자 수
          this.streamText(chunks);
        } else {
          console.log('서버에서 응답을 받지 못했습니다.');
        }
      }
    },

    triggerFileSelect(event) {
      // 로그인 상태를 확인합니다
      if (!this.isAuthenticated) {
        // 로그인하지 않은 상태에서는 파일 선택 창을 열지 않음
        event.preventDefault();  // 클릭 이벤트를 막아서 파일 선택 창이 열리지 않게 함
        return;
      }
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
    },

    handleRightClick(event, content) {
      event.preventDefault();
      this.selectedContent = content;

      // 말풍선의 DOM 요소를 가져오기
      const messageElement = event.currentTarget;
      const rect = messageElement.getBoundingClientRect();
      
      // 말풍선의 우측 중앙 위치 계산
      this.contextMenuX = rect.left / 2  // 말풍선의 우측
      this.contextMenuY = rect.top + (rect.height / 2);  // 말풍선의 중앙

      this.showContextMenu = true;
    },

    hideContextMenu() {
      this.showContextMenu = false;
    },

    // copyContent() {
    //   navigator.clipboard.writeText(this.selectedContent).then(() => {
    //     alert('답변 내용이 복사되었습니다.');
    //   });
    //   this.hideContextMenu();
    // },
    // HTTPS나 Local 환경에서만 Clipboard API가 작동해서 아래와 같이 수정
    copyContent() {
      try {
        // 임시 텍스트 영역 생성
        const textarea = document.createElement('textarea');
        textarea.value = this.selectedContent;
        document.body.appendChild(textarea);
        
        // 텍스트 영역 내용 선택
        textarea.select();
        textarea.setSelectionRange(0, 99999); // 선택 영역을 전체로 설정
        
        // 복사 명령 실행
        document.execCommand('copy');
        
        // 텍스트 영역 제거
        document.body.removeChild(textarea);
        
        alert('답변 내용이 복사되었습니다.');
      } catch (err) {
        alert('복사에 실패했습니다. 수동으로 복사해 주세요.');
      }
      
      this.hideContextMenu();
    },


    openModal() {
      this.showModal = true;
      this.hideContextMenu();
    },

    async submitDocument() {
      if (this.title.length > 30) {
        alert('제목은 최대 30글자까지 가능합니다.');
        return;
      }

      if (!this.file) {
        alert('원본 파일을 업로드해야 합니다.');
        return;
      }

      if (!this.content) {
        alert('복사한 요약 내용을 입력해야 합니다.');
        return;
      }

      const email = localStorage.getItem("email");
      const nickname = await this.requestNicknameToDjango(email);
      console.log('nickname:', nickname);

      try {
        const document = await this.requestCreateDocumentToDjango({
          title: this.title,
          writer: nickname,
          file: this.file,
          content: this.content // 추가된 content 필드
        });
        alert('문서가 성공적으로 저장되었습니다.');
        this.showModal = false;
      } catch (error) {
        console.error('문서 저장 실패:', error);
        alert('문서 저장에 실패했습니다.');
      }
    }
  }
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
  justify-content: flex-start;
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
  margin: 30px auto;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;  /* 입력창이 맨 아래로 고정되도록 설정 */
  min-height: 60vh;
  max-height: 90vh;
  overflow-y: auto;
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(1px);
  box-shadow: 0 0 15px 5px cyan, 0 0 25px 15px #2d00ff;
}

/* 채팅 창 */
.chat-window {
  flex-grow: 1;  /* 대화 내용이 영역을 채우도록 설정 */
  padding: 20px;
  overflow-y: auto;  /* 대화 내용이 많아지면 스크롤바 추가 */
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* 대화가 위에서부터 쌓이도록 설정 */
  background-color: transparent;
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
  max-width: 50%;  /* 말풍선의 최대 가로 너비를 50%로 제한 */
  background-color: rgba(255, 255, 255, 0.8);
}

.user .message-content {
  background-color: rgb(44, 44, 44);
  color: white;
  border-radius: 20px 20px 0px 20px;
  max-width: 100%;  /* 사용자 말풍선도 50%로 제한 */
}

.ai .message-content {
  background-color: lightgray;
  color: black;
  border-radius: 20px 20px 20px 0px;
  max-width: 100%;  /* AI 말풍선도 50%로 제한 */
}

/* 메시지 입력 영역 스타일 */
.input-area {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 10px;
  gap: 10px; /* 버튼과 입력창 사이의 간격 */
  height: auto; /* 고정 높이를 주지 않고, 내용에 따라 조절되도록 설정 */
  max-height: 80px; /* 입력 영역이 너무 커지지 않도록 최대 높이 설정 */
  margin-bottom: 0;  /* 아래 여백을 제거하여 파일명과 붙게 설정 */
}

textarea {
  flex-grow: 1;
  border: none;
  padding: 15px;
  resize: vertical;  /* 크기 조정 기능을 활성화하여 높이 조정 가능하도록 설정 */
  overflow: auto;  /* 내용에 따라 스크롤바 표시 */
  border-radius: 10px;
  box-sizing: border-box;
  font-size: 15px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;  
  height: auto; /* 고정 높이를 제거하고 자동 조정 */
  max-height: 100px; /* 최대 높이 제한 */
}

/* 전송 버튼 스타일 */
button {
  background-color: white;
  color: black;
  border: none;
  padding: 10px;
  margin: 0; /* 버튼들 사이의 불필요한 여백 제거 */
  cursor: pointer;
  border-radius: 20px;
  font-size: 16px;
}

button + button {
  margin-left: 10px; /* 파일 선택 버튼과 전송 버튼 사이의 간격 */
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
  color: #ffffff;
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
  margin: 10px;  /* 너무 붙지 않게 약간의 여백 설정 */
  text-align: right;  /* 파일명을 오른쪽 정렬 */
  color: rgb(0, 255, 26);
  white-space: nowrap;  /* 파일명이 한 줄로 표시되도록 설정 */
  overflow: hidden;  /* 넘치는 텍스트는 잘리게 설정 */
  text-overflow: ellipsis;  /* 넘치는 부분은 말줄임표로 표시 */
  max-width: 100%;  /* 최대 너비를 100%로 설정하여 영역 내에서만 표시 */
  max-height: fit-content;
}

/* 컨텍스트 메뉴 스타일 */
.context-menu {
  position: absolute;
  background-color: white;
  border: 1px solid #ccc;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  white-space: nowrap;  /* 메뉴 아이템들이 한 줄로 표시되도록 설정 */
}
.context-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.context-menu li {
  padding: 10px;
  cursor: pointer;
}
.context-menu li:hover {
  background-color: #f0f0f0;
}


/* 모달창 관련 스타일 */
.context-menu {
  position: absolute;
  background-color: rgba(2, 74, 27, 0.479); /* 초록색 투명 */
  color: rgb(0, 255, 0);
  border: 2px solid rgb(0, 255, 0);
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
.context-menu:hover {
  background-color: rgba(0, 255, 55, 0.25);
}
.v-dialog__content {
  background-color: rgba(255, 255, 255, 1); 
}
.v-card {
  background-color: rgba(255, 255, 255, 1); 
}
/* 모달이 활성화되었을 때의 배경 블러 효과 */
.v-overlay__scrim::after {
  backdrop-filter: blur(200px); /* 블러 강도를 200px로 설정 */
  background-color: rgb(0, 0, 0); /* 반투명한 흰색 배경 */
  position: absolute;
  width: 100%;
  height: 100%;
}
/* 모달이 활성화된 상태에서의 전체 화면 스타일 */
.v-dialog__content--active .v-dialog {
  backdrop-filter: inherit; 
}
/* 비활성화된 버튼 스타일 */
.button-disabled {
  opacity: 0.5;  /* 버튼을 반투명하게 만듭니다 */
  cursor: not-allowed;  /* 클릭할 수 없음을 표시합니다 */
}

</style>
