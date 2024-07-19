export interface BoardState {
    boards: Board[]
    board: Board | null
}

export interface Board {
    boardId: number
    title: string
    writer: string
    content: string
    regDate: string
    updDate: string
}

const state: BoardState = {
    boards: [],
    board: null
}

export default state