<script lang="ts">
  export let dbRoot: string;
  import { onMount, onDestroy } from "svelte";
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
  import { faCopy, faSquareCheck } from "@fortawesome/free-regular-svg-icons";
  import { showTokenModal } from "./showModal";
  let token = null, copied = false;
  function containerExitPrompt(e: Event) {
    if ((e.target as HTMLElement).classList.contains("modal-container")) showTokenModal.set(false);
  }
  async function tokenForm(event: any) {
    let res = await fetch(dbRoot+'/generateToken', {
      method: "POST",
      body: JSON.stringify({}),
      mode: "cors",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    let jsonres = await res.json();
    if (jsonres.status==='ok') {
      token = jsonres.data.token;
    }
  }
  async function copyToken(e: Event) {
    navigator.clipboard.writeText(token);
    copied = true;
  }
  const escKeydown = e => {
    if (e.code.toLowerCase() == "escape") showTokenModal.set(false);
  }
  onMount(()=>{
    window.addEventListener("keydown", escKeydown);
  });
  onDestroy(()=>{
    window.removeEventListener("keydown", escKeydown);
  });
</script>

<div class="modal-container" on:click={containerExitPrompt}>
  <div class="modal token-modal">
    <h2>生成 Token</h2>
    <div class="warn token-warning">注意：新token被生成時舊token即會失效。</div>
    <br />
    <form on:submit|preventDefault={tokenForm}>
      <button type="submit">生成</button>
    </form>
    {#if token}
      <div id="token-message">
        Token: {token}
        <span id="copy-icon" class="clickable" on:click={copyToken}>
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