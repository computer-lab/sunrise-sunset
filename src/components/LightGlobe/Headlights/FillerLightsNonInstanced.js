import React, { useRef, useEffect, createRef } from 'react'
import * as THREE from 'three'
import { useLoader, useFrame } from "react-three-fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import {
  PLASTIC_COLOR,
  EMISSIVE_COLOR_LASER,
  EMISSIVE_COLOR_STANDARD,
  EMISSIVE_COLOR_LOW
} from "../../../constants"
import { getLightState } from "../../../lib"

export function FillerLights ({ locations }) {
  const { nodes } = useLoader(
    GLTFLoader,
    process.env.PUBLIC_URL + "/laser.glb"
  )
  const refs = useRef(locations.map(() => createRef()))
  const griddyThingRefs = useRef(locations.map(() => createRef()))

  useEffect(() => {
    for (const r of refs.current) {
      r.current.lookAt(0,0,0)
      r.current.rotateY(5.6 * Math.PI / 4)
    }
  }, [])

  useFrame(({ clock }) => {
    let worldPos = new THREE.Vector3()
    for (let i = 0; i < locations.length; i++) {
      const headlight = refs.current[i].current;
      headlight.getWorldPosition(worldPos)
      const onDarkSide = !!(worldPos.x > 0.1)
      const { lightLaser, lightLow } = getLightState(i)
      const emissiveColor = lightLaser ? EMISSIVE_COLOR_LASER : lightLow ? EMISSIVE_COLOR_LOW : EMISSIVE_COLOR_STANDARD
      const griddyThing = griddyThingRefs.current[i].current
      griddyThing.material.emissive = onDarkSide ? emissiveColor : false
      griddyThing.userData = { bloom: onDarkSide }
    }
  })

  const lights = locations.map(({ position }, i) => {
    return (
      <group key={i} scale={[0.015, 0.015, 0.015]} position={position} ref={refs.current[i]}>
        <mesh geometry={nodes['visor'].geometry} >
          <meshStandardMaterial
            attach="material"
            color={0xcccccc}
            roughness={0.05}
            metalness={0.9}
            opacity={0.6}
            transparent
            depthWrite={false}
          />
        </mesh>
        <mesh ref={griddyThingRefs.current[i]} userData={{ bloom: true }} geometry={nodes['light-guide'].geometry}>
          <meshStandardMaterial
            attach="material"
            color={PLASTIC_COLOR}
            roughness={0.2}
            metalness={0.8}
            opacity={0.4}
            transparent
            depthWrite={false}
          />
        </mesh>
        <mesh geometry={nodes['lens'].geometry}>
          <meshStandardMaterial
            attach="material"
            roughness={0.3}
            metalness={0.5}
            color={0xaaaaee}
            depthWrite={false}
            opacity={0.5}
            transparent
          />
        </mesh>
      </group>
    )
  })

  return (
    <group>
      {lights}
    </group>
  )
}
