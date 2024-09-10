import { MutationTree } from "vuex";
import { CommunityState, Community } from "./states";
import {
    REQUEST_COMMUNITY_TO_DJANGO,
    REQUEST_COMMUNITY_LIST_TO_DJANGO,
    INCREMENT_COMMUNITY_VIEW_COUNT
} from "./mutation-types";

export interface CommunityMutations extends MutationTree<CommunityState> {
    [REQUEST_COMMUNITY_TO_DJANGO](state: CommunityState, receivedData: Community): void
    [REQUEST_COMMUNITY_LIST_TO_DJANGO](state: CommunityState, receivedData: Community[]): void
    [INCREMENT_COMMUNITY_VIEW_COUNT](state: CommunityState, newViewCount: number): void
}

const mutations: MutationTree<CommunityState> = {
    [REQUEST_COMMUNITY_TO_DJANGO](state: CommunityState, receivedData: Community): void {
        state.community = receivedData;
    },
    [REQUEST_COMMUNITY_LIST_TO_DJANGO](state: CommunityState, receivedData: Community[]): void {
        state.communitys = receivedData;
    },
    [INCREMENT_COMMUNITY_VIEW_COUNT](state: CommunityState, newViewCount: number): void {
        if (state.community) {
            state.community.viewCount = newViewCount;
        }
    }
}

export default mutations as CommunityMutations;
