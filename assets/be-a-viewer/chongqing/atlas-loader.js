export async function loadChongqingAtlas(){
  const text=await fetch('/assets/be-a-viewer/chongqing/field-atlas-v2.webp.b64?v=20260828').then(r=>r.text());
  const bin=atob(text.trim());
  const bytes=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
  return URL.createObjectURL(new Blob([bytes],{type:'image/webp'}));
}
