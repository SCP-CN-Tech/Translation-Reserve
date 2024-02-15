<script lang="ts">
  import { dbRoot } from "../constants";
  import { onMount, onDestroy } from "svelte";
  import { showLoginModal } from "./showModal";
  import { updateUserProfile } from "./UserProfile.svelte";
  function containerExitPrompt(e: Event) {
    if ((e.target as HTMLElement).classList.contains("modal-container")) showLoginModal.set(false);
  }
  async function loginForm(event: any) {
    let form = event.target as HTMLFormElement;
    let obj: any = {};
    for (let i of Object.keys(form.elements)) {
      if (form.elements[i].type !== "submit") {
        obj[form.elements[i].name] = form.elements[i].value
      }
    }
    let res = await fetch(dbRoot+'/login', {
      method: "POST",
      body: JSON.stringify(obj),
      mode: "cors",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
    }).then(res=>res.json());
    if (res.status === "ok") {
      document.getElementById("login-message").innerText = res.message;
    } else {
      showLoginModal.set(false);
      await updateUserProfile();
    }
  }
  const escKeydown = e => {
    if (e.code.toLowerCase() == "escape") showLoginModal.set(false);
  }
  onMount(()=>{
    window.addEventListener("keydown", escKeydown);
  });
  onDestroy(()=>{
    window.removeEventListener("keydown", escKeydown);
  });
</script>

<div class="modal-container" on:click={containerExitPrompt}>
  <div class="modal login-modal">
    <h2>登入翻譯預定系統</h2>
    <form on:submit|preventDefault={loginForm}>
      <label for="uname">用戶名:</label>
      <input type="text" id="uname" name="username" placeholder="用戶名" />
      <br />
      <label for="upw">密碼:</label>
      <input type="password" id="upw" name="password" placeholder="密碼" />
      <br />
      <button type="submit">登入</button>
    </form>
    <div id="login-message" />
  </div>
</div>


<style>
  .modal-container {
    background-color: #57575788;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 100%;
    text-align: center;
  }
  .modal {
    display: inline-block;
    background-color: var(--light-accent-2);
    border: 2px solid var(--dark-accent-2);
    border-radius: 10px;
    width: 30%;
    padding: 10px;
    margin: 40vh auto;
    text-align: center;
    color: var(--light-bg-text-color);
  }
  .modal h2 {
    margin-top: 0;
  }
</style>