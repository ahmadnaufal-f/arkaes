#!/usr/bin/env node
import { runServer } from "./server";

runServer().catch((error: unknown) => {
  console.error("arkaes-mcp failed to start:", error);
  process.exitCode = 1;
});
