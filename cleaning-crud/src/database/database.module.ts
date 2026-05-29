import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../modules/products/product.entity';
import { DatabaseInitializerService } from './database-initializer.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'database.sqlite',
      entities: [ProductEntity],
      synchronize: true,
      logging: false,
    }),
    TypeOrmModule.forFeature([ProductEntity]),
  ],
  providers: [DatabaseInitializerService],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}


