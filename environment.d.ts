type EnvironmentVariables = {
  // Server
  PORT: number;
  NODE_ENV: string;

  // Jwt
  JWT_ACCESS_TOKEN_SECRET: string;
  JWT_REFRESH_TOKEN_SECRET: string;
  JWT_ACCESS_TOKEN_EXPIRES_IN: string;
  JWT_REFRESH_TOKEN_EXPIRES_IN: string;
  TWO_FACTOR_AUTHENTICATION_APP_NAME: string;

  // Github
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  GITHUB_CALLBACK_URL?: string;

  // Google
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_CALLBACK_URL?: string;

  // Email
  SMTP_HOST?: string;
  SMTP_USER?: string;
  SMTP_PORT?: string;
  SMTP_PASSWORD?: string;

  // Redis
  REDIS_USER: string;
  REDIS_HOST: string;
  REDIS_PASSWORD: string;
  REDIS_PORT: number;
};

declare namespace NodeJS {
  export interface ProcessEnv extends EnvironmentVariables {}
}
