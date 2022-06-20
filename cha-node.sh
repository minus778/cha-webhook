#后端项目自动构建配置
#!/bin/bash
WORK_PATH='/usr/projects/cha/cha-node'
cd $WORK_PATH
echo "清理代码"
git reset --hard origin/master
git clean -f
echo "拉取最新代码"
git pull origin master
echo "开始构建镜像"
docker build -t cha-node:1.0.0 .
echo "删除旧容器"
docker stop cha-node-container
docker rm cha-node-container
echo "启动新容器"
docker container run -p 3001:3001 -d --name cha-node-container cha-node:1.0.0