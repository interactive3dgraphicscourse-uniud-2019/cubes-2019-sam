
var scene, camera, renderer, controls, stats;

function Start() {
    scene = new THREE.Scene();
    blank_scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 500 );

    renderer = new THREE.WebGLRenderer( {antialias: true} );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor("hsl(204, 100%, 60%)");
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.Soft = true;
    renderer.shadowMap.Darkness = 0.001; //non funziona
    document.body.appendChild( renderer.domElement );
    
    camera.position.set(14,5,0);
    var camera_target = new THREE.Vector3(0,0,-10);
    camera.lookAt(camera_target); // non funziona
    
    // var geometry = new THREE.BoxGeometry(1,1,1);
    // var material = new THREE.MeshPhongMaterial( { color: 0xff0000 } );
    // var cube1 = new THREE.Mesh( geometry, material );
    // cube1.castShadow = true;
    // cube1.receiveShadow = true;
    
    scene.add(nuvola, chiocciola, siepe ,muro, piede);

    hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, .7 );
    //hemiLight.color.setHSL( 0.6, 1, 0.6 );
    hemiLight.groundColor.setHSL( 0.095, 1, .75);
    hemiLight.position.set( 0, 500, 0 );
    scene.add( hemiLight );

    dirLight = new THREE.DirectionalLight( 0xffffff,.5 );
    dirLight.color.setHSL( 0.1, 1, 0.95 );
    dirLight.position.set(-10,70,40);
    dirLight.target.position.set(10,10,20);
    scene.add( dirLight , dirLight.target);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.left = -30;
    dirLight.shadow.camera.bottom = -30;
    dirLight.shadow.camera.right = 30;
    dirLight.shadow.camera.top = 30;
    //dirLight.shadow.camera.scale.multiplyScalar(10);
    // console.log(dirLight);
    // const cameraHelper = new THREE.CameraHelper(dirLight.shadow.camera);
    // scene.add(cameraHelper);


    // GROUND
    var groundGeo = new THREE.PlaneBufferGeometry( 10000, 10000 );
    var groundMat = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x050505 } );
    groundMat.color.set(green_ter);
    var ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = 0;
    ground.rotation.x = -Math.PI/2;
    scene.add( ground );
    ground.receiveShadow = true;
    
    // stats = new Stats();
    // stats.domElement.style.position = 'absolute';
    // stats.domElement.style.top = '0px';
    // document.body.appendChild( stats.domElement );

    capturer = new CCapture( { format: 'png' } ); // per catturare i fotogrammi
}

document.addEventListener('keydown', ReadInput);
function ReadInput(input){
    if(input.key == " "){
        capturer.start();
    }
    if(input.key == "Enter"){
        capturer.stop();
        capturer.save();
    }
}



// controls = new THREE.OrbitControls( camera );
// flag_controls = 0;
// document.addEventListener('keydown', ReadInput);
// function ReadInput(input){
//     if(input.key == " "){
//         controls.addEventListener( 'change', Render );
//         flag_controls = 1;
//     }
// }

function Oscilla(obj, dir, ref_pos, A, omega, time){
    var displacement = dir.clone();
    displacement.multiplyScalar(A*Math.sin(omega*time));
    var newposition = ref_pos.clone();
    newposition.add(displacement);
    obj.position.copy(newposition);
}


var inizio=Date.now();
var flag_capture = 0;
t_avvicina = 11000;
t_sguardo = t_avvicina+2000;
t_cameraUp = t_sguardo + 2500;
t_cambio1 = t_cameraUp + 2000;
t_end = t_cambio1+5000;

i_fisso = 1000;

function Update() {
    var time = Date.now() - inizio;
    requestAnimationFrame( Update );
    if(time < t_avvicina) {
        chiocciola.position.add(asse_chiocciola.clone().multiplyScalar(.04));
        Oscilla(occhi, asse_chiocciola, pos_occhi, .1, .003, time);
        Oscilla(guscio, asse_chiocciola, pos_guscio, .3, .003, time);
        camera.position.z += .04;
        renderer.render(scene, camera);
    }
    if(time < t_sguardo && time > t_avvicina) {
        occhi.rotation.x -=.01; //meglio usare le posizioni relative
        occhi.position.y += .002;
        renderer.render(scene, camera);
    }
    if(time < t_cameraUp && time > t_sguardo) {
        camera.rotation.y += .014;
        camera.rotation.x -= .0075;
        camera.position.x -= .04;
        renderer.render(scene, camera);
    }
    if(time > t_cameraUp+i_fisso && time < t_cambio1) {//metti un flag per non ripetere
        occhi.rotation.x = 0;
        occhi.position.copy(pos_occhi);
        chiocciola.rotation.x = -Math.PI/2;  
        chiocciola.position.set(15,18,29.5);
        camera.position.set(17,25,21);
        camera.lookAt(chiocciola.position.clone().add(new THREE.Vector3(2,3,0)));
        renderer.setClearColor("hsl(204, 100%, 0%)"); 
        renderer.render(blank_scene, camera);
    }
    if(time > t_cambio1 && time < t_end) {
        renderer.setClearColor("hsl(204, 100%, 60%)"); //metti un flag per non ripetere
        renderer.render(scene, camera);
        Oscilla(occhi, asse_chiocciola, pos_occhi, .1, .003, time);
        Oscilla(guscio, asse_chiocciola, pos_guscio, .3, .003, time);
    }if(time > t_end) {
        renderer.setClearColor("hsl(204, 100%, 0%)"); //metti un flag per non ripetere
        renderer.render(blank_scene, camera);
    }
    capturer.capture( renderer.domElement );
}

function Render() {
    renderer.render(scene, camera);
}

Start();
Update();
