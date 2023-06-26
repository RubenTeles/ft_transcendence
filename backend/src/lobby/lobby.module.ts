import { Module } from '@nestjs/common';
import { LobbyService } from './lobby.service';
import { LobbyGateway } from './gateway/lobby.gateway';
import { PlayerModule } from '../player/player.module';

@Module({
	imports: [PlayerModule],
	providers: [LobbyService, LobbyGateway],
})
export class LobbyModule {}
