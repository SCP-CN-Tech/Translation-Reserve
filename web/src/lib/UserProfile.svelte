<script context="module" lang="ts">
  import { writable } from "svelte/store";
  import { dbRoot } from "../constants";
  const loggedIn = writable(false);
  let username: string = "";
  export async function updateUserProfile() {
    let session = document.cookie.split(";").find(v=>v.startsWith("mustemmer_session_id="));
    // let userProfile = document.getElementById("user-profile-name") as HTMLSpanElement;
    if (session) {
      let res = await fetch(dbRoot+"/getUser", {
        method: "POST",
        mode: "cors",
        credentials: "include",
      }).then(res=>res.json());
      if (res.status === "ok") {
        if (res.data.sessionValid) {
          loggedIn.set(true);
          username = `${res.data.username}`;
          return true;
        } else {
          loggedIn.set(false);
          return false;
        }
      } else {
        console.log(res.message);
        return undefined;
      }
    } else return false;
  }
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import { showLoginModal, showSignupModal } from "./showModal";
  import UserProfileMenu from "./UserProfileMenu.svelte";
  async function checkLogin() { 
    let result = await updateUserProfile();
    if (result === false) showLoginModal.set(true);
  }
  async function checkSignup() { 
    let result = await updateUserProfile();
    if (result === false) showSignupModal.set(true);
  }
  async function logout() {
    let res = await fetch(dbRoot+"/logout", {
      method: "POST",
      mode: "cors",
      credentials: "include",
    }).then(res=>res.json());
    if (res.status === "ok") {
      loggedIn.set(false);
      await updateUserProfile();
    }
  }
  onMount(()=>updateUserProfile());
</script>

<div id="user-profile">
  {#if $loggedIn}
    <UserProfileMenu username={username} logout={logout} />
  {:else}
    <span class="clickable" on:click={checkLogin}>登入</span>
    或
    <span class="clickable" on:click={checkSignup}>註冊</span>
  {/if}
</div>

<style>
  .clickable, .clickable:hover {
    cursor: pointer;
  }
</style>