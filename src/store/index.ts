import { createStore } from 'vuex'

import accountModule from '@/account/store/accountModule'
import authenticationModule from '@/authentication/store/authenticationModule'
import communityModule from '@/community/store/communityModule'

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
  }
})
