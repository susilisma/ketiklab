#!/usr/bin/env python3
"""Wrap a COMPLETE standalone HTML page into a password gate.

Unlike tools/lock.py (which injects a fragment with innerHTML and therefore
cannot run scripts), this renders the decrypted page inside an iframe srcdoc,
so the payload's own <script> executes normally and inherits the page origin.

Usage: python3 tools/lock-page.py <input.html> <output.html> <password> [title]
Crypto: PBKDF2-SHA256 (250000 iters, 16-byte salt) -> AES-256-GCM (12-byte IV).
"""
import base64, json, os, sys
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes

ITER = 250000

TPL = """<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>__TITLE__</title>
<style>
:root{--bg:#f6f6fa;--surface:#fff;--line:#e6e6ef;--text:#1c1d26;--muted:#7b7d8c;--purple:#6b5df6;--purple-soft:#eeecff}
@media(prefers-color-scheme:dark){:root{--bg:#14141b;--surface:#1c1d26;--line:#2c2d3a;--text:#ececf2;--muted:#9294a4;--purple-soft:#26243d}}
*{box-sizing:border-box}
html,body{height:100%}
body{margin:0;background:var(--bg);color:var(--text);font:15px/1.75 -apple-system,BlinkMacSystemFont,"Segoe UI",Inter,"PingFang SC","Microsoft YaHei",sans-serif}
#gate{min-height:100vh;display:grid;place-items:center;padding:24px}
.box{background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:34px 30px;max-width:390px;width:100%;text-align:center;box-shadow:0 12px 34px rgba(28,29,38,.09)}
.lk{width:46px;height:46px;border-radius:13px;background:var(--purple-soft);color:var(--purple);display:grid;place-items:center;margin:0 auto 16px;font-size:20px}
.box h1{font-size:17px;margin:0 0 5px}
.box p{color:var(--muted);font-size:12px;margin:0 0 20px}
.box input{width:100%;border:1px solid var(--line);background:var(--bg);color:var(--text);border-radius:11px;padding:12px 14px;outline:0;font-size:15px;text-align:center;letter-spacing:2px}
.box input:focus{border-color:var(--purple);box-shadow:0 0 0 3px var(--purple-soft)}
.box button{width:100%;margin-top:11px;border:0;border-radius:11px;background:var(--purple);color:#fff;padding:12px;font-size:14px;font-weight:700;cursor:pointer}
.box button:disabled{opacity:.55;cursor:default}
.err{color:#dc5a69;font-size:12px;min-height:17px;margin-top:9px}
.rem{margin-top:14px;font-size:11.5px;color:var(--muted);display:flex;align-items:center;justify-content:center;gap:6px}
#frame{display:none;border:0;width:100%;height:100vh}
</style></head><body>
<div id="gate"><div class="box">
  <div class="lk">&#128274;</div>
  <h1>__TITLE__</h1>
  <p>&#36825;&#20221;&#20869;&#23481;&#24050;&#21152;&#23494;&#65292;&#35831;&#36755;&#20837;&#21475;&#20196;&#26597;&#30475;</p>
  <input id="pw" type="password" autocomplete="off" placeholder="&#21475;&#20196;">
  <button id="go">&#35299;&#38145;</button>
  <div class="err" id="err"></div>
  <label class="rem"><input id="rem" type="checkbox" style="width:auto;letter-spacing:0" checked>&#22312;&#36825;&#21488;&#35774;&#22791;&#19978;&#35760;&#20303;&#65288;30&#22825;&#65289;</label>
</div></div>
<iframe id="frame" title="__TITLE__"></iframe>
<script>
const D=__DATA__;
const KEYNAME='ketiklab-ops-pw';
const b64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function decrypt(pw){
  const km=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveKey']);
  const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:b64(D.s),iterations:D.i,hash:'SHA-256'},km,{name:'AES-GCM',length:256},false,['decrypt']);
  const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64(D.n)},key,b64(D.c));
  return new TextDecoder().decode(plain);
}
function reveal(html){
  document.getElementById('gate').style.display='none';
  const f=document.getElementById('frame');
  f.style.display='block';
  f.srcdoc=html;
  document.title=D.t;
}
async function unlock(){
  const pw=document.getElementById('pw').value; if(!pw) return;
  const btn=document.getElementById('go'), err=document.getElementById('err');
  btn.disabled=true; err.textContent='\\u89e3\\u5bc6\\u4e2d\\u2026';
  try{
    const html=await decrypt(pw);
    if(document.getElementById('rem').checked){
      try{localStorage.setItem(KEYNAME,JSON.stringify({p:pw,t:Date.now()}));}catch(e){}
    }
    reveal(html);
  }catch(e){ err.textContent='\\u53e3\\u4ee4\\u4e0d\\u5bf9'; btn.disabled=false; }
}
document.getElementById('go').onclick=unlock;
document.getElementById('pw').addEventListener('keydown',e=>{if(e.key==='Enter')unlock();});
(async()=>{
  try{
    const raw=localStorage.getItem(KEYNAME);
    if(raw){
      const o=JSON.parse(raw);
      if(Date.now()-o.t < 30*864e5){ reveal(await decrypt(o.p)); return; }
      localStorage.removeItem(KEYNAME);
    }
  }catch(e){ localStorage.removeItem(KEYNAME); }
  document.getElementById('pw').focus();
})();
</script></body></html>
"""

def main():
    if len(sys.argv) < 4:
        print(__doc__); sys.exit(1)
    src, dst, pw = sys.argv[1], sys.argv[2], sys.argv[3]
    html = open(src, encoding="utf-8").read()
    title = sys.argv[4] if len(sys.argv) > 4 else os.path.splitext(os.path.basename(src))[0]
    salt, nonce = os.urandom(16), os.urandom(12)
    key = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=ITER).derive(pw.encode())
    ct = AESGCM(key).encrypt(nonce, html.encode("utf-8"), None)
    b = lambda x: base64.b64encode(x).decode()
    data = json.dumps({"s": b(salt), "n": b(nonce), "c": b(ct), "i": ITER, "t": title}, ensure_ascii=False)
    out = TPL.replace("__DATA__", data).replace("__TITLE__", title)
    open(dst, "w", encoding="utf-8").write(out)
    print(f"locked -> {dst}  ({len(out)} bytes)")

if __name__ == "__main__":
    main()
