import { cloneNode, getNode, Overlay, removeElements } from "@/util";

type PageEls = {
  header: HTMLElement;
  body: HTMLElement;
  footer: HTMLElement;
};

function getPageEls(): PageEls {
  return {
    header: cloneNode('[data-testid="RecipePageLedBackground"]'),
    body: cloneNode("[class^='recipe']"),
    footer: cloneNode('[data-testid="RecipePagContentBackground"]'),
  };
}

function getRootEl() {
  return getNode("#app-root");
}

const removableQueries = [
  '[role*="dialog"]', // includes `alertdialog` as well
  "iframe",
  '[aria-live="assertive"]',
  '[class*="Modal"]',
  '[class*="modal"]',
  '[class*="InterstitialWrapper"]',
  '[class*="Paywall"]',
  '[class*="PersistentBottom"]',
];

function instantiateMutation() {
  const mutationCallback: MutationCallback = (mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element) {
          removableQueries.forEach((query) => {
            if (node.matches(query) || node.querySelectorAll(query).length) {
              console.debug(`🍳 removing ${node.childElementCount} node`);
              try {
                node.remove();
              } catch (error) {
                console.debug(`🍳 error removing node: `, error);
              }
            }
          });
        }
      });
    });
  };

  const observer = new MutationObserver(mutationCallback);

  const mutationTarget = getRootEl();
  const config: MutationObserverInit = { subtree: true, childList: true };
  if (mutationTarget) {
    console.debug(`🍳 instantiating observer`);
    observer.observe(mutationTarget, config);
  }

  return observer;
}

function appendRecipe() {
  const overlay = new Overlay();
  const { header, body, footer } = getPageEls();

  overlay.root.append(header);
  overlay.root.append(body);
  overlay.root.append(footer);
}

function init() {
  // instantiate observers
  const observer = instantiateMutation();

  window.onload = function () {
    // remove troublesome nodes
    removeElements(removableQueries);
    // append recipe to top of doom
    appendRecipe();
  };

  // clean up
  addEventListener("beforeunload", () => {
    console.debug("🍳 disconnecting");
    observer.disconnect();
  });
}

try {
  init();
} catch (error) {
  console.debug(`🍳 failed 😢: `, error);
}
