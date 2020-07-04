<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>My first three.js app</title>
    <style>
        body {
            margin: 0;
        }
        
        canvas {
            width: 100%;
            height: 100%
        }

        .contain {
            width: 300px;
            padding-top: 100px;
            float: right;
        }

        .buttonLine {
            width: 100%;
            height: 50px;
        }

        .button {
            width: 80px;
            height: 30px;
            padding: 1px;
            float: left;
            background-color: rgb(42, 161, 165);
            text-align: center;
            line-height: 30px;
            cursor: pointer;
        }

        .button:hover {
            background-color: rgb(43, 194, 199);
        }

        .input {
            width: 150px;
            height: 30px;
            margin-left: 20px;
            border: 0;
            background-color: rgb(199, 199, 199);
            float: left;
        }
        
        body > div.scene > canvas {
            float:left;
        }

        .show {
            width: 60px;
            height: 82px;
            float: left;
            background-color: rgb(228, 228, 228);
            text-align: center;
            line-height: 80px;
            font-size: 48px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        .me {
            color: red;
        }
        .label {
            width: 80px;
            height: 80px;
            float: left;
            text-align: center;
            line-height: 80px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        .roomId {
            width: 150px;
            height: 30px;
            margin-left: 20px;
            border: 0;
            background-color: rgb(199, 199, 199);
            float: left;
            padding: 1px;
            line-height: 31px;
        }
    </style>
</head>

<body>
    <div class="scene">
        <div class="contain">
            <div class="buttonLine">
                <div class="button"onclick="connect()">
                    连接服务器
                </div>
                <input class="input"type="text"id="userName"placeholder="输入用户名">
            </div>
            <div class="buttonLine">
                <div class="button"onclick="createRoom()">
                    创建房间
                </div>
                <div class="roomId"id="roomIdShow"></div>
            </div>
            <div class="buttonLine">
                <div class="button"onclick="joinRoom()">
                    加入房间
                </div>
                <input class="input"type="text"id="roomId"placeholder="输入房间号">
            </div>
            <div>
                <div class="label">我方得分</div>
                <div class="show me" id="me">
                    0
                </div>
                <div class="show" id="other">
                    0
                </div>
                <div class="label">对方得分</div>
            </div>
            <div class="buttonLine">
                <div class="button"onclick="one()">
                    单机练习
                </div>
            </div>
        </div>
    </div>
    <script src="basejs/socket.io.js"></script>
    <script>
        if ("WebSocket" in window)  console.log("您的浏览器支持WebSocket");　　　
        else  console.log("您的浏览器不支持WebSocket");　　
        var socket = io.connect('/ws');

        socket.on('create_room', function(data) {
            console.log('房间号:', data)
            document.querySelector('#roomIdShow').innerHTML = data
        });
        
        socket.on('join_room', function(data) {
            console.log(data+'加入了房间')
            alert(data+'加入了房间')
            restart();
        });
        var frameTimer = 0;
        var pengTime = 0;
        socket.on('operate', function(data) {
            let otherPlayer = player2
            if(currentPlayer == player2)otherPlayer = player1;
            otherPlayer.position.copy(data['playerPosition'])
        })

        socket.on('peng', function(data) {
            aimV.copy(data['aimV'])
            aim.position.copy(data['aimPosition'])
            messageFlag = true;
            lock = false;
            console.log(data)
        })

        var isConnect = false;
        var frameCount = 0;
        var messageFlag = true;
        var lock = true;
        function connect() {
            let name = document.querySelector('#userName').value;
            if(name!=''){
                socket.emit('my_name', name);
                isConnect = true;
            }
            else
                alert('用户名未定义');
        }

        function createRoom() {
            if(isConnect){
                socket.emit('create_room');
            }
            else
                alert('先连接服务器');
        }

        function joinRoom() {
            let room = document.querySelector('#roomId').value;
            if(room!=''){
                socket.emit('join_room', room);
                currentPlayer = player2;
                currentCamera = camera2;
            }
            else
                alert('房间号未输入');
        }

        function operate() {
            socket.emit('operate', {
                'playerPosition': currentPlayer.position,
            })
        }

        function peng() {
            socket.emit('peng', {
                'aimPosition': aim.position,
                'aimV': aimV,
            })
        }
        var isone = false;
        function one() {
            isone = true;
            aim.position.set(0,0,aim.position.z);
            aimV.set(0,0,0);
            restartTime = true;
            scoreFlag = true;
            animateId = requestAnimationFrame(animateLoop);
        }
    </script>
    <script src="basejs/three.js"></script>
    <script src="basejs/physi.js"></script>
    <script>
        Physijs.scripts.worker = "basejs/physijs_worker.js";
        Physijs.scripts.ammo = "ammo.js";
        var scene = new Physijs.Scene();
        var camera0 = new THREE.PerspectiveCamera(75, (window.innerWidth-350) / window.innerHeight, 0.1, 1000);
        var camera1 = new THREE.PerspectiveCamera(75, (window.innerWidth-350) / window.innerHeight, 0.1, 1000);
        var camera2 = new THREE.PerspectiveCamera(75, (window.innerWidth-350) / window.innerHeight, 0.1, 1000);
        var renderer = new THREE.WebGLRenderer();
        scene.setGravity(new THREE.Vector3(0, 0, -100));
        renderer.setSize(window.innerWidth-350, window.innerHeight);
        document.querySelector('.scene').appendChild(renderer.domElement);
        var geometry = new THREE.CylinderGeometry(30, 30, 10, 32);
        var friction = 0.2; // 摩擦度
        var restitution = 0.8; // 恢复度
        var plane = new THREE.Plane(new THREE.Vector3(0, 0, -1),20);
        var material = new THREE.MeshBasicMaterial({
            color: 0xffff00
        });
        var phyMaterial = Physijs.createMaterial(
            material,
            friction,
            restitution
        );
        var mesh = new Physijs.BoxMesh(
            new THREE.CubeGeometry( 5, 5, 5 ),
            phyMaterial
        );
        var aim = new Physijs.CylinderMesh(geometry, material);
        friction = 0.7
        geometry = new THREE.CylinderGeometry(40, 40, 10, 32);
        material = new THREE.MeshBasicMaterial( {color: 0x484848,side:THREE.DoubleSide} );
        phyMaterial = Physijs.createMaterial(
            material,
            friction,
            restitution
        );
        var player1 = new Physijs.CylinderMesh(geometry, phyMaterial);
        var player2 = new Physijs.CylinderMesh(geometry, phyMaterial);
        player1.position.y = -300;
        player2.position.y = 300;
        player1.rotation.x = Math.PI/2;
        player2.rotation.x = Math.PI/2;
        player1.position.z = 20;
        player2.position.z = 20;
        aim.rotation.x = Math.PI/2;
        aim.position.z = 20;
        player1.name = 'player1'
        player2.name = 'player2'
        aimV = new THREE.Vector3(0, 0, 0);

        geometry = new THREE.BoxGeometry(600, 1000, 20);
        material = new THREE.MeshBasicMaterial( {color: 0xC0C0C0} );
        var table = new Physijs.BoxMesh(geometry, material, 0);
        scene.add(player1)
        scene.add(player2)
        scene.add(aim)
        scene.add(table);
        camera0.position.z = 800;

        material = new THREE.MeshBasicMaterial( {color: 0xFFFFFF} );
        geometry = new THREE.BoxGeometry(20, 1020, 50);
        var cube_side1 = new Physijs.BoxMesh(geometry, material, 0);
        cube_side1.position.x = -300;
        cube_side1.position.z = 10;
        scene.add(cube_side1);
        geometry = new THREE.BoxGeometry(20, 1020, 50);
        var cube_side2 = new Physijs.BoxMesh(geometry, material, 0);
        cube_side2.position.x = 300;
        cube_side2.position.z = 10;
        scene.add(cube_side2);

        geometry = new THREE.BoxGeometry(200, 20, 50);
        var cube_back1 = new Physijs.BoxMesh(geometry, material, 0);
        cube_back1.position.x = -200;
        cube_back1.position.y = 500;
        cube_back1.position.z = 10;
        scene.add(cube_back1);
        var cube_back2 = new Physijs.BoxMesh(geometry, material, 0);
        cube_back2.position.x = 200;
        cube_back2.position.y = 500;
        cube_back2.position.z = 10;
        scene.add(cube_back2);
        var cube_back3 = new Physijs.BoxMesh(geometry, material, 0);
        cube_back3.position.x = 200;
        cube_back3.position.y = -500;
        cube_back3.position.z = 10;
        scene.add(cube_back3);
        var cube_back4 = new Physijs.BoxMesh(geometry, material, 0);
        cube_back4.position.x = -200;
        cube_back4.position.y = -500;
        cube_back4.position.z = 10;
        scene.add(cube_back4);

        camera1.lookAt(0, 2, -3.4);
        camera1.position.z = 500;
        camera1.position.y = -500;
        
        camera2.lookAt(0, -2, -3.4);
        camera2.position.z = 500;
        camera2.position.y = 500;
        camera2.rotation.z = Math.PI
        //燈光
        var spotLight = new THREE.SpotLight( 0xffffff );
        spotLight.position.set(0, 50, 100);

        spotLight.castShadow = true;

        spotLight.shadow.camera.near = 50;
        spotLight.shadow.camera.far = 150;
        spotLight.shadow.camera.fov = 30;

        var currentCamera = camera1;
        var currentPlayer = player1;
        spotLight.target = currentPlayer;

        scene.add( spotLight );
    </script>
    
    <script>
        var	raycaster = new THREE.Raycaster();

        var score = {
            'player1': 0,
            'player2': 0
        };

        var restartTime = true;
        var scoreFlag = true;
        var	mouse = new THREE.Vector2();
        document.addEventListener('mousemove', onDocumentMouseMove, false);
 
        function onDocumentMouseMove(event) {
		    event.preventDefault();
		    mouse.x = (event.clientX / (window.innerWidth-350)) * 2 - 1;
		    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        }

        var INTERSECTED;
        var positionQueue1 = [player1.position, player1.position];
        var positionQueue2 = [player2.position, player2.position];
        var count = 0;

        function animate() {
            var po;
            var th;
            if(currentPlayer == player1) {
                po = positionQueue1;
                th = positionQueue2
            } else {
                po = positionQueue2
                th = positionQueue1
            }
            renderer.render(scene, currentCamera);
            raycaster.setFromCamera(mouse, currentCamera);
            var intersects = raycaster.intersectObjects(scene.children);
            if (isDown) {
                if (intersects.length > 2) {
                    calculate(po)
                    INTERSECTED = true;
                } else {
                    if(INTERSECTED){
                        calculate(po)
                    }
                }
            } else {
                po.pop();
                po.unshift(player1.position)
            }
            if(isone){
                judge()
            }
            th.pop();
            th.unshift(player2.position);
            let playerV1 = new THREE.Vector3((positionQueue1[0].x - positionQueue1[1].x),(positionQueue1[0].y - positionQueue1[1].y),0);
            let playerV2 = new THREE.Vector3((positionQueue2[0].x - positionQueue2[1].x),(positionQueue2[0].y - positionQueue2[1].y),0);
            if(isone){
                let aV = Math.sqrt(playerV2.x*playerV2.x + playerV2.y*playerV2.y)
                if(aV < 10){
                    playerV2.set(playerV2.x*15/aV,playerV2.y*15/aV,0)
                }
            }
            loss();
            frameTimer += 1;
            pengzhuang(aim,playerV1,playerV2);
            
            if(lock) aimV.set(0,0,0);
            aimMove(aim);
            animateId = requestAnimationFrame(animateLoop);
            if(aim.position.x>320||aim.position.x<-320||aim.position.y>520||aim.position.y<-520) restart();
        }
        var rX = 0;
        var rY = 0;
        function judge(){
            let maxSpeed = 10;  
            if(aim.position.y > 0){
                if(aimV.y > 0){
                    let x = player2.position.x
                    let y = player2.position.y
                    for(let i=0;i<500;i++){
                        let yy = 0
                        if(i*aimV.x > 0)
                            yy = aimV.y
                        else
                            yy = -aimV.y
                        if(Math.abs((aimV.y/aimV.x)*((x+i*yy) - aim.position.x)-((y+Math.abs(i*aimV.x))-aim.position.y))<20){
                            rX = x+i*yy
                            rY = y+Math.abs(i*aimV.x)
                            break
                        }
                        x += i*aimV.x
                        y += i*aimV.y
                    }
                }
                if(aimV.x<2 && aimV.y<2){
                    rX = aim.position.x
                    rY = aim.position.y + 10
                }
                if(rY<20)rY = 20;
                if(rY>450)rY = 450;
            
                if(rX>250)rX = 250;
                if(rX<-250)rX = -250;
                playerMove(rX,rY)
            } else {
                playerMove(0, 300)
            }
        }

        function playerMove(x, y){
            let maxSpeed = 10; 
            if(player2.position.x > x + maxSpeed)
                player2.position.x -= maxSpeed
            if(player2.position.x < x - maxSpeed)
                player2.position.x += maxSpeed
            if(player2.position.y > y + maxSpeed)
                player2.position.y -= maxSpeed 
            if(player2.position.y < y - maxSpeed)
                player2.position.y += maxSpeed 
            if(player2.position.y > y - maxSpeed && player2.position.y < y + maxSpeed)
                player2.position.y = y
            if(player2.position.x > x - maxSpeed && player2.position.x < x + maxSpeed)
                player2.position.x = x
        }
        function calculate(positionQueue){
            let target = new THREE.Vector3(0, 0, 0);
            raycaster.ray.intersectPlane (plane, target);
            playerCon(target);
            positionQueue.pop();
            positionQueue.unshift(target);
            
            operate();
            let playerV = new THREE.Vector3((positionQueue[0].x - positionQueue[1].x),(positionQueue[0].y - positionQueue[1].y),0);
            currentPlayer.position.copy(target); 
        }

        function playerCon(target){
            if(currentPlayer == player1){
                if(target.y>-20)target.y = -20;
                if(target.y<-450)target.y = -450;
            } else {
                if(target.y<20)target.y = 20;
                if(target.y>450)target.y = 450;
            }
            if(target.x>250)target.x = 250;
            if(target.x<-250)target.x = -250;
        }

        function aimMove(aim){
            aim.position.set(aim.position.x+aimV.x,aim.position.y+aimV.y,aim.position.z);
        }

        function loss(){
            aimV.set(aimV.x*0.99,aimV.y*0.99,aimV.z);
        }

        function myMax(l){
            let temp = 0;
            for(let i=0;i<l.length;i++){
                if(Math.abs(l[i])>temp)temp = Math.abs(l[i])
            }
            return temp
        }

        var animateLoop = animate.bind();
        var animateId;
        function restart(){
            if(restartTime){
                setTimeout(function(){
                    aim.position.set(0,0,aim.position.z);
                    aimV.set(0,0,0);
                    restartTime = true;
                    scoreFlag = true;
                    animateId = requestAnimationFrame(animateLoop);
                }, 2000)
                restartTime = false;
            }
        }

        function addScore(p){
            score[p] += 1;
            if(p === currentPlayer.name) document.querySelector('#me').innerHTML = score[p]
            else document.querySelector('#other').innerHTML = score[p]
        }

        function pengzhuang(aim, playerV1,playerV2){
            let vMAX = myMax([playerV1.x, playerV1.y, aimV.x, aimV.y, playerV2.x, playerV2.y])
            if(vMAX == 0) return
            let pV1 = Math.sqrt(playerV1.x*playerV1.x + playerV1.y*playerV1.y)
            let pV2 = Math.sqrt(playerV2.x*playerV2.x + playerV2.y*playerV2.y)
            let aV = Math.sqrt(aimV.x*aimV.x + aimV.y*aimV.y)
            let pP1 = new THREE.Vector3
            let pP2 = new THREE.Vector3
            let aP = new THREE.Vector3
            pP1.copy(player1.position)
            pP2.copy(player2.position)
            aP.copy(aim.position)
            messageFlag = true;
            for(let i=0;i<=vMAX;i++){
                pP1.x += playerV1.x/vMAX;
                pP1.y += playerV1.y/vMAX;
                pP2.x += playerV2.x/vMAX;
                pP2.y += playerV2.y/vMAX;
                aP.x += aimV.x/vMAX;
                aP.y += aimV.y/vMAX;
                if(Math.pow(pP1.x - aP.x,2)
                +Math.pow(pP1.y - aP.y,2)
                <=Math.pow(70,2)&&messageFlag){
                    console.log(111)
                    if(playerV1.x == 0&&playerV1.y == 0){
                        var pJiao1 = -1
                    } else {
                        var pJiao1 = (playerV1.x*(aP.x-pP1.x)+playerV1.y*(aP.y-pP1.y))
                        /(Math.sqrt(playerV1.x*playerV1.x+playerV1.y*playerV1.y)*
                        Math.sqrt(Math.pow(pP1.x - aP.x,2)+Math.pow(pP1.y - aP.y,2)))      
                    }
                    let aimX = (aP.x - pP1.x)/Math.sqrt(Math.pow(pP1.x - aP.x,2)
                    +Math.pow(pP1.y - aP.y,2))
                    let aimY = (aP.y - pP1.y)/Math.sqrt(Math.pow(pP1.x - aP.x,2)
                    +Math.pow(pP1.y - aP.y,2))
                    let t = Math.atan((aP.y - pP1.y)/(aP.x - pP1.x))
                    if(aimV.x == 0&&aimV.y == 0){
                        var aJiao1 = -1
                    } else {
                        var aJiao1 = (aimV.x*(pP1.x - aP.x)+aimV.y*(pP1.y - aP.y))     
                    }
                    if(aJiao1>0)
                        aimV.set(-aimV.x*Math.cos(2*t)-aimV.y*Math.cos(2*t-Math.PI/2),-aimV.x*Math.sin(2*t)-aimV.y*Math.sin(2*t-Math.PI/2),0)//球自己的动量
                    if(pJiao1>0)
                        aimV.set(aimV.x+aimX*pV1*pJiao1+3,aimV.y+aimY*pV1*pJiao1+3,0)//手柄动量传递
                    aV = Math.sqrt(aimV.x*aimV.x + aimV.y*aimV.y)
                    if(aV > 15){
                        aimV.set(aimV.x*15/aV,aimV.y*15/aV,0)
                    }
                    if(currentPlayer == player1)
                        peng()
                        
                    lock = true
                    messageFlag = false
                    if(isone){
                        lock = false
                        messageFlag = true
                    }
                }
                if(Math.pow(pP2.x - aP.x,2)
                +Math.pow(pP2.y - aP.y,2)
                <=Math.pow(70,2)&&messageFlag){
                    console.log(11)
                    if(playerV2.x == 0&&playerV2.y == 0){
                        var pJiao2 = -1
                    } else {
                        var pJiao2 = (playerV2.x*(aP.x-pP2.x)+playerV2.y*(aP.y-pP2.y))
                        /(Math.sqrt(playerV2.x*playerV2.x+playerV2.y*playerV2.y)*
                        Math.sqrt(Math.pow(pP2.x - aP.x,2)+Math.pow(pP2.y - aP.y,2)))      
                    }
                    let aimX = (aP.x - pP2.x)/Math.sqrt(Math.pow(pP2.x - aP.x,2)
                    +Math.pow(pP2.y - aP.y,2))
                    let aimY = (aP.y - pP2.y)/Math.sqrt(Math.pow(pP2.x - aP.x,2)
                    +Math.pow(pP2.y - aP.y,2))
                    let t = Math.atan((aP.y - pP2.y)/(aP.x - pP2.x))
                    if(aimV.x == 0&&aimV.y == 0){
                        var aJiao2 = -1
                    } else {
                        var aJiao2 = (aimV.x*(pP2.x - aP.x)+aimV.y*(pP2.y - aP.y)) 
                    }
                    if(aJiao2>0)
                        aimV.set(-aimV.x*Math.cos(2*t)-aimV.y*Math.cos(2*t-Math.PI/2),-aimV.x*Math.sin(2*t)-aimV.y*Math.sin(2*t-Math.PI/2),0)//球自己的动量
                    if(pJiao2>0)
                        aimV.set(aimV.x+aimX*pV2*pJiao2+3,aimV.y+aimY*pV2*pJiao2+3,0)//手柄动量传递
                    aV = Math.sqrt(aimV.x*aimV.x + aimV.y*aimV.y)
                    if(aV > 15){
                        aimV.set(aimV.x*15/aV,aimV.y*15/aV,0)
                    }
                    if(currentPlayer == player2)
                        peng()
                    lock = true
                    messageFlag = false
                    if(isone){
                        lock = false
                        messageFlag = true
                    }
                }
                if(aP.x>=255&&aP.x<=257){
                    aimV.set(-Math.abs(aimV.x),aimV.y,0);
                }
                if(aP.x<=-255&&aP.x>=-257)aimV.set(Math.abs(aimV.x),aimV.y,0);
                
                if(aP.y>=465&&aP.y<=467&&(aP.x<-86||aP.x>86))aimV.set(aimV.x,-Math.abs(aimV.y),0);
            
                if(aP.y<=-465&&aP.y>=-467&&(aP.x<-86||aP.x>86))aimV.set(aimV.x,Math.abs(aimV.y),0);
                
                if(aP.y>=455&&aP.y<500&&(aP.x>=-86&&aP.x<=-84))aimV.set(Math.abs(aimV.x),aimV.y,0);
                
                if(aP.y<=-455&&aP.y>=-500&&(aP.x>=-86&&aP.x<=-84))aimV.set(Math.abs(aimV.x),aimV.y,0);
                
                if(aP.y>=455&&aP.y<=500&&(aP.x>=84&&aP.x<=86))aimV.set(-Math.abs(aimV.x),aimV.y,0);
                
                if(aP.y<=-455&&aP.y>=-500&&(aP.x>=84&&aP.x<=86))aimV.set(-Math.abs(aimV.x),aimV.y,0);
                
                if(aP.y<=-470&&aP.x<=85&&aP.x>=-85&&scoreFlag){
                    addScore('player2');
                    scoreFlag = false;
                }
                if(aP.y>=470&&aP.x<=85&&aP.x>=-85&&scoreFlag){
                    addScore('player1');
                    scoreFlag = false;
                }
            }
        }
        
        var isDown = false;
        window.onmousedown = function(e){
            isDown = true;
        }

        window.onmouseup = function(e){
            isDown = false;
            INTERSECTED = false;
        }

    </script>
    
</body>
</html>