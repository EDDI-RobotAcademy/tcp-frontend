<template>
    <v-container>
        <v-row>
            <v-col cols="12">
                <v-text-field v-model="title" label="제목" :rules="[v => v.length <= 30 || '제목은 최대 30글자까지 가능합니다.']" maxlength="30"/>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-textarea v-model="content" label="내용" auto-grow/>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" class="text-right">
                <v-btn class="ml-2" color="primary" @click="onSubmit">작성 완료</v-btn>
                <v-btn class="ml-1" color="error" @click="onCancel">취소</v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { mapActions } from 'vuex'

const communityModule = 'communityModule'
const accountModule = 'accountModule'

export default {
    data () {
        return {
            title: '',
            writer: '',
            content: ''
        }
    },
    methods: {
        ...mapActions(communityModule, ['requestCreateCommunityToDjango']),
        ...mapActions(accountModule, ['requestNicknameToDjango']),
        async onSubmit () {
            console.log('작성 완료 버튼 누름')

            if (this.title.length > 30) {
                alert('제목은 최대 30글자까지 가능합니다.')
                return
            }
            const nickname = await this.requestNicknameToDjango()
            console.log('nickname:', nickname)
            const payload = {
                title: this.title,
                writer: nickname,
                content: this.content,
            }

            console.log('payload check:', payload)

            const community = await this.requestCreateCommunityToDjango(payload)
            await this.$router.push({
                name: 'CommunityReadPage',
                params: { communityId: community.communityId.toString() }
            })
        },
        async onCancel () {
            console.log("취소 버튼 누름")
            this.$router.go(-1)
        }
    }
}
</script>
