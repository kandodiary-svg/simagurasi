# GitHub Pages build: same game, but the 3D models are separate .glb files (smaller, cached, loaded in parallel)
import pathlib, re, base64, shutil, subprocess, sys
root = pathlib.Path(__file__).parent; out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else root / 'dist')
subprocess.run([sys.executable, 'build.py'], cwd=root, check=True, capture_output=True)
html = (root / 'index.html').read_text()
m = re.search(r'const MODEL_DATA = \{(.*?)\};', html, re.S); body = m.group(1)
(out / 'models').mkdir(parents=True, exist_ok=True); names = []
for k, b in re.findall(r'(\w+):"([A-Za-z0-9+/=]+)"', body):
    (out / 'models' / f'{k}.glb').write_bytes(base64.b64decode(b)); names.append(k)
html = html[:m.start()] + 'const MODEL_DATA = {' + ','.join(f'{k}:"models/{k}.glb"' for k in names) + '};' + html[m.end():]
page = '<!doctype html>\n<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>\n' + html + '\n</body></html>\n'
(out / 'index.html').write_text(page)
if (out / 'sfx').exists(): shutil.rmtree(out / 'sfx')
shutil.copytree(root / 'sfx', out / 'sfx')
(out / '.nojekyll').write_text('')
print('index', len(page.encode()), 'models', len(names), sum((out/'models'/f'{k}.glb').stat().st_size for k in names))
