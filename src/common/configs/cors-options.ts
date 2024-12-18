import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const corsDevOptions: CorsOptions = {
  origin: true,
  methods: 'GET,HEAD,POST,OPTIONS',
  allowedHeaders: ['Accept', 'Authorization', 'Content-Type', 'X-Requested-With'],
  credentials: true,
};

export const corsProdOptions: CorsOptions = {
  origin: ['http://localhost:3000'],
  methods: 'GET,HEAD,POST,OPTIONS',
  allowedHeaders: ['Accept', 'Authorization', 'Content-Type'],
  credentials: true,
};
