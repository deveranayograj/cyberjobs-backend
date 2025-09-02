import { Module } from '@nestjs/common';
import { BlacklistService } from './blacklist.service';

@Module({
    providers: [BlacklistService],
    exports: [BlacklistService], // <-- Make it available outside
})
export class BlacklistModule { }
