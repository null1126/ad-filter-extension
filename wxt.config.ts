import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    permissions: ['storage'],
    content_scripts: [
      {
        matches: ['*://*.baidu.com/*', '*://www.baidu.com/*', '*://baidu.com/*'],
        js: ['content-scripts/content.js'],
        run_at: 'document_idle',
      },
    ],
  },
});
