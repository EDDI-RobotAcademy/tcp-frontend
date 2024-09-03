import { MutationTree } from "vuex";
import { DocumentState, Document } from "./states";
import {
    REQUEST_DOCUMENT_TO_DJANGO,
    REQUEST_DOCUMENT_LIST_TO_DJANGO,
    INCREMENT_DOCUMENT_VIEW_COUNT
} from "./mutation-types";

export interface DocumentMutations extends MutationTree<DocumentState> {
    [REQUEST_DOCUMENT_TO_DJANGO](state: DocumentState, receivedData: Document): void
    [REQUEST_DOCUMENT_LIST_TO_DJANGO](state: DocumentState, receivedData: Document[]): void
    [INCREMENT_DOCUMENT_VIEW_COUNT](state: DocumentState, newViewCount: number): void
}

const mutations: MutationTree<DocumentState> = {
    [REQUEST_DOCUMENT_TO_DJANGO](state: DocumentState, receivedData: Document): void {
        state.document = receivedData;
    },
    [REQUEST_DOCUMENT_LIST_TO_DJANGO](state: DocumentState, receivedData: Document[]): void {
        state.documents = receivedData;
    },
    // [INCREMENT_DOCUMENT_VIEW_COUNT](state: DocumentState, newViewCount: number): void {
    //     if (state.document) {
    //         state.document.viewCount = newViewCount;
    //     }
    // }
}

export default mutations as DocumentMutations;
