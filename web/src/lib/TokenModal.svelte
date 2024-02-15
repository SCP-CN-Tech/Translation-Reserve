<script lang="ts">
  import { dbRoot } from "../constants";
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
  import { faCopy, faSquareCheck } from "@fortawesome/free-regular-svg-icons";
  import { showTokenModal } from "./showModal";
  import BaseModal from "./BaseModal.svelte";
  let token = null, copied = false;
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
    }).then(res=>res.json());
    if (res.status === "ok") {
      token = res.data.token;
      copied = false;
    }
  }
  async function copyToken(e: Event) {
    navigator.clipboard.writeText(token);
    copied = true;
  }
</script>

<BaseModal modalClass="token-modal" showModal={showTokenModal}>
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
</BaseModal>


<style>
  .clickable, .clickable:hover {
    cursor: pointer;
  }
</style>