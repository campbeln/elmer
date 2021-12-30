# baseapijwt

Setup:
========
sudo npm cache clean -f
sudo npm install -g n
sudo n stable

npm init
npm install --save express
npm install --save compression
npm install --save formidable
npm install --save body-parser
npm install --save cookie-parser
npm install --save jsonwebtoken

npm install --save xmlhttprequest
npm install --save node-fetch-commonjs

node index.js

JWT Secret Generation:
========
node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"
node -e "console.log(require('crypto').randomBytes(128).toString('base64'));"

========
========

License: MIT

Copyright: (c) 2014-2021 Nicholas Campbell
