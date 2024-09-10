import DocumentListPage from "@/document/pages/list/DocumentListPage.vue";
import DocumentReadPage from "@/document/pages/read/DocumentReadPage.vue";
import DocumentRegisterPage from "@/document/pages/register/DocumentRegisterPage.vue";
import DocumentModifyPage from "@/document/pages/modify/DocumentModifyPage.vue";

const DocumentRoutes = [
    {
        path: '/document/list',
        name: 'DocumentListPage',
        component: DocumentListPage
    },
    {
        path: '/document/read/:documentId',
        name: 'DocumentReadPage',
        components: {
            default: DocumentReadPage,
        },
        props: {
            default: true,
        }
    },
    {
        path: '/document/register',
        name: 'DocumentRegisterPage',
        component: DocumentRegisterPage
    },
    {
        path: '/document/modify/:documentId',
        name: 'DocumentModifyPage',
        components: {
            default: DocumentModifyPage,
        },
        props: {
            default: true
        }
    }, 
    
]

export default DocumentRoutes;