const http = require('http')
let crypto = require('crypto');
//开启进程
var spawn = require('child_process').spawn;
let sendMail = require('./sendMail');
//在github上配置webhooks时输入的secret
const SECRET = '123456';
//配置数据加密方法
function sign(data) {
    return 'sha1=' + crypto.createHmac('sha1', SECRET).update(data).digest('hex')
}

const server = http.createServer((req, res) => {
    console.log('------------分割线开始-------------');
    console.log('方法：', req.method, '路径：', req.url);

    if (req.method === 'POST' && req.url == '/webhook') {
        console.log('请求成功');
        let buffers = [];
        //接收github传递的数据（请求体）
        req.on('data', function (data) {
            console.log('接收github请求体数据');
            buffers.push(data);
        });
        req.on('end', function () {
            console.log('接收github请求体数据完成');
            let body = Buffer.concat(buffers);
            //获取github传递过来的请求头信息
            let sig = req.headers['x-hub-signature'];
            let event = req.headers['x-github-event'];
            let id = req.headers['x-github-delivery'];
            //判断github传递的签名是否符合要求
            if (sig !== sign(body)) {
                console.log('签名验证失败-签名不正确');
                console.log('github签名：', sig, '自己的签名：', sign(body))
                return res.end('Not Allowed');
            }
            console.log('签名验证成功-签名正确');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ "ok": true }));
            //判断是否是push项目到仓库
            if (event === 'push') {
                console.log('push代码到仓库操作执行');
                let payload = JSON.parse(body);
                //开启进程处理执行对应项目的脚本（第一个参数是命令，第二个参数是文件名）
                console.log(`开始执行脚本文件${payload.repository.name}.sh`);
                let child = spawn('sh', [`./${payload.repository.name}.sh`]);
                let buffers = [];
                //获取执行脚本的进程传递回来的信息（项目构建部署信息）
                child.stdout.on('data', function (buffer) { buffers.push(buffer) });
                child.stdout.on('end', function () {
                    let logs = Buffer.concat(buffers).toString();
                    console.log('获取到执行脚本传递回来的信息');
                    //将部署信息整合发邮件通知
                    sendMail(`
                        <h1>部署日期: ${new Date()}</h1>
                        <h2>部署人: ${payload.pusher.name}</h2>
                        <h2>部署邮箱: ${payload.pusher.email}</h2>
                        <h2>提交信息: ${payload.head_commit && payload.head_commit['message']}</h2>
                        <h2>布署日志: ${logs.replace("\r\n", '<br/>')}</h2>
                    `);
                });
            }
        })

    } else {
        res.end('Not Found!');
    }
})

server.listen(4001, () => {
    console.log('webhook on 4001....');
})