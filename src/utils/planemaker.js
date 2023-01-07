import * as THREE from 'three'


export function createPlaneMarker() {
    const planeMarkerMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    const planeMarkerGeometry = new THREE.RingGeometry(0.14, 0.15, 16).rotateX(
      -Math.PI / 2,
    );
  
    const planeMarker = new THREE.Mesh(planeMarkerGeometry, planeMarkerMaterial);
  
    planeMarker.matrixAutoUpdate = false;
  
    return planeMarker;
  }