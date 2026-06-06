const scrollLockOwners = new Set<object>();
let previousBodyOverflow: string | null = null;

export const lockBodyScroll = (owner: object) => {
  if (scrollLockOwners.has(owner)) return;

  if (scrollLockOwners.size === 0) {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }

  scrollLockOwners.add(owner);
};

export const unlockBodyScroll = (owner: object) => {
  if (!scrollLockOwners.delete(owner) || scrollLockOwners.size > 0) return;

  if (document.body.style.overflow === "hidden") {
    document.body.style.overflow = previousBodyOverflow ?? "";
  }
  previousBodyOverflow = null;
};
