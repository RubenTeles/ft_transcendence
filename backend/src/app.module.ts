import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { FriendshipService } from './friendship/friendship.service';
import { FriendshipController } from './friendship/friendship.controller';
import { FriendshipModule } from './friendship/friendship.module';
import { GameController } from './game/game.controller';
import { GameService } from './game/game.service';
import { GameModule } from './game/game.module';
import { ChatModule } from './chat/chat.module';
import { SocketService } from './socket/socket.service';
import { LobbyService } from './lobby/lobby.service';
import { LobbyGateway } from './lobby/lobby.gateway';
import { LobbyModule } from './lobby/lobby.module';
import { PlayerService } from './player/player.service';
import { PlayerModule } from './player/player.module';

@Module({
	imports: [
		AuthModule,
		UserModule,
		PrismaModule,
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		FriendshipModule,
		GameModule,
		ChatModule,
		LobbyModule,
		PlayerModule,
	],
	controllers: [AppController, FriendshipController, GameController],
	providers: [
		AppService,
		FriendshipService,
		GameService,
		SocketService,
		LobbyService,
		PlayerService
	],
})
export class AppModule {}
