#前端项目自动构建配置
#!/bin/bash
WORK_PATH='/usr/projects/cha/cha-vue'
cd $WORK_PATH
echo "清理代码"
git reset --hard origin/master
git clean -f
echo "拉取最新代码"
git pull origin master
echo "下载项目依赖"
cnpm install
echo "打包项目"
npm run build
echo "删除旧容器"
docker stop cha-vue-container
docker rm cha-vue-container
echo "删除旧镜像"
docker rmi cha-vue:1.0.0
echo "开始构建新镜像"
docker build -t cha-vue:1.0.0 .
echo "启动新容器"
docker container run -p 81:80 -dit --name cha-vue-container cha-vue:1.0.0