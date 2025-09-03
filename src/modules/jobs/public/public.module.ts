import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { PublicRepository } from './public.repository';
import { PrismaService } from '@prisma/prisma.service';

@Module({
    controllers: [PublicController],
    providers: [PublicService, PublicRepository, PrismaService],
    exports: [PublicService],
})
export class PublicModule { }
