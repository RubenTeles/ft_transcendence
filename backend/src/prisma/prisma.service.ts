import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChannelType, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
	constructor(config: ConfigService) {
		super({
			datasources: {
				db: {
					url: config.get('DATABASE_URL'),
				},
			},
		});
	}

    async onModuleInit() {
		await this.setupDb();
	}

    // On startup
    async setupDb() {
		const globalChannelName = 'global';

		const existingGlobalChannel = await this.channel.findUnique({
			where: { name: globalChannelName },
		});

		if (!existingGlobalChannel) {
			await this.channel.create({
				data: {
                    id: 1,
					name: globalChannelName,
					type: ChannelType.PUBLIC,
				},
			});
		}
	}

    // When shutting down
	cleanDb() {
		return (this.$transaction([
            // friend requests
            this.friendRequest.deleteMany(),

            // channel
            this.channelUser.deleteMany(),
            this.channel.deleteMany(),

            // user
			this.user.deleteMany(),
		]));
	}
}
