export interface Account {
    nickname: string,
}

export interface AccountState {
    isLoggedIn: boolean
    account: Account | null
}

const state: AccountState = {
    isLoggedIn: false,
    account: null
}

export default state