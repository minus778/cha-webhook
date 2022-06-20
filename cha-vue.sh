#前端项目自动构建配置
#!/bin/bash
WORK_PATH='/usr/projects/cha/cha-vue'
cd $WORK_PATH
echo "清理代码"
git reset --hard origin/master
git clean -f
echo "拉取最新代码"
git pull origin master
echo "打包最新代码"
npm run build
echo "开始构建镜像"
docker build -t cha-vue:1.0 .
echo "删除旧容器"
docker stop cha-vue-container
docker rm cha-vue-container
echo "启动新容器"
docker container run -p 81:80 -d --name cha-vue-container cha-vue:1.0