<template>
  <div class="d-flex bd-highlight">
    <div class="img_cont">
      <img :src="getImage()" class="rounded-circle user_img" />
      <span :class="getStatus()"></span>
    </div>
    <div class="user_info">
      <span>{{ props.user.nickname }}</span>
      <p>{{props.user.status}}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
//Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "./App.css";
import { type ChatUser } from "@/stores/chatStore";
import defaultAvatar from "@/assets/chat/avatar.png";

function getImage() {
  return props.user.image ? props.user.image : defaultAvatar;
}

function getStatus() {
  return "online_icon " + props.user.status;
}

const props = defineProps<{ user: ChatUser }>();

</script>

<style scoped></style>
