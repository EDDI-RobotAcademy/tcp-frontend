export interface CommunityState {
    communitys: Community[]
    community: Community | null
}

export interface Community {
    communityId: number
    title: string
    writer: string
    content: string
    register_date: string
    update_date: string
    viewCount: number
}

const state: CommunityState = {
    communitys: [],
    community: null
}

export default state