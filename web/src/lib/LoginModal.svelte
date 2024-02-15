<script lang="ts">
  import { dbRoot } from "../constants";
  import { showLoginModal } from "./showModal";
  import BaseModal from "./BaseModal.svelte";
  import { updateUserProfile } from "./UserProfile.svelte";

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
</script>

<BaseModal modalClass="login-modal" showModal={showLoginModal}>
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
</BaseModal>


<style>
</style>