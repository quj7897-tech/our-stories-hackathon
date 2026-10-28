#!/bin/zsh
cd "$(dirname "$0")" || exit 1
if command -v node >/dev/null 2>&1; then
  exec node server.cjs --open
elif command -v python3 >/dev/null 2>&1; then
  exec python3 server.py --open
else
  echo '请先安装 Node.js 或 Python 3，再双击本文件。'
  read '?按回车关闭'
fi
