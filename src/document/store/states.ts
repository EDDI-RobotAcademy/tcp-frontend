export interface DocumentState {
    documents: Document[]
    document: Document | null
}

export interface Document {
    documentId: number       // models.py의 documentId
    title: string            // models.py의 title
    writer: string           // models.py의 writer
    file: string             // 파일의 URL을 저장하기 위해 string으로 정의
    content: string          // models.py의 content (TextField)
    regDate: string          // models.py의 regDate (DateTimeField)
    updDate: string          // models.py의 updDate (DateTimeField)
}

const state: DocumentState = {
    documents: [],
    document: null
}

export default state
