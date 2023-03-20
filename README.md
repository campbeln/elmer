# Elmer
API Microservices Architecture utilizing a facade that manages security and routing via reverse proxy hosted under Docker containers.



## Setup
Install Docker Desktop or Rancher Desktop, configure per standard configuration (including adding commands to your system's `PATH`) then startup your Docker server.

Run the following commands first for your Elmer Facade then for each of your Child API's:
```sh
chmod 755 _tools.sh
./_tools.sh --update
./_tools.sh --rebuild
```



## JWT Secret Generation
Run one of the following commands in order to generate a JWT secret:
```Javascript
node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"
node -e "console.log(require('crypto').randomBytes(128).toString('base64'));"
```



## Versions
### Elmer Facade
You can run `./_tools.sh --setup=base` or run the following code:
```sh
rm -R ./app/childapi/
```

### Child API
You can run `./_tools.sh --setup=child` or run the following code:
```sh
rm -R ./app/middleware
rm ./app/routes/elmer.js
rm ./app/routes/login.js
rm ./app/app-ex.js
mv ./app/childapi/app-ex.js ./app/app-ex.js
mv ./app/childapi/config/base.js ./app/config/base.json
mv ./app/childapi/routes/example.js ./app/routes/example.js
rm -R ./app/childapi
```



## License: MIT
Copyright: (c) 2014-2023 Nicholas Campbell
