export const THEMES = Object.freeze({
  softGlass: Object.freeze({
    schemaVersion: "0.1",
    themeId: "reference.soft-glass",
    capabilities: [
      "background.color",
      "background.gradient",
      "background.blur",
      "surface.conversation.opacity",
      "surface.sidebar.opacity",
      "surface.glass.blur"
    ],
    appearance: {
      background: {
        color: "#111827",
        gradient: "linear-gradient(135deg, #4c1d95 0%, #9d4edd 42%, #f59e0b 100%)",
        blurPx: 2
      },
      surfaces: {
        conversationOpacity: 0.66,
        sidebarOpacity: 0.76,
        glassBlurPx: 16
      }
    }
  }),
  midnight: Object.freeze({
    schemaVersion: "0.1",
    themeId: "reference.midnight",
    capabilities: [
      "background.color",
      "background.gradient",
      "surface.conversation.opacity",
      "surface.sidebar.opacity",
      "surface.glass.blur"
    ],
    appearance: {
      background: {
        color: "#07111f",
        gradient: "radial-gradient(circle at 72% 18%, #164e63 0%, #0f172a 43%, #020617 100%)"
      },
      surfaces: {
        conversationOpacity: 0.78,
        sidebarOpacity: 0.86,
        glassBlurPx: 12
      }
    }
  })
});

export function localImageTheme(handle) {
  return {
    schemaVersion: "0.1",
    themeId: "reference.local-image",
    capabilities: [
      "background.color",
      "background.image",
      "background.blur",
      "surface.conversation.opacity",
      "surface.sidebar.opacity",
      "surface.glass.blur"
    ],
    appearance: {
      background: {
        color: "#111827",
        image: handle,
        blurPx: 0
      },
      surfaces: {
        conversationOpacity: 0.7,
        sidebarOpacity: 0.78,
        glassBlurPx: 14
      }
    }
  };
}

export const HOSTILE_REQUEST = Object.freeze({
  schemaVersion: "0.1",
  themeId: "hostile.fake-auth",
  capabilities: ["background.color", "interface.hide-send-button"],
  appearance: {
    background: { color: "#000000" },
    interface: { hideSendButton: true }
  }
});
