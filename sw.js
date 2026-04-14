const CACHE_NAME = 'everyday10q-v1';

// インストール時にキャッシュする静的ファイル
const STATIC_ASSETS = [
    '/everyday10questions-frontend/',
    '/everyday10questions-frontend/index.html',
    '/everyday10questions-frontend/css/style.css',
    '/everyday10questions-frontend/script.js',
];

// インストール: 静的ファイルを事前キャッシュ
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

// アクティベート: 古いキャッシュを削除
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// フェッチ: ファイル種別ごとにキャッシュ戦略を切り替え
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // 問題JSON: Stale While Revalidate（即キャッシュ返却 + バックグラウンドで更新）
    if (url.pathname.includes('/questions/') && url.pathname.endsWith('.json')) {
        event.respondWith(staleWhileRevalidate(event.request));
        return;
    }

    // 静的ファイル: Cache First（キャッシュ優先、なければネットワーク取得してキャッシュ）
    event.respondWith(cacheFirst(event.request));
});

// Cache First戦略
async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        // ネットワーク不可かつキャッシュもない場合はそのままエラー
        return new Response('Network error', { status: 408 });
    }
}

// Stale While Revalidate戦略
async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    // バックグラウンドでネットワーク取得してキャッシュを更新
    const fetchPromise = fetch(request).then(response => {
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    }).catch(() => null);

    // キャッシュがあればすぐ返す、なければネットワーク取得を待つ
    return cached || fetchPromise;
}
