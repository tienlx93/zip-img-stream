# Requirement
NodeJS LTS

# Installation
Clone app
```shell
git clone https://github.com/tienlx93/zip-img-stream.git
cd zip-img-stream
npm install
```

Using PM2
```shell
sudo npm install pm2 -g
```

# Usage
Environment:
```shell
export ROOT_DIR='/path/to/zip/container'
```


Run with command:
```shell
npm start
```

Run with pm2:
```shell
pm2 start ./bin/www
```