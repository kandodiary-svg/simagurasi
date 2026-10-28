import pathlib, sys
src = pathlib.Path('src')
order = ['noise.js','shape.js','tex.js','terrain.js','sky.js'] + [l.strip() for l in (src/'order.txt').read_text().split() if l.strip()] if (src/'order.txt').exists() else ['noise.js','shape.js','tex.js','terrain.js','sky.js','main.js']
js = '\n'.join((src/f).read_text() for f in order)
import base64
if (pathlib.Path('assets')/'models.js').exists(): assets = (pathlib.Path('assets')/'models.js').read_text()
else:  # GitHub copy: rebuild the embedded models from ../models/*.glb
    md = pathlib.Path('..')/'models'; assets = 'const MODEL_DATA = {' + ','.join(f'{f.stem}:"{base64.b64encode(f.read_bytes()).decode()}"' for f in sorted(md.glob('*.glb'))) + '};' if md.exists() else ''
# Trystero (MIT, vendor/trystero-LICENSE.txt): serverless WebRTC for the online visits (net.js), bundled to one file as window.Trystero
vend = pathlib.Path('vendor')/'trystero-0.26.0.iife.js'
tr = ('<script>/* trystero 0.26.0 (MIT) */\n' + vend.read_text() + '\n</script>\n') if vend.exists() else ''
html = (src/'head.html').read_text() + tr + '''
<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}</script>
<script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
''' + assets + '\n' + js + '\n</script>\n'
pathlib.Path('index.html').write_text(html); print(len(html))
