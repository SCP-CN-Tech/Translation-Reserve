<script lang="ts">
  // import logo from './assets/svelte.png';
  import FindReserve from "./lib/FindReserve.svelte";
  import { showLoginModal, showSignupModal, showInviteModal, showTokenModal } from "./lib/showModal";
  import UserProfile, { updateUserProfile } from './lib/UserProfile.svelte';
</script>

<main>
  <div class="user-profile-container">
    <UserProfile on:mount={()=>updateUserProfile()} />
  </div>
  
  <h1>中分翻譯預定存檔</h1>

  <FindReserve />

  <p>
    由<a href="https://github.com/Zokhoi" target="_blank">Zok</a><a href="https://www.wikidot.com/user:info/jochoi" target="_blank">hoi</a>製作
  </p>

  {#if $showLoginModal}
    {#await import('./lib/LoginModal.svelte') then value }
      <svelte:component this={value.default} />
    {/await}
  {/if}

  {#if $showSignupModal}
    {#await import('./lib/SignupModal.svelte') then value }
      <svelte:component this={value.default} />
    {/await}
  {/if}

  {#if $showInviteModal}
    {#await import('./lib/InviteModal.svelte') then value }
      <svelte:component this={value.default} />
    {/await}
  {/if}

  {#if $showTokenModal}
    {#await import('./lib/TokenModal.svelte') then value }
      <svelte:component this={value.default} />
    {/await}
  {/if}
  
</main>

<style lang="scss">
  @media (prefers-color-scheme: dark) {
    :root {
      background-color: var(--dark-bg);
      color: var(--dark-bg-text-color);
    }
    h1, a {
      color: var(--light-accent);
    }
    a:hover {
      color: var(--dark-accent);
    }
  }
  @media (prefers-color-scheme: light) {
    :root {
      background-color: var(--light-bg);
      color: var(--light-bg-text-color);
    }
    h1, a {
      color: var(--dark-accent);
    }
    a:hover {
      color: var(--light-accent);
    }
  }
  :root {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    --light-bg: #EEE;
    --light-bg-text-color: #111;
    --light-bg-soft-text-color: #111A;

    --dark-bg: #333;
    --dark-bg-text-color: #CCC;
    --dark-bg-soft-text-color: #CCCA;

    --light-accent: #5aa875;
    --light-accent-2: #5d9e73;
    --dark-accent: #2c7044;
    --dark-accent-2: #34824f;
  }

  main {
    // position: relative;
    text-align: center;
    padding: 1em;
    margin: 0 auto;
    height: 100%;
  }
  .user-profile-container {
    text-align: right;
  }

  /* img {
    height: 16rem;
    width: 16rem;
  } */

  h1 {
    text-transform: uppercase;
    font-size: 4rem;
    font-weight: 100;
    line-height: 1.1;
    margin: 2rem auto;
    max-width: 14rem;
  }

  p {
    max-width: 14rem;
    margin: 1rem auto;
    line-height: 1.35;
  }

  @media (min-width: 480px) {
    h1 {
      max-width: none;
    }

    p {
      max-width: none;
    }
  }
</style>
