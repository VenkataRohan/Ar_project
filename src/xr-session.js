import * as THREE from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Vector2, Vector3 } from 'three/build/three.module';
var parea = require('area-polygon')
let container, labelContainer;
let camera, scene, renderer, light;
let controller;
let runm
let ooo=0
let hitTestSource = null;
let hitTestSourceRequested = false;
let textt,tarr
let measurements = [];
let firstpt
let area = [];
let labels = [];
let center=[]
let fg=1;
let fga=0
let reticle;
let currentLine = null;

let width, height;


function toScreenPosition(point, camera)
{
  var vector = new THREE.Vector3();
  
  vector.copy(point);
  vector.project(camera);
  
  vector.x = (vector.x + 1) * width /2;
  vector.y = (-vector.y + 1) * height/2;
  vector.z = 0;

  return vector

};

function getCenterPoint(points) {
  let line = new THREE.Line3(...points)
  //console.log(points[0]);
  let target=new THREE.Vector3(points[0].x+(points[0].x+points[1].x)/2, points[0].y+(points[0].y+points[1].y)/2,points[0].z+ (points[0].z+points[1].z)/2 )
  let tt=new THREE.Vector3()
  let tar=new THREE.Vector3()
let t=  line.getCenter(tt);
// console.log(t);
console.log(target);
// console.log(tt);
 // return new THREE.Vector3(points[1].x*2,points[1].y,points[1].z)
  return tar.addVectors( points[0], points[1] ).multiplyScalar( 0.5 );
}

function matrixToVector(matrix) {
  let vector = new THREE.Vector3();
  vector.setFromMatrixPosition(matrix);
  return vector;
}

function initLine(point) {
  let lineMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    linewidth: 5,
    linecap: 'round'
  });

  let lineGeometry = new THREE.BufferGeometry().setFromPoints([point, point]);
  return new THREE.Line(lineGeometry, lineMaterial);
}

function updateLine(matrix) {
  let positions = currentLine.geometry.attributes.position.array;
  positions[3] = matrix.elements[12]
  positions[4] = matrix.elements[13]
  positions[5] = matrix.elements[14]
  currentLine.geometry.attributes.position.needsUpdate = true;
  currentLine.geometry.computeBoundingSphere();
  
  //console.log(matrix);
}

function initReticle() {
  let ring = new THREE.RingBufferGeometry(0.045, 0.05, 32).rotateX(- Math.PI / 2);
  let dot = new THREE.CircleBufferGeometry(0.005, 32).rotateX(- Math.PI / 2);
  reticle = new THREE.Mesh(
    BufferGeometryUtils.mergeBufferGeometries([ring, dot]),
    new THREE.MeshBasicMaterial()
  );
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
}

function initRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
}

function initLabelContainer() {
  labelContainer = document.createElement('div');
  runm = document.createElement('p');
  runm.innerHTML="40"
  labelContainer.style.position = 'absolute';
  labelContainer.style.top = '0px';
  labelContainer.style.pointerEvents = 'none';
  labelContainer.setAttribute('id', 'container');
 

}

function initCamera() {
  camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 20);
}

function initLight() {
  light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  light.position.set(0.5, 1, 0.25);
}

function initScene() {
  scene = new THREE.Scene();
}

function getDistance(points) {
  if (points.length == 2)
    return points[0].distanceTo(points[1]);
}

function initXR() {
  container = document.createElement('div');
  
  document.body.appendChild(container);

  width = window.innerWidth;
  height = window.innerHeight;

  initScene();

  initCamera();

  initLight();
  scene.add(light);

  initRenderer()
  container.appendChild(renderer.domElement);

  initLabelContainer()
  

  container.appendChild(runm);
  container.appendChild(labelContainer);

   textt = document.createElement('div');
  textt.className = 'label';
  textt.style.color = 'rgb(255,255,255)';
  textt.textContent = "";
  document.querySelector('#container').appendChild(textt);

   labels.push({div: textt, point: new THREE.Vector3(0,0,0)});

  document.body.appendChild(ARButton.createButton(renderer, {
    optionalFeatures: ["dom-overlay"],
    domOverlay: {root: document.querySelector('#container')}, 
    requiredFeatures: ['hit-test']
  }));

  controller = renderer.xr.getController(0);
  controller.addEventListener('select', onSelect);
  scene.add(controller);

  initReticle();
  scene.add(reticle);

  window.addEventListener('resize', onWindowResize, false);
  animate()
}

function onSelect() {
  if (reticle.visible) {
    var fn=matrixToVector(reticle.matrix)
    
    if(measurements.length==0)
    {
    firstpt=new Vector3(fn.x,fn.y,fn.z)
    }
    else if(firstpt!=undefined)
    {
      console.log(firstpt.distanceTo(fn)*100);
      if(firstpt.distanceTo(fn)*100<=5)
      {
        fga=Math.round(parea(area)*10000)
        console.log(fga);
        reticle.visible=false
        console.log(matrixToVector(reticle.matrix));
        console.log(currentLine);
        fg=0;
        textt.textContent = "50gg";
       
      }
    }
    measurements.push(fn);
    // let k=new Vector3();
    // k.set( 0, 0,0.2 ).applyMatrix4( reticle.matrixWorld );
    // // console.log(k);
    // // console.log(matrixToVector(reticle.matrix));
    // // console.log((reticle.matrix));
    // //area.push(matrixToVector(reticle.matrix));
    // k.project(camera)
    // k.x = Math.round( (   k.x  ) * width / 2 );
    // k.z = Math.round( (  k.z  ) * height / 2 );
    let v2=new Vector2(fn.x,fn.z);
  //  console.log(k);
  //  console.log(v2);
   area.push(v2);
   center.push(fn)
  //  console.log(area);

  //  if(area.length==4)
  //  {
  //  console.log(Math.round(parea(area)*10000));
  // }
    if (measurements.length == 2) {
      let distance = Math.round(getDistance(measurements) * 100);
     
      let text = document.createElement('div');
      text.className = 'label';
      text.style.color = 'rgb(255,255,255)';
      text.textContent = distance + ' cm';
      document.querySelector('#container').appendChild(text);
      let yy=new Vector3(tarr.x,tarr.y,tarr.z)
      tarr=new Vector3()
      textt.textContent = "";
        labels[0]={div: textt, point: tarr};
      labels.push({div: text, point: yy});
      let mesu=[]
      mesu[0]=measurements[1]
      measurements = [];
      measurements[0]=mesu[0]
      currentLine = null;
    } 
    if(measurements.length==1) {
      currentLine = initLine(measurements[0]);
      scene.add(currentLine);
    }
  }
}

function onWindowResize() {
  width = window.innerWidth;
  height = window.innerHeight;
  camera.aspect = width/height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function animate() {
  renderer.setAnimationLoop(render);
}

function render(timestamp, frame) {
  if (frame) {
    let referenceSpace = renderer.xr.getReferenceSpace();
    let session = renderer.xr.getSession();
    if (hitTestSourceRequested === false) {
      session.requestReferenceSpace('viewer').then(function (referenceSpace) {
        session.requestHitTestSource({ space: referenceSpace }).then(function (source) {
          hitTestSource = source;
        });
      });
      session.addEventListener('end', function () {
        hitTestSourceRequested = false;
        hitTestSource = null;
      });
      hitTestSourceRequested = true;
    }

    if (hitTestSource) {
      let hitTestResults = frame.getHitTestResults(hitTestSource);
      if (hitTestResults.length) {
        let hit = hitTestResults[0];
        if(fg!=0)
        {
        reticle.visible = true;
        
        reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);
        }
      } else {
        reticle.visible = false;
      }

      if (currentLine) {
        const cursor = new THREE.Vector3();
        cursor.set( 0, 0, 0 ).applyMatrix4( reticle.matrixWorld );
        let t=cursor.distanceTo(measurements[0])
        let d = Math.round(t* 100);
         tarr=new Vector3()
        tarr.addVectors( cursor, measurements[0] ).multiplyScalar( 0.5 );
        if(fg!=0)
        {
        textt.textContent = d + ' cm';
        labels[0]={div: textt, point: tarr};
        }
        else{
          textt.textContent =  'Area = '+ fga;
          let aa=0,bb=0,cc=0;
          // console.log(area[0].x);
          for(let i=0;i<center.length-1;i++)
          {
            aa+=center[i].x
            bb+=center[i].y
            cc+=center[i].z
          }
          aa/=area.length-1
          bb/=area.length-1
          cc/=area.length-1
          // console.log(aa+" "+bb);
          let rrt=new Vector3(aa,bb,cc)
          labels[0]={div: textt, point: rrt}
          if(ooo==0)
          {
          const shape = new THREE.Shape( area );
          const extrudeSettings = { depth: 8, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };
          // let areageometry= new THREE.ExtrudeGeometry( shape, extrudeSettings );
          let areageometry= new THREE.ShapeGeometry( shape );

         let areamesh= new THREE.Mesh(
            areageometry,
             new THREE.MeshPhongMaterial({side: THREE.DoubleSide})
          );
          let areamesh1= new THREE.Mesh(
            areageometry,
            new THREE.MeshBasicMaterial({side: THREE.DoubleSide})
          );
          // const texture = new THREE.TextureLoader().load( 'images/img.jpg' );
          // areamesh.material.map=texture

          let rf=toScreenPosition(rrt, renderer.xr.getCamera(camera))
          // areamesh.rotation._x=Math.PI*0.5
          //areamesh.rotateX=Math.PI*0.5
         // areamesh.position.x=0
         areamesh.material.color.set("red")
          areamesh.rotation.set( Math.PI*0.5, 0, 0 );
        //  areamesh.scale.set( 0.1, 0.9, 0.9 );
          areamesh.position.x=0//rrt.x+rrt.y*0.1//-0.5*rrt.x
          areamesh.position.y=rrt.y
          areamesh.position.z=0//rrt.z-rrt.y*0.1*3//+0.5*rrt.z
          var ttt=document.querySelector('#p1')
          ttt.innerHTML="Cost = "+fga*20
          // areamesh1.position.x=reticle.matrix.elements[12]//rrt.x//-0.5*rrt.x
          // areamesh1.position.y=reticle.matrix.elements[13]//rrt.y
          // areamesh1.position.z=reticle.matrix.elements[14]//rrt.z//+0.5*rrt.z
          // let positions = areamesh.geometry.attributes.position.array;
          // positions[3] = reticle.matrix.elements[12]
          // positions[4] = reticle.matrix.elements[13]
          // positions[5] = reticle.matrix.elements[14]
          // areamesh.geometry.attributes.position.needsUpdate = true;
          // areamesh.geometry.computeBoundingSphere();
          let positions1 = areamesh.geometry.attributes.position.array;
          scene.add(areamesh)
        //  scene.add(areamesh1)
          console.log(areamesh.position);
          console.log(areamesh);
          console.log( toScreenPosition(rrt, renderer.xr.getCamera(camera)));
          console.log(rrt);
      //     let text = document.createElement('button');
         
          let fun= ()=>{
            console.log("sdfasdf");
            ttt.innerHTML="Cost = "+fga*22
            areamesh.material.color.set("blue")
          }
      //     text.addEventListener('click',fun);
      // text.className = 'label';
      // text.id = 'btn1';
     

      //  text.style.fontSize='30px'
      // text.style.backgroundColor='yellow'
          
          
      // text.style.color = 'green';
      // text.textContent =  ' blue';
      // document.querySelector('#container').appendChild(text);
      // console.log(text);
     
      document.querySelector('#btn2').addEventListener('click',fun)
      document.querySelector('#btn3').addEventListener('click',()=>{
        areamesh.material.color.set("red")
        ttt.innerHTML="Cost = "+fga*20
        
      })
      document.querySelector('#btn4').addEventListener('click',()=>{
        areamesh.material.color.set("green")
        ttt.innerHTML="Cost = "+fga*23
      })
      document.querySelector('#btn5').addEventListener('click',()=>{

        areamesh.material.color.set("yellow")
        ttt.innerHTML="Cost = "+fga*25
      })
      // labels.push({div: text, point: rrt});
          ooo=1
         }
         


        }
        updateLine(reticle.matrix);

      }
    }

   

  }
  labels.map((label) => {
    let pos = toScreenPosition(label.point, renderer.xr.getCamera(camera));
    let x = pos.x;
    let y = pos.y;
    label.div.style.transform = "translate(" + x + "px," + y + "px)";
  })
  renderer.render(scene, camera);
}

export { initXR }



// if(area.length==8)
      // {
      //   let ans=0,l=area.length;
      //   let arr=[];

      //   let x1=0,y1=0
      //   let y=new Vector3(0,0,0)
        
      //   arr.push(new Vector3(0,0,0))

      //   let disx=Math.round(area[0].distanceTo(area[1])*100)
      //   arr.push(new Vector3(disx,0,0))
      //   let dis=Math.round(area[2].distanceTo(area[3])*100)
      //   arr.push(new Vector3(disx,dis,0))
      //   dis=Math.round(area[4].distanceTo(area[5])*100)
      //   arr.push(new Vector3(0,dis,0))
        
      //   //dis=area[6].distanceTo(area[7])
      //   // for(let i=1;i<4;i=i+2)
      //   // {
         
      //   //     //ans+=(area[(i-1)%l].x*area[i%l].y)-(area[(i-1)%l].y+area[i%l].x)
      //   //     //ans+=(area[i-1].x*area[i].y)-(area[i-1].y*area[i].x)
      //   // }
      //   for(let i=1;i<=4;i++)
      //   {
      //     ans+=(arr[(i-1)%4].x*arr[i%4].y)-(arr[(i-1)%4].y*arr[i%4].x)
      //   }
      //   ans/=2
      //   console.log("area = "+ans);
      //   console.log(arr);
      //   console.log(area[0].distanceTo(area[1]));
      //   console.log(area[2].distanceTo(area[3]));
      //   console.log(area[4].distanceTo(area[5]));
      //   console.log(area[6].distanceTo(area[7]));
        

        

      // }



       // console.log(distance);
      // console.log(measurements);
      // var kkk=[]
      // var kk1=new Vector2(measurements[0].x*100,measurements[0].z*100)
      // var kk2=new Vector2(measurements[1].x*100,measurements[1].z*100)
      // console.log(kk1.distanceTo(kk2));
      // console.log(area[0].distanceTo(area[1]));
    //   let v31=new Vector3(measurements[0].x,measurements[0].y,measurements[0].z)
    //   let v32=new Vector3(measurements[1].x,measurements[1].y,measurements[1].z)
    //   v31.project(camera);

    // v31.x = Math.round( (   v31.x +1 ) * width / 2 );
    // v31.y = Math.round( ( - v31.y  +1) * height / 2 );

    // v32.project(camera);

    // v32.x = Math.round( (   v32.x +1 ) * width / 2 );
    // v32.y = Math.round( ( - v32.y +1 ) * height / 2 );

    //   let v21=new Vector2(Math.round(v31.x/10),Math.round(v31.y/10))
      // let v22=new Vector2(Math.round(v32.x/10),Math.round(v32.y/10))
      // console.log(v21);
      // console.log(v22);
      // console.log(distance);
      // console.log(Math.round(v21.distanceTo(v22)));