namespace NodeJS {
  interface ProcessEnv {
    //application
    PORT: number;

    //DataBase
    DB_PORT: number;
    DB_NAME: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_HOST: string;

    //secrets
    COOKIE_SECRET: string;
    OTP_TOKEN_SECRET: string;
    ACCESS_TOKEN_SECRET: string;
    EMAIL_TOKEN_SECRET: string;
    Phone_TOKEN_SECRET: string;

    //Kavehnegar
    SEND_SMS_URL: string;

    //google
    GOOGLE_CLIENT_ID: string;
    GOOGLE_SECRET_ID: string;
  }
}
