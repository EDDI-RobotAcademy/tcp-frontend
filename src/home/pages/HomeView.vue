<template>
  <div class="home-container">
    <div class="nav-container">
      <!-- 네비게이션 바 내용 -->
    </div>
        
    <div class="background-image">
      
      <div class="text-container">
        <div style="margin-top: 20px; margin-bottom: 20px"></div>
        <p class="subtitle">"Text Chat Prompt for TCP SINCE 2024"</p>
        <div style="margin-bottom: 10px"></div>
        <p class="description">
          TCP는 양질의 논문 컨텐츠로 AI 연구와 학습의 즐거움을 <br />
          보다 많은 사람들과 공유할 수 있도록 최선을 다하겠습니다.
        </p>
        
      </div>
      
      <div class="prompt-container">
        <div class="chat-window">
          <div v-for="(message, index) in chatHistory" :key="index" 
              :class="['message', message.type]">
            <img :src="message.type === 'user' ? userAvatar : aiAvatar" 
                :alt="message.type + ' avatar'" class="avatar">
            <div class="message-content">{{ message.content }}</div>
          </div>
        </div>
        <div class="input-area">
          <textarea v-model="userInput" placeholder="메시지를 입력하세요..." 
                    @keyup.enter="sendMessage"></textarea>
          <button @click="sendMessage">전송</button>
        </div>
      </div>

      <div class="buttons">          
        <button class="goToCommunity-button" @click="goToCommunityList">
          AI 논문 커뮤니티 이동
        </button>
        <button class="goToProduct-button" @click="goToProductList">
          AI 논문 자료 구경하기
        </button>        
      </div>

      
    </div>

    <div class="footer-container">
        <p class="reserved-info">2024 Text Chat Prompt Korea LLC. All Rights Reserved.</p>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import imageSrc from "@/assets/images/homeImages/image1.jpg";
import userAvatarSrc from '@/assets/images/fixed/user-avatar.png'  // 사용자 아바타 이미지 경로
import aiAvatarSrc from '@/assets/images/fixed/ai-avatar.png'  // AI 아바타 이미지 경로
import router from "@/router";
import { mapActions, mapState } from "vuex";
const authenticationModule = "authenticationModule";

export default defineComponent({
  name: "HomeView",
  data() {
    return {
      imageSrc,
      userInput: '',
      chatHistory: [
        { type: 'ai', content: '안녕하세요! 어떤 도움이 필요하신가요?' }
      ],
      userAvatar: userAvatarSrc,
      aiAvatar: aiAvatarSrc
    };
  },
  computed: {
    ...mapState(authenticationModule, ["isAuthenticated"]),
  },
  methods: {
    ...mapActions(authenticationModule, ["requestLogoutToDjango"]),

    goToProductList() {
      router.push("/product/list");
    },
    goToCommunityList() {
      router.push("/community/list");
    },

    sendMessage() {
      if (this.userInput.trim()) {
        this.chatHistory.push({ type: 'user', content: this.userInput });
        this.chatHistory.push({ type: 'ai', content: 'AI 응답을 여기에 추가하세요.' });
        this.userInput = '';
      }
    }
  },
});
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow: hidden;
}

.nav-container {
  /* 네비게이션 바 스타일 */
}

.background-image {
  flex: 1;
  background-image: url('@/assets/images/homeImages/image2.jpg'); /* 적절한 경로로 변경 */
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.prompt-container {
  width: 90%;  
  max-width: 1500px; /* 최대 너비 설정 */
  margin: 20px auto;
  border-radius: 8px;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.3); /* 반투명한 흰색 배경 */
  backdrop-filter: blur(5px); /* 배경 흐림 효과 */  
}

.chat-window {
  height: 600px;
  overflow-y: auto;
  padding: 20px;
  background-color: transparent; /* 배경을 투명하게 */
}

.message {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
  max-width: 70%; /* 메시지 최대 너비를 줄임 */
}

.user {
  margin-left: auto;
  flex-direction: row-reverse;
}

.ai {
  margin-right: auto;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin: 0 10px; /* 아바타 좌우 여백 추가 */
}

/* 메시지 스타일 수정 */
.message-content {
  padding: 10px 15px;
  border-radius: 18px;
  max-width: calc(100% - 60px); /* 아바타 크기를 고려한 최대 너비 */
  background-color: rgba(255, 255, 255, 0.8); /* 메시지 배경을 약간 투명하게 */
}

.user .message-content {
  background-color: rgba(0, 0, 0, 0.8); /* 사용자 메시지 배경 */
  color: white;
}

.ai .message-content {
  background-color: rgba(233, 233, 235, 0.8); /* AI 메시지 배경 */
  color: black;
}

.input-area {
  display: flex;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.8); /* 입력 영역 배경을 약간 투명하게 */
}

textarea {
  flex-grow: 1;
  border: none;
  padding: 10px;
  resize: none;
  height: 40px;
}

/* 전송 버튼 */
button {
  background-color: black;
  color: white;
  border: none;
  padding: 10px 20px;
  margin-left: 10px;
  cursor: pointer;
  border-radius: 5px;
}

.text-container {
  margin-top: 20px;
  text-align: center;
  width: 100%;
  max-width: 800px;
}

.subtitle {
  font-size: 35px;
  font-weight: bold;
  background: linear-gradient(to right, hotpink, aqua);
  -webkit-background-clip: text;
  color: transparent;
}

.title {
  font-size: 30px;
  font-weight: bold;
  margin: 10px 0;
}

.description {
  font-size: 18px;
  color: white;
}

/* .buttons {
  margin: 0px;
} */

.goToProduct-button,
.goToCommunity-button,
.goToReview-button {
  background-color: rgba(255, 0, 221, 0.486);
  color: #fff;
  border: none;
  padding: 10px 20px;
  margin-top: 0px;
  cursor: pointer;
  border-radius: 10px;
  font-size: 20px;
  width: 300px;
}

.goToProduct-button:hover,
.goToCommunity-button:hover,
.goToReview-button:hover {
  background-color: rgba(0, 255, 55, 0.233);
  
}

.footer-container {
  background-color: #000000;
  color: #9b9b9b;
  font-size: 13px;
  text-align: center;
  padding: 10px;
  position: fixed;
  width: 100%;
  bottom: 0;
}
</style>
