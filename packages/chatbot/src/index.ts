// Root entry point. Side-effect free: re-exports the widget class, its define
// helper, and the shared wire types for typing. It deliberately does NOT export
// the server module (which pulls in the openai SDK) — import that from
// "@arkaes/chatbot/server" inside server-only code.
export * from "./shared/types";
export { ArkChatbot, defineArkChatbot } from "./client/ark-chatbot";
