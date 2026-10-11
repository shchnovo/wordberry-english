import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const out=path.join(root,'dist');
await fs.mkdir(out,{recursive:true});
for(const f of ['index.html','styles.css','app.js','favicon.svg'])await fs.copyFile(path.join(root,'src',f),path.join(out,f));
const data=await fs.readFile(path.join(root,'data/course.json'),'utf8');
await fs.writeFile(path.join(out,'course.js'),'window.WORD_COURSE = '+data+';\n');
const core=await fs.readFile(path.join(root,'shared/core.mjs'),'utf8');
const names=[...core.matchAll(/export (?:const|function) ([\w]+)/g)].map(m=>m[1]);
await fs.writeFile(path.join(out,'core.js'),'(function(){\n'+core.replace(/export /g,'')+'\nwindow.WordCore={'+names.join(',')+'};\n})();\n');
let html=await fs.readFile(path.join(root,'src/index.html'),'utf8');
const styles=await fs.readFile(path.join(root,'src/styles.css'),'utf8');
html=html.replace('<link rel="stylesheet" href="styles.css">',()=>'<style>'+styles+'</style>');
for(const f of ['course.js','core.js','app.js']){
 const code=(await fs.readFile(path.join(out,f),'utf8')).replaceAll('</script','<\\/script');
 // Callback avoids treating dollar tokens in source code as replace patterns.
 html=html.replace('<script src="'+f+'" defer></script>',()=>'<script>'+code+'</script>');
}
html=html.replace('<script>','<script>window.WORDLAB_STANDALONE=true;</script><script>');
const favicon=(await fs.readFile(path.join(root,'src/favicon.svg'))).toString('base64');
html=html.replace('href="favicon.svg"',()=>`href="data:image/svg+xml;base64,${favicon}"`);
await fs.writeFile(path.join(root,'wordberry-preview.html'),html);
console.log('Built dist/ and wordberry-preview.html');
