<script lang="ts">
  import type { Writable } from "svelte/store";
  export let modalClass: string;
  export let showModal: Writable<any>;
  import { onMount, onDestroy } from "svelte";
  function containerExitPrompt(e: Event) {
    if ((e.target as HTMLElement).classList.contains("modal-container")) showModal.set(false);
  }
  const escKeydown = e => {
    if (e.code.toLowerCase() == "escape") showModal.set(false);
  }
  onMount(()=>{
    window.addEventListener("keydown", escKeydown);
  });
  onDestroy(()=>{
    window.removeEventListener("keydown", escKeydown);
  });
</script>

<div class="modal-container" on:click={containerExitPrompt}>
  <div class="modal {modalClass}">
    <slot />
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