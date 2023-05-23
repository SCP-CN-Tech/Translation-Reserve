import { writable } from "svelte/store";

export const showLoginModal = writable(false);
export const showSignupModal = writable(false);
export const showInviteModal = writable(false);
export const showTokenModal = writable(false);