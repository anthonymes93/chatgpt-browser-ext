// =====================================
// ChatGPT Arrow Scroll + Main Section
// =====================================


// =====================================
// 1. ARROW KEY SCROLLING
// =====================================

document.addEventListener(
  "keydown",
  (event) => {
    const active = document.activeElement;

    const isTyping =
      active &&
      (
        active.tagName === "INPUT" ||
        active.tagName === "TEXTAREA" ||
        active.isContentEditable
      );

    if (isTyping) return;

    if (
      event.key !== "ArrowUp" &&
      event.key !== "ArrowDown"
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const scrollAmount =
      event.key === "ArrowDown" ? 90 : -90;

    const scrollables = [
      ...document.querySelectorAll("*")
    ].filter((el) => {
      const style = getComputedStyle(el);

      return (
        ["auto", "scroll"].includes(style.overflowY) &&
        el.scrollHeight > el.clientHeight + 50
      );
    });

    const scrollContainer =
      scrollables.sort(
        (a, b) => b.clientHeight - a.clientHeight
      )[0];

    if (scrollContainer) {
      scrollContainer.scrollBy({
        top: scrollAmount,
        behavior: "auto"
      });
    } else {
      document.scrollingElement?.scrollBy({
        top: scrollAmount,
        behavior: "auto"
      });
    }
  },
  true
);


// =====================================
// 2. MAIN SECTION STORAGE
// =====================================

const MAIN_SECTION_KEY = "anthonyMainSection";

function cleanUrl(url) {
  return url
    .split("#")[0]
    .split("?")[0]
    .replace(/\/$/, "");
}

function getMainSection() {
  try {
    return JSON.parse(
      localStorage.getItem(MAIN_SECTION_KEY)
    );
  } catch {
    return null;
  }
}

function removeMainSection() {
  localStorage.removeItem(MAIN_SECTION_KEY);
  updateMainSectionButtons();
}


// IMPORTANT:
// This now uses the actual outer ChatGPT turn wrapper
function getAssistantTurn(element) {
  return (
    element.closest("[data-turn-key]") ||
    element.closest("article") ||
    element.closest('[data-testid^="conversation-turn-"]') ||
    element.parentElement?.parentElement ||
    element.parentElement
  );
}


// =====================================
// 3. SAVE EXACT ASSISTANT RESPONSE
// =====================================

function saveMainSection(marker) {
  const turn = getAssistantTurn(marker);

  if (!turn) return;

  let sectionId =
    turn.dataset.anthonySectionId;

  if (!sectionId) {
    sectionId =
      "anthony-main-" +
      Date.now() +
      "-" +
      Math.random()
        .toString(36)
        .slice(2, 8);

    turn.dataset.anthonySectionId =
      sectionId;

    turn.id = sectionId;
  }

  localStorage.setItem(
    MAIN_SECTION_KEY,
    JSON.stringify({
      url: cleanUrl(location.href),
      sectionId: sectionId
    })
  );

  updateMainSectionButtons();
}


// =====================================
// 4. JUMP TO MAIN SECTION
// =====================================

function scrollToMainSection() {
  const saved = getMainSection();

  if (!saved) return;

  const currentUrl =
    cleanUrl(location.href);

  if (currentUrl !== saved.url) {
    location.href =
      saved.url + "#" + saved.sectionId;

    return;
  }

  const target =
    document.getElementById(
      saved.sectionId
    );

  if (!target) return;

  target.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

  try {
    target.animate(
      [
        {
          outline:
            "2px solid rgba(255,255,255,0)"
        },
        {
          outline:
            "2px solid rgba(255,255,255,.8)"
        },
        {
          outline:
            "2px solid rgba(255,255,255,0)"
        }
      ],
      {
        duration: 1200
      }
    );
  } catch {}
}


// =====================================
// 5. CREATE STAR ICON BUTTON
// =====================================

function createMainSectionButton(marker) {
  const button =
    document.createElement("button");

  button.className =
    "anthony-main-section-button";

  button.type = "button";

  button.title =
    "Set as main section";

  button.setAttribute(
    "aria-label",
    "Set as main section"
  );

  button.style.cssText = `
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    margin: 0;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: currentColor;
    cursor: pointer;
    opacity: 0.65;
    flex: 0 0 auto;
  `;

  button.innerHTML = `
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <polygon
        points="
          12 2
          15.09 8.26
          22 9.27
          17 14.14
          18.18 21.02
          12 17.77
          5.82 21.02
          7 14.14
          2 9.27
          8.91 8.26
          12 2
        "
      />
    </svg>
  `;

  button.addEventListener(
    "mouseenter",
    () => {
      button.style.opacity = "1";

      button.style.background =
        "rgba(255,255,255,0.08)";
    }
  );

  button.addEventListener(
    "mouseleave",
    () => {
      const saved =
        getMainSection();

      const turn =
        getAssistantTurn(marker);

      const isMain =
        saved &&
        turn &&
        turn.id === saved.sectionId &&
        cleanUrl(location.href) ===
          saved.url;

      button.style.opacity =
        isMain ? "1" : "0.65";

      button.style.background =
        "transparent";
    }
  );

  button.addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      const turn =
        getAssistantTurn(marker);

      const saved =
        getMainSection();

      const isMain =
        saved &&
        turn &&
        turn.id === saved.sectionId &&
        cleanUrl(location.href) ===
          saved.url;

      if (isMain) {
        removeMainSection();
      } else {
        saveMainSection(marker);
      }
    }
  );

  return button;
}


// =====================================
// 6. ADD STAR AS FIRST ICON
// =====================================

function addMainSectionButtons() {
  const actionRows =
    document.querySelectorAll(".turn-action-controls");

  actionRows.forEach((actionRow) => {

    // Don't add another star to this row
    if (
      actionRow.querySelector(
        ".anthony-main-section-button"
      )
    ) {
      return;
    }

    // The actual inner row containing
    // Copy, Share, Read Aloud, etc.
    const realButtonRow =
      actionRow.querySelector("div");

    if (!realButtonRow) return;

    // Use the action row itself as our reference
    const button =
      createMainSectionButton(actionRow);

    realButtonRow.prepend(button);
  });

  updateMainSectionButtons();
}


// =====================================
// 7. RESTORE SAVED SECTION
// =====================================

function restoreSavedMainSectionId() {
  const saved =
    getMainSection();

  if (!saved) return;

  if (
    cleanUrl(location.href) !==
    saved.url
  ) {
    return;
  }

  const existing =
    document.getElementById(
      saved.sectionId
    );

  if (existing) return;

  const hash =
    location.hash.replace("#", "");

  if (
    hash &&
    hash === saved.sectionId
  ) {
    const assistantMarkers =
      document.querySelectorAll(
        '[data-conversation-role="assistant"]'
      );

    if (
      assistantMarkers.length > 0
    ) {
      const lastMarker =
        assistantMarkers[
          assistantMarkers.length - 1
        ];

      const turn =
        getAssistantTurn(lastMarker);

      if (turn) {
        turn.id =
          saved.sectionId;

        turn.dataset.anthonySectionId =
          saved.sectionId;
      }
    }
  }
}


// =====================================
// 8. UPDATE STAR STATES
// =====================================

function updateMainSectionButtons() {
  const saved =
    getMainSection();

  document
    .querySelectorAll(
      ".anthony-main-section-button"
    )
    .forEach((button) => {

      const turn =
        button.closest("[data-turn-key]") ||
        button.closest("article") ||
        button.closest(
          '[data-testid^="conversation-turn-"]'
        );

      const isMain =
        saved &&
        turn &&
        turn.id === saved.sectionId &&
        cleanUrl(location.href) ===
          saved.url;

      const polygon =
        button.querySelector("polygon");

      if (!polygon) return;

      if (isMain) {
        polygon.setAttribute(
          "fill",
          "currentColor"
        );

        button.style.opacity =
          "1";

        button.title =
          "Main section — click to remove";

        button.setAttribute(
          "aria-label",
          "Remove main section"
        );
      } else {
        polygon.setAttribute(
          "fill",
          "none"
        );

        button.style.opacity =
          "0.65";

        button.title =
          "Set as main section";

        button.setAttribute(
          "aria-label",
          "Set as main section"
        );
      }
    });

  updatePermanentMainButton();
}


// =====================================
// 9. PERMANENT GO TO MAIN BUTTON
// =====================================

function createPermanentMainButton() {
  if (
    document.getElementById(
      "anthony-permanent-main"
    )
  ) {
    return;
  }

  const button =
    document.createElement("button");

  button.id =
    "anthony-permanent-main";

  button.textContent =
    "★ Go to Main";

  button.style.cssText = `
    position: fixed;
    top: 14px;
    right: 150px;
    z-index: 999999;
    background: #202020;
    color: white;
    border: 1px solid #555;
    border-radius: 8px;
    padding: 7px 12px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 3px 12px rgba(0,0,0,0.25);
  `;

  button.addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      scrollToMainSection();
    }
  );

  document.body.appendChild(button);
}

function updatePermanentMainButton() {
  createPermanentMainButton();

  const button =
    document.getElementById(
      "anthony-permanent-main"
    );

  const saved =
    getMainSection();

  if (!saved) {
    button.style.display =
      "none";

    return;
  }

  button.style.display =
    "block";

  button.textContent =
    "★ Go to Main";

  button.style.opacity =
    "1";

  button.style.cursor =
    "pointer";
}


// =====================================
// 10. SAFE DOM WATCHER
// =====================================

let mainUpdateScheduled =
  false;

const mainObserver =
  new MutationObserver(() => {
    if (mainUpdateScheduled) {
      return;
    }

    mainUpdateScheduled =
      true;

    requestAnimationFrame(() => {
      mainUpdateScheduled =
        false;

      addMainSectionButtons();
    });
  });

mainObserver.observe(
  document.body,
  {
    childList: true,
    subtree: true
  }
);


// =====================================
// 11. WATCH CHAT NAVIGATION
// =====================================

let lastChatUrl =
  cleanUrl(location.href);

setInterval(() => {
  const currentChatUrl =
    cleanUrl(location.href);

  if (
    currentChatUrl !==
    lastChatUrl
  ) {
    lastChatUrl =
      currentChatUrl;

    setTimeout(() => {
      addMainSectionButtons();
      updatePermanentMainButton();
    }, 400);
  }
}, 500);


// =====================================
// 12. INITIAL RUN
// =====================================

addMainSectionButtons();
updatePermanentMainButton();


// If we arrived via the saved hash,
// try jumping after ChatGPT finishes loading
setTimeout(() => {
  if (
    location.hash &&
    getMainSection()
  ) {
    scrollToMainSection();
  }
}, 1200);

// ======================================================
// AUTO-FOCUS CHATGPT COMPOSER AFTER "ASK CHATGPT"
// ======================================================

let lastSelectionCardCount = 0;

function getChatGPTComposer() {
  return (
    document.querySelector('#prompt-textarea') ||
    document.querySelector('[contenteditable="true"][data-lexical-editor="true"]') ||
    document.querySelector('div[contenteditable="true"]')
  );
}

function getSelectionCardCount() {
  const elements = [...document.querySelectorAll('div, span, p')];

  return elements.filter((el) => {
    return el.textContent?.trim() === 'Selection';
  }).length;
}

function focusChatGPTComposer() {
  const composer = getChatGPTComposer();

  if (!composer) return;

  composer.focus();

  // Put caret at the end of whatever is already typed
  try {
    const range = document.createRange();
    range.selectNodeContents(composer);
    range.collapse(false);

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  } catch (err) {
    console.log('Could not move caret:', err);
  }
}

const askChatGPTFocusObserver = new MutationObserver(() => {
  const currentCount = getSelectionCardCount();

  // A new Selection card appeared
  if (currentCount > lastSelectionCardCount) {
    setTimeout(() => {
      focusChatGPTComposer();
    }, 100);
  }

  lastSelectionCardCount = currentCount;
});

lastSelectionCardCount = getSelectionCardCount();

askChatGPTFocusObserver.observe(document.body, {
  childList: true,
  subtree: true
});