"""Build an explicit, portable handoff. Does not include caches or local paths."""
from pathlib import Path
import hashlib, json, re, zipfile

root = Path(__file__).resolve().parent.parent
out = root / 'deliverables'
out.mkdir(exist_ok=True)
files = []
for name in ['dist', 'godot', 'docs', 'tests', 'tools']:
    for p in (root / name).rglob('*'):
        if p.is_file() and not any(part in {'.godot', '__pycache__', '.tools'} for part in p.relative_to(root).parts):
            files.append((p, p.relative_to(root).as_posix()))
for name in ['README.md', 'server.cjs', 'server.py', '开始游戏.bat', '双击开始游戏.command', '.gitignore']:
    p = root / name
    if not p.is_file(): raise RuntimeError('Missing required startup file: ' + name)
    files.append((p, name))
for p in sorted((root / 'artifacts').glob('*.png')):
    files.append((p, 'screenshots/' + p.name))

private = re.compile(r'(?:[A-Za-z]:[\\/](?:Users|Program Files)|/Users/|wxid_|-----BEGIN (?:RSA |EC )?PRIVATE KEY-----|sk-[A-Za-z0-9]{24,})')
for p, rel in files:
    if p.suffix in {'.js', '.cjs', '.py', '.ps1', '.html', '.css', '.md', '.json', '.godot', '.cfg', '.gd', '.bat', '.command'}:
        text = p.read_text(encoding='utf-8-sig')
        for line in text.splitlines():
            if rel == 'tools/package-handoff.py' and line.startswith('private = re.compile'):
                continue  # The scanner's own pattern contains example path markers.
            if private.search(line): raise RuntimeError('Private content candidate in: ' + rel)
    if p.name.startswith('.env'): raise RuntimeError('Environment file excluded: ' + rel)

prefix = '我们的故事_纸框与对白修正版'
archive = out / (prefix + '_交接包.zip')
manifest = {'version': 'full-day-paper-speech-repaired-2026-10-25', 'scope': 'Original homepage primary action, game case entry, paper game frame and responsive speech bubbles; complete-day story through 20:00',
            'entry': '开始游戏.bat', 'files': {rel: hashlib.sha256(p.read_bytes()).hexdigest() for p, rel in sorted(files, key=lambda x:x[1])}}
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as z:
    for p, rel in sorted(files, key=lambda x:x[1]): z.write(p, prefix + '/' + rel)
    z.writestr(prefix + '/交接版本.json', json.dumps(manifest, ensure_ascii=False, indent=2))
with zipfile.ZipFile(archive) as z:
    if z.testzip() is not None: raise RuntimeError('Archive CRC failed')
    for p, rel in files:
        assert hashlib.sha256(z.read(prefix + '/' + rel)).hexdigest() == manifest['files'][rel]
receipt = {'file': archive.name, 'bytes': archive.stat().st_size, 'sha256': hashlib.sha256(archive.read_bytes()).hexdigest(),
           'files': len(files) + 1, 'crc': 'pass', 'sourceHashes': 'pass', 'privateContentScan': 'pass'}
(out / '交接包校验.json').write_text(json.dumps(receipt, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(receipt, ensure_ascii=False, indent=2))
