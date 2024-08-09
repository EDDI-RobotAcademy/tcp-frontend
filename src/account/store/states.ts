export interface Account {
    nickname: string,
}

export interface AccountState {
    loginType: string
    account: Account | null
}

const state: AccountState = {
    loginType: '',
    account: null
}

export default state