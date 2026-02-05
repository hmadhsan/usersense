#!/usr/bin/env node
/**
 * UserSense CLI - Root Wrapper
 * Redirects to the prototype implementation.
 */
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const targetScript = path.resolve(__dirname, '../prototype/src/check.js');

const child = spawn('node', [targetScript, ...process.argv.slice(2)], {
  stdio: 'inherit'
});

child.on('exit', (code) => {
  process.exit(code);
});
