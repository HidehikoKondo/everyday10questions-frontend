#!/usr/bin/env python3
"""キャッシュ無効のHTTPサーバー"""
from http.server import HTTPServer, SimpleHTTPRequestHandler


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    server = HTTPServer(("", 8080), NoCacheHandler)
    print("サーバー起動: http://localhost:8080")
    server.serve_forever()
