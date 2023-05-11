import { Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';
import { JwtGuard } from '../auth/guard';

@UseGuards(JwtGuard)
@Controller('friendship')
export class FriendshipController {
	constructor(private friendshipService: FriendshipService) {}

	@Post('accept/:id')
	acceptFriendRequest(@GetUser() user: User, @Param('id', ParseIntPipe) friend: number) {
		return (this.friendshipService.acceptFriendRequest(user.id, friend));
	}

	@Post('reject/:id')
	rejectFriendRequest(@GetUser() user: User, @Param('id', ParseIntPipe) friend: number) {
		return (this.friendshipService.rejectFriendRequest(user.id, friend));
	}

	@Post('send/:id')
	sendFriendRequest(@GetUser() user: User, @Param('id', ParseIntPipe) friend: number) {
		return (this.friendshipService.sendFriendRequest(user, friend));
	}

	@Post('cancel/:id')
	cancelFriendRequest(@GetUser() user: User, @Param('id', ParseIntPipe) friend: number) {
		return (this.friendshipService.cancelFriendRequest(user.id, friend));
	}

	@Post('unfriend/:id')
	deleteFriend(@GetUser() user: User, @Param('id', ParseIntPipe) friend: number) {
		return (this.friendshipService.deleteFriend(user.id, friend));
	}

	@Get('friends')
	getFriends(@GetUser() user: User) {
		return (this.friendshipService.getFriends(user.id));
	}

	@Get('requests')
	getFriendRequests(@GetUser() user: User) {
		return (this.friendshipService.getFriendRequests(user.id));
	}
}
