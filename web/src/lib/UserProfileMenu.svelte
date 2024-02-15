<script lang="ts">
  export let username: string;
  export let logout: (...params: any[]) => void;
  import { showInviteModal, showTokenModal } from "./showModal";
  let menuShown = false;
  async function toggleMenu() {
    menuShown = !menuShown;
  }
  async function showInviteModalFunc() {
    showInviteModal.set(true);
  }
  async function showTokenModalFunc() {
    showTokenModal.set(true);
  }
</script>

<div class="menu-container {menuShown?'show':'hide'}">
  <div class="menu-header clickable" on:click={toggleMenu}>
    <span id="user-profile-name">{username}</span>
  </div>
  <div class="menu-content">
    <ul>
      <li>
        <span class="clickable" on:click={showInviteModalFunc}>
          生成邀請碼
        </span>
      </li>
      <li>
        <span class="clickable" on:click={showTokenModalFunc}>
          生成token
        </span>
      </li>
      <li>
        <span class="clickable" on:click={logout}>
          登出
        </span>
      </li>
    </ul>
  </div>
</div>

<style>
  .clickable, .clickable:hover {
    cursor: pointer;
  }
  .menu-container {
    position: relative;
  }
  .menu-content {
    position: absolute;
    top: 1em;
    right: 0;
  }
  .menu-content ul {
    list-style-type: none;
  }
  .menu-container.show .menu-header::after {
    content: "△";
    margin-left: 0.5em;
  }
  .menu-container.hide .menu-header::after {
    content: "▽";
    margin-left: 0.5em;
  }
  .menu-container.show .menu-content {
    display: block;
  }
  .menu-container.hide .menu-content {
    display: none;
  }
</style>