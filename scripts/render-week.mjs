import sharp from "sharp";
import fs from "node:fs/promises";
const items=[
["01","LETREIROS","Sua marca visível de longe","public/assets/semana-2026-09-28/01-fachadas.webp"],
["02","ENVELOPAMENTO","Sua marca circulando pela cidade","public/assets/semana-2026-09-28/02-grande-formato.webp"],
["03","PLACAS E SINALIZAÇÃO","Informação clara com identidade","public/assets/semana-2026-09-28/03-adesivos.webp"],
["04","IMPRESSOS","Sua marca também no papel","public/assets/semana-2026-09-28/04-papelaria.webp"],
["05","PROJETO COMPLETO","Do conceito à instalação","public/assets/semana-2026-09-28/05-banners.webp"]];
await fs.mkdir("public/assets/semana-2026-10-05-final",{recursive:true});
for(const [n,t,sub,ref] of items){
 const overlay=Buffer.from(`<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg"><rect y="0" width="1080" height="290" fill="#f5f3ed" opacity=".94"/><rect x="55" y="60" width="720" height="105" rx="8" fill="#78d4d1"/><text x="75" y="137" font-family="Arial" font-size="58" font-weight="900" fill="#171717">${t}</text><text x="75" y="225" font-family="Arial" font-size="35" font-weight="700" fill="#202020">${sub}</text><path d="M0 790L1080 565V1080H0Z" fill="#11aeb0" opacity=".94"/><text x="75" y="900" font-family="Arial" font-size="30" font-weight="900" fill="white">VENHA FAZER UM ORÇAMENTO</text><text x="75" y="970" font-family="Arial" font-size="55" font-weight="900" fill="white">17 99137-6531</text></svg>`);
 const logo=await sharp("public/assets/immagine-logo.png").resize({width:260,height:120,fit:"inside"}).png().toBuffer();
 await sharp(ref).resize(1080,1080,{fit:"cover"}).composite([{input:overlay},{input:logo,left:760,top:805}]).webp({quality:92}).toFile(`public/assets/semana-2026-10-05-final/${n}.webp`);
}
console.log("5 artes geradas");