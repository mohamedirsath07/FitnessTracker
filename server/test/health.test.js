const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../server');

async function startServer() {
    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address();
    return {
        server,
        url: `http://127.0.0.1:${port}`,
    };
}

test('liveness endpoint confirms the API process is running', async (t) => {
    const running = await startServer();
    t.after(() => running.server.close());

    const response = await fetch(`${running.url}/api/health/live`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.success, true);
});

test('readiness endpoint reports an unavailable database explicitly', async (t) => {
    const running = await startServer();
    t.after(() => running.server.close());

    const response = await fetch(`${running.url}/api/health`);
    const body = await response.json();

    assert.equal(response.status, 503);
    assert.equal(body.success, false);
    assert.equal(body.database, 'disconnected');
});
