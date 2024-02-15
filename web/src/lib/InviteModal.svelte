<script lang="ts">
  import { dbRoot } from "../constants";
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
  import { faCopy, faSquareCheck } from "@fortawesome/free-regular-svg-icons";
  import { showInviteModal } from "./showModal";
  import BaseModal from "./BaseModal.svelte";
  let infiniteUse = false, neverExpire = true, invite = null, copied = false;

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
</script>

<BaseModal modalClass="invite-modal" showModal={showInviteModal}>
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
</BaseModal>


<style>
  .clickable, .clickable:hover {
    cursor: pointer;
  }
</style>