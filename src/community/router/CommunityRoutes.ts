import CommunityRegisterPage from "@/community/pages/register/CommunityRegisterPage.vue";
import CommunityListPage from "@/community/pages/list/CommunityListPage.vue";
import CommunityReadPage from "@/community/pages/read/CommunityReadPage.vue";
import CommunityModifyPage from "@/community/pages/modify/CommunityModifyPage.vue";


const CommunityRoutes = [
    {
        path: '/community/register',
        name: 'CommunityRegisterPage',
        component: CommunityRegisterPage
    },
    {
        path: '/community/list',
        name: 'CommunityListPage',
        component: CommunityListPage
    },
    {
        path: '/community/read/:communityId',
        name: 'CommunityReadPage',
        components: {
            default: CommunityReadPage,
        },
        props: {
            default: true,
        }
    },
    {
        path: '/community/modify/:communityId',
        name: 'CommunityModifyPage',
        components: {
            default: CommunityModifyPage,
        },
        props: {
            default: true
        }
    },
]

export default CommunityRoutes;