// Scrolls the help panel's body to `el` without moving the panel itself —
// element.scrollIntoView also scrolls every overflow-hidden ancestor, which
// pushes the panel header out of view.
export function scrollWithinPanel(el: HTMLElement, block: "start" | "center" = "start") {
  const scroller = el.closest<HTMLElement>("[data-help-scroll]");
  if (!scroller) return;
  const box = el.getBoundingClientRect();
  const view = scroller.getBoundingClientRect();
  const offset =
    block === "start"
      ? box.top - view.top - 16
      : box.top - view.top - view.height / 2 + box.height / 2;
  scroller.scrollBy({ top: offset, behavior: "smooth" });
}
