import { createStore } from 'vuex'

import accountModule from '@/account/store/accountModule'
import authenticationModule from '@/authentication/store/authenticationModule'
import communityModule from '@/community/store/communityModule'
import googleAuthenticationModule from '@/googleAuthentication/store/googleAuthenticationModule'

export default createStore({
  state: {
  },
  getters: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    accountModule,
    authenticationModule,
    communityModule,
    googleAuthenticationModule,
  }
})
