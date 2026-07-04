const fs=require('fs');
let html=fs.readFileSync('index.template.html','utf8');
let css=fs.readFileSync('styles.css','utf8');
let js=fs.readFileSync('app.js','utf8');
js=js.replace(/<\/script>/g,'<\/script>'); // guard against early script close
html=html.replace(/[ \t]*<link rel="stylesheet" href="\.\/styles\.css"\s*\/>/, '  <style>\n'+css+'\n  </style>');
html=html.replace(/[ \t]*<script src="\.\/app\.js"><\/script>/, '  <script>\n'+js+'\n  </script>');
fs.writeFileSync('index.html',html);
console.log('built index.html chars:', html.length, '| hasStyle:', html.includes('<style>'), '| inlineScript:', html.includes('paintIcons'));
