interface Env {
    mode: string | undefined
    api: {
        MAIN_API_URL: string | undefined
        AI_BASE_URL: string | undefined
    },
    s3: {
        AWS_REGION: string | undefined
        AWS_S3_IDENTITY_POOL_ID: string | undefined
    }
}

// .env 파일을 통해 설정을 읽어옵니다.
const env: Env = {
    mode: process.env.NODE_ENV,
    api: {
        MAIN_API_URL: process.env.VUE_APP_BASE_URL,
        AI_BASE_URL: process.env.VUE_APP_AI_BASE_URL,
    },
    s3: {
        AWS_REGION: process.env.VUE_APP_AWS_REGION,
        AWS_S3_IDENTITY_POOL_ID: process.env.VUE_APP_AWS_S3_IDENTITY_POOL_ID,
    }
}

if (!env.s3.AWS_REGION || !env.s3.AWS_S3_IDENTITY_POOL_ID){
    throw new Error("Missing requried Enviroment Variables for AWS configuration");
}

export default env