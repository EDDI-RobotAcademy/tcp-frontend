export interface Account {
    nickname: string,
}

export interface AccountState {
    loginType: string
    email: string
    account: Account | null
}

const state: AccountState = {
    loginType: '',
    email: '',
    account: null
}

export default state