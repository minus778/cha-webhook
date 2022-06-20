#webhook项目自动构建配置
#!/bin/bash
WORK_PATH='/usr/projects/cha/cha-webhook'
cd $WORK_PATH
echo "清理代码"
git reset --hard origin/master
git clean -f
echo "拉取最新代码"
git pull origin master
echo "开始构建镜像"
docker build -t cha-webhook:1.0.0 .
echo "删除旧容器"
docker stop cha-webhook-container
docker rm cha-webhook-container
echo "启动新容器"
docker container run -p 4001:4000 -d --name cha-webhook-container cha-webhook:1.0.0