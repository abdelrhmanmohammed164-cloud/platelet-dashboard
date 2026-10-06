"""Refresh dashboard.html and app.py after editing the template, JSON or images."""
import base64
import gzip
import json
import re
from pathlib import Path

ROOT=Path(__file__).resolve().parent
SRC=ROOT/'src'

def image(file):
    path=ROOT/'assets'/file
    return 'data:image/jpeg;base64,'+base64.b64encode(path.read_bytes()).decode('ascii')

data=json.loads((SRC/'demo-data.json').read_text(encoding='utf-8'))
for case in data['cases']:
    case['src']=image(case['img'])
    for region in case['regions']:
        region['crop_src']=image(region['crop_file'])
data['detection']=[[d['name'],image(d['file'])] for d in data['detection']]
page=(SRC/'dashboard.template.html').read_text(encoding='utf-8')
page=page.replace('__STYLE__',(SRC/'dashboard.css').read_text(encoding='utf-8'))
page=page.replace('__SCRIPT__',(SRC/'dashboard.js').read_text(encoding='utf-8'))
page=page.replace('__BACKGROUND__',image('blood-background.jpg'))
page=page.replace('__DEMO_DATA__',json.dumps(data,ensure_ascii=False).replace('</','<\\/'))
(ROOT/'dashboard.html').write_text(page,encoding='utf-8')
payload=base64.b64encode(gzip.compress(page.encode(),compresslevel=9)).decode('ascii')
launcher=(ROOT/'app.py').read_text(encoding='utf-8')
launcher,count=re.subn(r'^_DASHBOARD_GZIP_BASE64 = "[A-Za-z0-9+/=]+"$',lambda _: '_DASHBOARD_GZIP_BASE64 = "'+payload+'"',launcher,flags=re.MULTILINE)
if count!=1:raise RuntimeError('Cannot locate the embedded dashboard in app.py')
(ROOT/'app.py').write_text(launcher,encoding='utf-8')
print('Refreshed dashboard.html and app.py')
