from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os, sys, webbrowser
class Handler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, '.wasm':'application/wasm', '.pck':'application/octet-stream', '.js':'text/javascript'}
    def __init__(self,*args,**kwargs):
        super().__init__(*args,directory=str(Path(__file__).parent/'dist'),**kwargs)
    def end_headers(self):
        self.send_header('Cache-Control','no-store')
        self.send_header('Cross-Origin-Opener-Policy','same-origin')
        self.send_header('Cross-Origin-Embedder-Policy','require-corp')
        self.send_header('Cross-Origin-Resource-Policy','same-origin')
        super().end_headers()
port=int(os.environ.get('LOVE_PORT','8190'))
for offset in range(21):
    try:
        server=ThreadingHTTPServer(('127.0.0.1',port+offset),Handler)
        break
    except OSError:
        if offset==20: raise
url='http://127.0.0.1:'+str(server.server_port)
print('\n《惊喜》完整一天修正版\n'+url+'\n保留此窗口即可游玩；按 Ctrl+C 关闭。',flush=True)
if '--open' in sys.argv: webbrowser.open(url)
try: server.serve_forever()
except KeyboardInterrupt: server.server_close()
