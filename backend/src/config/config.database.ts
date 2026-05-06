import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getConfigDB = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'example_db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,

  extra: {
    application_name: 'nestjs-app',
  },
});
