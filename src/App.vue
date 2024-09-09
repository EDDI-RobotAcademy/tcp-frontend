<template>
  <v-app>
    <navigation-menu-bar/>
    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import NavigationMenuBar from './navigationBar/NavigationMenuBar.vue'

export default defineComponent({
  components: { NavigationMenuBar },
  name: 'App',

  data () {
    return {
      //
    }
  },
})
</script>



<style>

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Reset CSS 적용 */
html, body, div, span, applet, object, iframe,
h1, h2, h3, h4, h5, h6, p, blockquote, pre,
a, abbr, acronym, address, big, cite, code,
del, dfn, em, img, ins, kbd, q, s, samp,
small, strike, strong, sub, sup, tt, var,
b, u, i, center,
dl, dt, dd, ol, ul, li,
fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td,
article, aside, canvas, details, embed,
figure, figcaption, footer, header, hgroup,
menu, nav, output, ruby, section, summary,
time, mark, audio, video {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 100%;  
  vertical-align: baseline;
}

/* HTML5 display-role reset for older browsers */
article, aside, details, figcaption, figure,
footer, header, hgroup, menu, nav, section {
  display: block;
}

body {
  line-height: 1;
}

table {
  border-collapse: collapse;
  border-spacing: 0;
}


input, textarea, button {
  font-family: inherit;
  font-size: inherit;
}

button {
  cursor: pointer;
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

/* Flexbox의 크로스 브라우징 지원 */
.container {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
}

/* 브라우저 간 글꼴 렌더링 차이를 최소화 */
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* markdown-it 관련 스타일 적용 */
.markdown-content {
  margin: 0px !important;  
  box-sizing: border-box !important;
  line-height: 1.5; 
}

.markdown-content ol,
.markdown-content ul {
  margin: 10px !important;
  line-height: 1.5;   
}

.markdown-content li {
  margin: 20px !important;
  line-height: 1.5;   
}

p.description {
    line-height: 1.5; 
}

</style>