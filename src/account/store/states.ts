export interface Account {
    nickname: string,
}

export interface AccountState {
    loginType: string
    email: string
    isauthenticatedNormal: boolean
    account: Account | null
}

const state: AccountState = {
    loginType: '',
    email: '',
    isauthenticatedNormal: false,
    account: null
}

export default state