<script lang="ts">
  import { dbRoot } from "../constants";
  import { showSignupModal } from "./showModal";
  import { updateUserProfile } from "./UserProfile.svelte";
  import BaseModal from "./BaseModal.svelte";

  async function signupForm(event: any) {
    let form = event.target as HTMLFormElement;
    let obj: any = {};
    let pw = document.getElementById("upw"), pw2 = document.getElementById("upw2");
    if (pw.value!==pw2.value) {
      document.getElementById("signup-message").innerText = "Passwords don't match."
    }
    for (let i of Object.keys(form.elements)) {
      if (form.elements[i].type !== "submit") {
        obj[form.elements[i].name] = form.elements[i].value
      }
    }
    let res = await fetch(dbRoot+'/createUser', {
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
      document.getElementById("signup-message").innerText = res.message;
    } else {
      showSignupModal.set(false);
      updateUserProfile();
    }
  }
</script>

<BaseModal modalClass="signup-modal" showModal={showSignupModal}>
  <h2>註冊</h2>
  <form on:submit|preventDefault={signupForm}>
    <label for="uname">用戶名:</label>
    <input type="text" id="uname" name="username" placeholder="用戶名" />
    <br />
    <label for="upw">密碼:</label>
    <input type="password" id="upw" name="password" placeholder="密碼" />
    <br />
    <label for="upw2">重新輸入密碼:</label>
    <input type="password" id="upw2" name="password" placeholder="重新輸入密碼" />
    <br />
    <label for="uinv">邀請碼:</label>
    <input type="text" id="uinv" name="invite" placeholder="邀請碼" />
    <br />
    <button type="submit">註冊</button>
  </form>
  <div id="signup-message" />
</BaseModal>


<style>
</style>