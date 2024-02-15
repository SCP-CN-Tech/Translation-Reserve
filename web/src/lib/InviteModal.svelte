<script lang="ts">
  import { dbRoot } from "../constants";
  import { onMount, onDestroy } from "svelte";
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
  import { faCopy, faSquareCheck } from "@fortawesome/free-regular-svg-icons";
  import { showInviteModal } from "./showModal";
  let infiniteUse = false, neverExpire = true, invite = null, copied = false;
  function containerExitPrompt(e: Event) {
    if ((e.target as HTMLElement).classList.contains("modal-container")) showInviteModal.set(false);
  }
  async function inviteForm(event: any) {
    let form = event.target as HTMLFormElement;
    let obj: any = {};
    if (infiniteUse) obj.usesRemain = -1;
    else obj.usesRemain = document.getElementById("invite-uses").value;
    if (!neverExpire) obj.expireDate = Date.now()+document.getElementById("invite-expiration").value*24*3600*1000;
    let res = await fetch(dbRoot+'/generateInvite', {
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
      invite = res.data.code;
      copied = false;
    }
  }
  async function copyInvite(e: Event) {
    navigator.clipboard.writeText(invite);
    copied = true;
  }
  const escKeydown = e => {
    if (e.code.toLowerCase() == "escape") showInviteModal.set(false);
  }
  onMount(()=>{
    window.addEventListener("keydown", escKeydown);
  });
  onDestroy(()=>{
    window.removeEventListener("keydown", escKeydown);
  });
</script>

<div class="modal-container" on:click={containerExitPrompt}>
  <div class="modal invite-modal">
    <h2>生成註冊邀請碼</h2>
    <form on:submit|preventDefault={inviteForm}>
      <label for="invite-uses">使用次數:</label>
      <input type="number" id="invite-uses" name="usesRemain" value="1" step="1" min="1" disabled={infiniteUse}/>
      <br />
      <label for="invite-infinite">無限使用:</label>
      <input type="checkbox" id="invite-infinite" name="infinite" bind:checked={infiniteUse} />
      <br />
      <label for="invite-expiration">到期時間:</label>
      <input type="number" id="invite-expiration" name="expireDate" value="30" min="0" disabled={neverExpire} /> 天
      <br />
      <label for="invite-never-expire">永不過期:</label>
      <input type="checkbox" id="invite-never-expire" name="neverExpire" bind:checked={neverExpire}/>
      <br />
      <button type="submit">生成</button>
    </form>
    {#if invite}
      <div id="invite-message">
        邀請碼: {invite}
        <span id="copy-icon" class="clickable" on:click={copyInvite}>
          {#if copied}
            <FontAwesomeIcon icon={faSquareCheck} size="1x" />
          {:else}
            <FontAwesomeIcon icon={faCopy} size="1x" />
          {/if}
        </span>
      </div>
    {/if}
  </div>
</div>


<style>
  .clickable, .clickable:hover {
    cursor: pointer;
  }
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