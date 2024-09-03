<template>
    <v-container style="margin: 5% 50px 0px 50px;">
        <v-row>
            <v-col cols="12">
                <v-text-field v-model="title" label="제목" :rules="[v => v.length <= 30 || '제목은 최대 30글자까지 가능합니다.']" maxlength="30"/>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <!-- 파일 드래그 앤 드롭 또는 클릭하여 업로드 -->
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
        <!-- 여기에 content 필드를 추가 -->
        <v-row>
            <v-col cols="12">
                <v-textarea
                    v-model="content"
                    label="내용"
                    rows="5"
                    auto-grow
                    clearable
                    counter
                    maxlength="5000"
                    placeholder="문서 내용을 입력하세요 (최대 5000자)"
                ></v-textarea>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" class="text-right">
                <v-btn class="ml-2" color="black" @click="onSubmit">논문 등록 완료</v-btn>
                <v-btn class="ml-1" color="error" @click="onCancel">취소</v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { mapActions, mapState } from 'vuex'

const documentModule = 'documentModule'
const accountModule = 'accountModule'

export default {
    data () {
        return {
            title: '',
            writer: '',
            file: null,  // 파일만 처리
            content: ''  // 추가된 content 필드
        }
    },
    computed: {
        ...mapState(accountModule, ["email"]),
    },
    methods: {
        ...mapActions(documentModule, ['requestCreateDocumentToDjango']),
        ...mapActions(accountModule, ['requestNicknameToDjango']),
        async onSubmit () {
            console.log('작성 완료 버튼 누름')

            if (this.title.length > 30) {
                alert('제목은 최대 30글자까지 가능합니다.')
                return
            }

            if (!this.file) {
                alert('파일을 업로드해야 합니다.')
                return
            }

            if (!this.content) {
                alert('내용을 입력해야 합니다.')
                return
            }

            const email = localStorage.getItem("email")
            const nickname = await this.requestNicknameToDjango(email)
            console.log('nickname:', nickname)

            try {
                const document = await this.requestCreateDocumentToDjango({
                    title: this.title,
                    writer: nickname,
                    file: this.file,
                    content: this.content // 추가된 content 필드
                });
                alert('논문 파일이 성공적으로 등록되었습니다.')
                await this.$router.push({ name: 'DocumentListPage' });
            } catch (error) {
                console.error('문서파일 업로드 실패:', error);
                alert('논문 파일 등록이 실패했습니다.')
            }
        },

        async onCancel () {
            console.log("취소 버튼 누름")
            this.$router.go(-1)
        }
    }
}
</script>

<style scoped>

:deep(.v-input__prepend) {
    padding: 15px;
    margin: 0px;
    color: rgb(255, 255, 255);
    background-color: rgb(0, 0, 0);
}
</style>
