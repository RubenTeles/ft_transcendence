<template>
  <link rel="preconnect" href="https://fonts.gstatic.com" />
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
  <div class="box" href>
    <canvas id="canvas1"></canvas>
    <button id="buttonLeave" class="button">Leave</button>
</div>

</template>

<script setup lang="ts">
import { GamePong, TablePong, Status } from "@/game/ping_pong";
import { onMounted, onUnmounted, ref } from "vue";
import { type gameRequest, type updatePlayer, type updateBall, type gamePoint, type gameEnd, type GameStart } from "@/game/ping_pong/SocketInterface";
import { userStore, type GAME } from "@/stores/userStore";
import { socketClass } from "@/socket/SocketClass";

import avatar_marvin from "@/assets/images/pingpong/marvin.jpg";
import Router from "@/router";

const props = defineProps({
  objectId: String,
});

const status = ref(Status.Waiting);

let socket = socketClass.getGameSocket();

const frameRate = 60; // Set the desired frame rate
let lastTime = performance.now();
let accumulatedTime = 0;
const frameTime = 1000 / frameRate;

onMounted(function () {
	// if (socket == undefined) {
    //     socket = socketClass.getGameSocket();
	// 	// console.log("socket is undefined");
	// 	// Router.push('/lobby');
	// 	// return;
	// }
  const canvas = document.getElementById("canvas1") as HTMLCanvasElement;
  const button = document.getElementById("buttonLeave") as HTMLButtonElement;;
  const ctx: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;
  canvas.width = 1000;
  canvas.height = 750;

  const user = userStore().user;
  if (socket == undefined) {
		//console.log("socket is undefined");
		socketClass.setGameSocket({
		  query: {
			  userId: user.id,
			}
		});
		socket = socketClass.getGameSocket();
  }
	socket.on("error", (errorMessage: string) => {
		if (errorMessage.includes("Game does not exist")) {
			//console.log("Game does not exist");
			Router.push(`/lobby`);
			socket.disconnect();
		}
	})
  socket.emit("entry_game", {
    objectId: props.objectId,
	  userId: user.id, 
    nickname: user.nickname,
    avatar: user.image,
    color: user.infoPong.color,
    skin: user.infoPong.skin.default.paddle,
  });

  //console.log("pros: ", props);
  
  const tableBoard = new TablePong(canvas.width, canvas.height, "DarkSlateBlue", "#1e8c2f");
  const game = new GamePong(canvas, canvas.width, canvas.height - 228, 164, ctx, props as gameRequest, tableBoard);
  //console.log(props);

  
  //Resize Button
  function updateButtonSizeAndPosition() {
    const bodyWidth = document.body.clientWidth;
    const bodyHeight = document.body.clientHeight;

    const canvasWidth = Math.min(bodyWidth, 1000);
    const canvasHeight = Math.min(bodyHeight, 750);

    const percentageWidth = canvasWidth / 1000 ;
    const percentageHeight = canvasHeight / 750;
    const percentage = percentageWidth <= percentageHeight ? percentageWidth : percentageHeight;

    if (game.status == Status.Finish)
    {
      button.style.width = `${290 * percentage}px`;
      button.style.height = `${60 * percentage}px`;
      button.style.top = `${610.5 * percentage}px`;
    }
    else
    {
      button.style.width = `${120 * percentage}px`;
      button.style.height = `${30 * percentage}px`;
      button.style.top = `${10.5 * percentage}px`;
    }
    
    button.style.right = `${5 * percentage}px`;
    button.style.border = `${5 * percentage}px solid black`;
    button.style.fontSize = `${1 * percentage}rem`;
    //Canva Border
    canvas.style.border =  `${5 * percentage}px solid black`;
  }

  function leaveTheGame() {
    const isgetall = (game.cur.exp == game.endGame.exp && game.cur.money == game.endGame.money && game.cur.watchers == game.endGame.watchers);

    if (game.status == Status.Finish && !isgetall)
    {
      game.cur.exp = game.endGame.exp;
      game.cur.money = game.endGame.money;
      game.cur.watchers = game.endGame.watchers;
    }
    else
    {
      Router.push(`/lobby`);
      game?.audio("music_stop");
      socket?.disconnect();
    }
  }

  updateButtonSizeAndPosition();
  window.addEventListener('resize', updateButtonSizeAndPosition);
  button.addEventListener("click", leaveTheGame);

  socket.on("start_game", (e: GameStart) => {
    //console.log("Start:", e);
    //console.log(game);
    game.audio("music_play");

    game.maxScore = e.data.maxScore;
    game.table.color = e.data.table;
    game.table.skin.src = e.data.tableSkin ? e.data.tableSkin : "";

    //Player 1
    game.player1.id = e.player1.id;
    game.player1.nickname = e.player1.nickname ? e.player1.nickname : game.player1.nickname;
    game.player1.color = e.player1.color;
    game.player1.avatar.src = e.player1.avatar ? e.player1.avatar : game.player1.avatar.src;

    //Player 2
    game.player2.id = e.player2.id;
    game.player2.nickname =  e.player2.nickname ?  e.player2.nickname : game.player1.nickname;;
    game.player2.color =  e.player2.color;
    game.player2.avatar.src =  e.player2.avatar ?  e.player2.avatar : game.player2.avatar.src;

    if (game.player2.nickname == "Marvin" && e.player2.avatar == "marvin") game.player2.avatar.src = avatar_marvin;

    e.player1.skin ? game.player1.updateSkin(e.player1.skin) : "";
    e.player2.skin ? game.player2.updateSkin(e.player2.skin) : "";

    game.status = e.status;
    status.value = e.status;

    if (e.player === 1) {
      game.playerNumber = 1;
    } else if (e.player === 2) {
      game.playerNumber = 2;
    }
    else {
      game.watchersNumber = e.watchers;
    }
  });

  socket.on("game_update_status", (status: any) => {
    if (game.status != Status.Finish) {
      game.updateStatus(status);
    }
  });

  socket.on("game_counting", (seconds: any) => {
    if (game.status == Status.Starting) {
      game.counting = seconds;

      if (seconds == 4) game.audio("counting");
    }
  });

  socket.on("game_update_player", (e: updatePlayer) => {
    if (e.playerNumber === 1) game.player1.updatePlayer(e.x, e.y, e.score);
    else game.player2.updatePlayer(e.x, e.y, e.score);
  });

  socket.on("game_update_ball", (e: updateBall) => {
    game.ball.updateBall(e.x, e.y, e.dir);
  });
  
  socket.on("game_update_point", (e: gamePoint) => {
    if (game.status == Status.InGame) {
      game.updateStatus(Status.Starting);
      if (e.playerNumber == 1) game.player1.point(e.score);
      else game.player2.point(e.score);
    }
  });

  socket.on("game_sound", (e: any) => {
    game.audio(e.sound);
  });

  socket.on("game_view", (e: number) => {
    game.updateWatchers(e);
  });

  socket.on("end_game", (e: gameEnd) => {
    status.value = Status.Finish;
    game.updateStatus(Status.Finish);
    //console.log(e);
    game.endGame = e;

    //Buton Leave
    button.style.backgroundColor = 'yellow';
    button.style.color = 'black';
    button.textContent = "Go Back";
    updateButtonSizeAndPosition();

    //Animation
    canvas.addEventListener("click", (event) => game.handleClick(event, game));

    //Add info in storage
    if (game.playerNumber == 1 || game.playerNumber == 2) {

      user.money += e.money;
      user.infoPong.xp += e.exp;

      //Up Level!
      while (user.infoPong.xp >= user.infoPong.level * 200)
      {
        user.infoPong.xp -= user.infoPong.level * 100;
		    user.infoPong.level += 1;
      }
    
      const player_1 = game.playerNumber == 1 ? game.player1 : game.player2;
      const player_2 = player_1 == game.player1  ? game.player2 : game.player1;

      const history_game: GAME = {
        winnerId: e.gameResults.winnerId,
        winnerNickname: e.gameResults.winnerName,
        winnerScore: e.gameResults.winnerScore,
        loserId: e.gameResults.loserId,
        loserNickname: e.gameResults.loserName,
        loserScore: e.gameResults.loserScore,
        gameType: "PUBLIC",
        id: "0",
        players: [],
      }
      
      const player1_historic: {
        id: number;
        nickname: string;
        image: string;
      } = {
        id: player_1.id,
        nickname: player_1.nickname,
        image: player_1.avatar.src,
      };

      const player2_historic: {
        id: number;
        nickname: string;
        image: string;
      } = {
        id: player_2.id,
        nickname: player_2.nickname,
        image: player_2.avatar.src,
      };
      history_game.players.push(player1_historic);
      history_game.players.push(player2_historic);

      user.infoPong.historic.unshift(history_game as never);

      game.animation_points();
    }

    game.audio("music_stop");
  });

  onUnmounted(() => {
    socket.off("start_game");
    socket.off("game_update_status");
    socket.off("game_counting");
    socket.off("game_update_player");
    socket.off("game_update_ball");
    socket.off("game_update_point");
    socket.off("game_sound");
    socket.off("game_view");
    socket.off("end_game");
    game?.audio("music_stop");
    socket?.disconnect();
	socketClass.clearGameSocket();
    window.removeEventListener('resize', updateButtonSizeAndPosition);
    button.removeEventListener('click', leaveTheGame);

    if ((game.playerNumber == 1 || game.playerNumber == 2) && game.status != Status.Finish)
    {
      const player_1 = game.playerNumber == 1 ? game.player1 : game.player2;
      const player_2 = player_1 == game.player1  ? game.player2 : game.player1;

      const history_game: GAME = {
        winnerId: player_2.id,
        winnerNickname: player_2.nickname,
        winnerScore: game.maxScore,
        loserId: player_1.id,
        loserNickname: player_1.nickname,
        loserScore: player_1.score,
        gameType: "PUBLIC",
        id: "0",
        players: [],
      }
      
      const player1_historic: {
        id: number;
        nickname: string;
        image: string;
      } = {
        id: game.player1.id,
        nickname: game.player1.nickname,
        image: game.player1.avatar.src,
      };

      const player2_historic: {
        id: number;
        nickname: string;
        image: string;
      } = {
        id: game.player2.id,
        nickname: game.player2.nickname,
        image: game.player2.avatar.src,
      };
      history_game.players.push(player1_historic);
      history_game.players.push(player2_historic);

      user.infoPong.historic.unshift(history_game as never);
    }

  });

  function animate() {
	const currentTime = performance.now();
	const deltaTime = currentTime - lastTime;
	lastTime = currentTime;
	accumulatedTime += deltaTime;

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	tableBoard.draw(ctx);

	while (accumulatedTime > frameTime) {
		game.update();
		accumulatedTime -= frameTime;
  	}

  	game.draw();
  	requestAnimationFrame(animate);
  }
  animate();
});
</script>

<style scoped lang="scss">
.box {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  box-sizing: 0;
  background-color: midnightblue;
}

#canvas1 {
  border: 5px solid black;
  position: absolute;
  top: 0%;
  left: 50%;
  transform: translate3d(-50%, 5%, 0);
  max-width: 100%;
  max-height: 100%;
}

#buttonLeave {
  border: 5px solid black;
  position: absolute;
  top: 75.7%;
  left: 50%;
  transform: translate(-50%, 5%);
  background-color: red;
  color: white;
  font-family: 'Press Start 2P', cursive;
  font-size: 100%;
}

#buttonLeave:hover {
  color: rgb(91, 91, 91);
}


</style>

