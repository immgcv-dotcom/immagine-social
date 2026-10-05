import sharp from "sharp"; import fs from "node:fs/promises";
const out="public/assets/semana-2026-10-05-final"; await fs.mkdir(out,{recursive:true});
const items=[
["01","LETREIROS QUE DESTACAM","Sua marca visível de longe","https://images.unsplash.com/photo-1774271694280-97afcef90ded?auto=format&fit=crop&w=1400&q=85"],
["02","ENVELOPAMENTO PROFISSIONAL","Sua marca circulando pela cidade","https://images.unsplash.com/photo-1708216876612-a87225208195?auto=format&fit=crop&w=1400&q=85"],
["03","PLACAS E SINALIZAÇÃO","Informação clara com identidade","https://images.unsplash.com/photo-1774194801624-1a5a89af10ea?auto=format&fit=crop&w=1400&q=85"],
["04","IMPRESSOS QUE VENDEM","Sua marca também no papel","https://images.unsplash.com/photo-1770017863955-56a1501a3c93?auto=format&fit=crop&w=1400&q=85"],
["05","PROJETO COMPLETO","Do conceito à instalação","https://images.unsplash.com/photo-1759692071978-8bb602bcfe76?auto=format&fit=crop&w=1400&q=85"]];
const logo=await sharp("public/assets/immagine-logo.png").resize({width:250,height:115,fit:"inside"}).png().toBuffer();
for(const [n,title,sub,url] of items){
 const res=await fetch(url); if(!res.ok) throw Error("Falha foto "+n); const photo=Buffer.from(await res.arrayBuffer());
 const bg=await sharp(photo).resize(1080,1080,{fit:"cover"}).webp().toBuffer();
 const svg=Buffer.from(`<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h1080v330L0 505z" fill="#f5f3ed" opacity=".96"/><circle cx="965" cy="70" r="205" fill="#71d1ce" opacity=".9"/><rect x="58" y="70" width="770" height="105" rx="8" fill="#78d4d1"/><text x="78" y="145" font-family="Arial" font-size="51" font-weight="900" fill="#171717">${title}</text><text x="78" y="238" font-family="Arial" font-size="35" font-weight="700" fill="#202020">${sub}</text><line x1="78" y1="268" x2="410" y2="268" stroke="#11aaad" stroke-width="7"/><path d="M0 790L330 660 700 785 1080 620V1080H0Z" fill="#10adaf" opacity=".95"/><text x="400" y="900" font-family="Arial" font-size="29" font-weight="900" fill="white">VENHA FAZER UM ORÇAMENTO</text><text x="400" y="970" font-family="Arial" font-size="54" font-weight="900" fill="white">17 99137-6531</text></svg>`);
 await sharp(bg).composite([{input:svg},{input:logo,left:78,top:850}]).webp({quality:93}).toFile(`${out}/${n}.webp`);
}
console.log("5 artes novas com fotografias distintas geradas");