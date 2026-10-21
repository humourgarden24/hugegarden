import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshReflectorMaterial, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import MonumentModel from './MonumentModel';
import POIMarkers from './POIMarkers';
import CameraRig from './CameraRig';
import FreeCameraControls from './FreeCameraControls';
import ResponsiveFraming from './ResponsiveFraming';
import useViewerTheme from './useViewerTheme';

// Scene colours per site theme (mirrors the museum hall's dark / light lighting).
const PALETTES = {
  dark: {
    bg: '#080609', sky: '#fff0db', ground: '#24150f', hemi: 1.5, sun: 3, sunColor: '#ffe2b0',
    fill: 1.2, fillColor: '#d18a55', point: 60, floor: '#10090b', grid: ['#563823', '#291812'], ring: '#c9a86a', ringOpacity: 0.4,
  },
  light: {
    bg: '#cfc9bc', sky: '#fff2d6', ground: '#8b806d', hemi: 2.1, sun: 3.4, sunColor: '#fff1d5',
    fill: 1.0, fillColor: '#fff0d5', point: 38, floor: '#c9c0ae', grid: ['#8e7e62', '#b3a78f'], ring: '#8b6b3c', ringOpacity: 0.5,
  },
};

const WEATHER_PALETTES = {
  sunset: {
    bg: '#382642', sky: '#ffc3a8', ground: '#38233a', hemi: 1.45, sun: 3.2, sunColor: '#ff9d78',
    fill: 1.45, fillColor: '#e887b2', point: 24, floor: '#241629', grid: ['#79526e', '#402b47'],
    ring: '#ffb19a', ringOpacity: 0.56, reflection: '#a76182', mirror: 0.58, roughness: 0.2,
    skyTop: '#34315f', skyMid: '#9e527c', skyHorizon: '#ffb17e',
    cloudTop: '#4d477c', cloudBody: '#a45e91', cloudLight: '#ffad8a', cloudGlow: '#ffd09a',
  },
  sunrise: {
    bg: '#a9c8e2', sky: '#fff0cf', ground: '#82706c', hemi: 1.8, sun: 3.7, sunColor: '#ffd58f',
    fill: 1.25, fillColor: '#f7b88f', point: 22, floor: '#bfae9d', grid: ['#9f806e', '#c4ae9a'],
    ring: '#f2ca91', ringOpacity: 0.5, reflection: '#d0a080', mirror: 0.48, roughness: 0.24,
    skyTop: '#397da8', skyMid: '#cb7997', skyHorizon: '#ffca91',
    cloudTop: '#466f91', cloudBody: '#cc829c', cloudLight: '#ffb080', cloudGlow: '#ffe0a7',
  },
  rain: {
    bg: '#344459', sky: '#b7c9df', ground: '#343d4c', hemi: 1.35, sun: 1.25, sunColor: '#b5c8e8',
    fill: 1.7, fillColor: '#829ac2', point: 15, floor: '#273345', grid: ['#52627c', '#344055'],
    ring: '#91a9cf', ringOpacity: 0.36, reflection: '#465b78', mirror: 0.72, roughness: 0.12,
    skyTop: '#29394e', skyMid: '#62758a', skyHorizon: '#a4b5c5',
    cloudTop: '#39475a', cloudBody: '#56687a', cloudLight: '#8292a3', cloudGlow: '#667386',
  },
  cloudy: {
    bg: '#77808b', sky: '#e1e4e7', ground: '#686b70', hemi: 1.9, sun: 1.15, sunColor: '#e2e4e9',
    fill: 1.5, fillColor: '#c3c9d3', point: 12, floor: '#525a64', grid: ['#858b91', '#606a74'],
    ring: '#c2c8d0', ringOpacity: 0.3, reflection: '#929aa5', mirror: 0.32, roughness: 0.42,
    skyTop: '#5c6877', skyMid: '#9ca5ad', skyHorizon: '#d0d0c9',
    cloudTop: '#697582', cloudBody: '#959da4', cloudLight: '#c2c5c5', cloudGlow: '#d5d6d2',
  },
  night: {
    bg: '#07111f', sky: '#a9bfdc', ground: '#0a1726', hemi: 0.48, sun: 0.22, sunColor: '#a9c9f5',
    fill: 0.55, fillColor: '#7298ce', point: 1.4, floor: '#09111c', grid: ['#243d59', '#14283d'],
    ring: '#8fb8ed', ringOpacity: 0.32, reflection: '#254466', mirror: 0.72, roughness: 0.09,
    skyTop: '#050b18', skyMid: '#10263b', skyHorizon: '#435a70',
    cloudTop: '#152638', cloudBody: '#273b4d', cloudLight: '#40576b', cloudGlow: '#516982',
  },
};

function WeatherSky({ palette, weather }) {
  const cloudMaterial = useMemo(() => ({
    top: new THREE.MeshBasicMaterial({ color: palette.cloudTop, transparent: true, opacity: 0.94, depthWrite: false, fog: false }),
    body: new THREE.MeshBasicMaterial({ color: palette.cloudBody, transparent: true, opacity: 0.91, depthWrite: false, fog: false }),
    light: new THREE.MeshBasicMaterial({ color: palette.cloudLight, transparent: true, opacity: 0.92, depthWrite: false, fog: false }),
    glow: new THREE.MeshBasicMaterial({ color: palette.cloudGlow, transparent: true, opacity: 0.8, depthWrite: false, fog: false }),
  }), [palette]);
  const cloudGeometry = useMemo(() => new THREE.SphereGeometry(1, 14, 10), []);
  const sunMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: palette.sunColor, fog: false }), [palette.sunColor]);
  const isNight = weather === 'night';
  const moonTexture = useMemo(() => {
    if (!isNight) return null;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not create the moon texture canvas context.');
    const base = context.createLinearGradient(0, 0, 0, canvas.height);
    base.addColorStop(0, '#cbd7e5');
    base.addColorStop(0.5, '#e4eaf1');
    base.addColorStop(1, '#b7c5d5');
    context.fillStyle = base;
    context.fillRect(0, 0, canvas.width, canvas.height);
    let seed = 43;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    for (let i = 0; i < 125; i++) {
      const x = random() * canvas.width;
      const y = random() * canvas.height;
      const radius = 2 + random() * 15;
      const shade = Math.floor(82 + random() * 62);
      const crater = context.createRadialGradient(x - radius * 0.25, y - radius * 0.25, radius * 0.12, x, y, radius);
      crater.addColorStop(0, `rgba(${shade}, ${shade + 8}, ${shade + 18}, .26)`);
      crater.addColorStop(0.72, 'rgba(112, 132, 154, .18)');
      crater.addColorStop(1, 'rgba(247, 250, 255, .46)');
      context.fillStyle = crater;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [isNight]);
  const stars = useMemo(() => {
    const positions = new Float32Array(420 * 3);
    let seed = 127;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] = (random() - 0.5) * 72;
      positions[i + 1] = 6 + random() * 24;
      positions[i + 2] = -33 + (random() - 0.5) * 12;
    }
    return positions;
  }, []);
  const haloMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: isNight ? '#9bc7ff' : weather === 'sunset' ? '#ff83ab' : '#ffba8e',
    transparent: true,
    opacity: isNight ? 0.2 : 0.14,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false,
  }), [isNight, weather]);
  const starMaterial = useMemo(() => new THREE.PointsMaterial({
    color: '#dceaff',
    size: 1.2,
    sizeAttenuation: false,
    transparent: true,
    opacity: 0.78,
    depthWrite: false,
    depthTest: true,
    fog: false,
    toneMapped: false,
  }), []);
  const isRaining = weather === 'rain';
  const clouds = useMemo(() => {
    const layers = { top: [], body: [], light: [], glow: [] };
    const count = isNight ? 5 : isRaining ? 16 : 15;
    for (let i = 0; i < count; i++) {
      const x = isNight ? [-25, -16, -8, 18, 27][i] : ((i / (count - 1)) - 0.5) * 40;
      const z = isRaining ? -16 + Math.sin(i * 1.7) * 4 : isNight ? -20 + Math.sin(i * 1.7) * 2 : -22 + Math.sin(i * 1.7) * 5;
      const width = 4.2 + (i % 4) * 0.6;
      const y = isNight ? 4.25 + (i % 2) * 0.35 : 6 + (i % 3) * 0.65;
      for (let puff = 0; puff < 7; puff++) {
        const u = puff - 3;
        const size = (0.9 + ((i + puff * 3) % 4) * 0.22) * (isNight ? 0.72 : 1);
        const xOffset = u * width * 0.23;
        const zOffset = Math.sin(puff * 2.1 + i) * 0.75;
        const highlightLayer = puff % 3 === 0 ? 'light' : puff % 3 === 1 ? 'body' : 'top';
        layers[highlightLayer].push({
          position: [x + xOffset, y + Math.cos(puff * 1.7 + i) * 0.42, z + zOffset],
          scale: [size * 1.3, size * 0.68, size * 0.8],
        });
        layers[isRaining ? 'top' : 'glow'].push({
          position: [x + xOffset * 0.78, y - 0.52 - (puff % 2) * 0.14, z + zOffset + 0.1],
          scale: [size * 1.25, size * 0.42, size * 0.72],
        });
      }
    }
    return layers;
  }, [isNight, isRaining]);
  const cloudRefs = useRef({});
  useLayoutEffect(() => {
    const puff = new THREE.Object3D();
    Object.entries(clouds).forEach(([layer, instances]) => {
      const mesh = cloudRefs.current[layer];
      if (!mesh) return;
      instances.forEach((instance, index) => {
        puff.position.fromArray(instance.position);
        puff.scale.fromArray(instance.scale);
        puff.updateMatrix();
        mesh.setMatrixAt(index, puff.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    });
  }, [clouds]);
  const sunPosition = weather === 'sunset' ? [-9, 4.7, -18] : [7, 4.7, -18];
  const moonPosition = [6, 6.8, -24];

  useEffect(() => () => {
    cloudGeometry.dispose();
    Object.values(cloudMaterial).forEach((material) => material.dispose());
    sunMaterial.dispose();
    haloMaterial.dispose();
    starMaterial.dispose();
    moonTexture?.dispose();
  }, [cloudGeometry, cloudMaterial, sunMaterial, haloMaterial, starMaterial, moonTexture]);

  return (
    <>
      <mesh scale={100} renderOrder={-100}>
        <sphereGeometry args={[1, 32, 20]} />
        <shaderMaterial
          side={THREE.BackSide}
          depthWrite={false}
          depthTest={false}
          uniforms={{
            skyTop: { value: new THREE.Color(palette.skyTop) },
            skyMid: { value: new THREE.Color(palette.skyMid) },
            skyHorizon: { value: new THREE.Color(palette.skyHorizon) },
          }}
          vertexShader="varying float skyHeight; void main(){ skyHeight=normalize(position).y; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }"
          fragmentShader="uniform vec3 skyTop; uniform vec3 skyMid; uniform vec3 skyHorizon; varying float skyHeight; void main(){ float h=clamp(skyHeight*.5+.5,0.0,1.0); vec3 low=mix(skyHorizon,skyMid,smoothstep(.02,.55,h)); vec3 col=mix(low,skyTop,smoothstep(.48,1.0,h)); gl_FragColor=vec4(col,1.0); }"
        />
      </mesh>
      {Object.entries(clouds).map(([layer, instances]) => (
        <instancedMesh
          key={layer}
          ref={(mesh) => { cloudRefs.current[layer] = mesh; }}
          args={[cloudGeometry, cloudMaterial[layer], instances.length]}
          count={instances.length}
          frustumCulled={false}
          renderOrder={-5}
        />
      ))}
      {isNight && (
        <>
          <points renderOrder={-4} frustumCulled={false}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[stars, 3]} />
            </bufferGeometry>
            <primitive object={starMaterial} attach="material" />
          </points>
          <group position={moonPosition}>
            <mesh geometry={cloudGeometry} material={haloMaterial} scale={[5, 5, 0.7]} renderOrder={-2} />
            <mesh renderOrder={-1}>
              <sphereGeometry args={[1.8, 32, 24]} />
              <meshBasicMaterial map={moonTexture} color="#e1ecfa" fog={false} />
            </mesh>
            <pointLight color="#a9c9f5" intensity={48} distance={78} decay={2} />
          </group>
        </>
      )}
      {!isRaining && weather !== 'cloudy' && !isNight && (
        <group position={sunPosition}>
          <mesh geometry={cloudGeometry} material={haloMaterial} scale={[4.1, 4.1, 0.7]} renderOrder={-2} />
          <mesh geometry={cloudGeometry} material={sunMaterial} scale={[1.75, 1.75, 1.1]} renderOrder={-1} />
          <pointLight color={palette.sunColor} intensity={weather === 'sunset' ? 80 : 58} distance={64} decay={2} />
        </group>
      )}
    </>
  );
}

function Rain() {
  const positions = useMemo(() => {
    const values = new Float32Array(220 * 3);
    for (let i = 0; i < values.length; i += 3) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 7 + Math.random() * 16;
      values[i] = Math.cos(angle) * radius;
      values[i + 1] = 3 + Math.random() * 6;
      values[i + 2] = Math.sin(angle) * radius;
    }
    return values;
  }, []);
  const drops = useRef(null);
  const dropGeometry = useMemo(() => new THREE.CylinderGeometry(0.012, 0.012, 0.3, 4), []);
  const dropMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#c4d8ff',
    transparent: true,
    opacity: 0.58,
    depthWrite: false,
    fog: false,
  }), []);
  const transform = useMemo(() => new THREE.Object3D(), []);
  const invalidate = useThree((state) => state.invalidate);
  useFrame((_, dt) => {
    const mesh = drops.current;
    if (!mesh) return;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] -= dt * 17;
      if (positions[i + 1] < 0) positions[i + 1] = 9;
      transform.position.set(positions[i], positions[i + 1], positions[i + 2]);
      transform.rotation.z = 0.04;
      transform.updateMatrix();
      mesh.setMatrixAt(i / 3, transform.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    invalidate();
  });
  useEffect(() => () => {
    dropGeometry.dispose();
    dropMaterial.dispose();
  }, [dropGeometry, dropMaterial]);
  return (
    <instancedMesh
      ref={drops}
      args={[dropGeometry, dropMaterial, positions.length / 3]}
      count={positions.length / 3}
      frustumCulled={false}
      renderOrder={2}
    />
  );
}

function ResetCameraForStandardMode({ cameraMode, cameraResetKey, position, target }) {
  const camera = useThree((state) => state.camera);
  const controls = useThree((state) => state.controls);
  const previousMode = useRef(cameraMode);
  useLayoutEffect(() => {
    const enteredStandardMode = cameraMode !== 'free' && previousMode.current !== cameraMode;
    if (!enteredStandardMode) {
      previousMode.current = cameraMode;
      return;
    }
    if (!controls) return;
    camera.position.set(...position);
    controls.target.set(...target);
    controls.update();
    previousMode.current = cameraMode;
  }, [cameraMode, cameraResetKey, camera, controls, position, target]);
  return null;
}

export default function MonumentCanvas({
  monument, store, explode, cameraMode, cameraGoal, cameraResetKey = 0, shared, activePoiId,
  onSelectPoi, onBackgroundClick, pois, insets = { top: 0, bottom: 0 }, compact = false, weather = null,
}) {
  const cam = monument.camera;
  const theme = useViewerTheme();
  const palette = useMemo(() => ({ ...PALETTES[theme], ...WEATHER_PALETTES[weather] }), [theme, weather]);
  const shadowSize = compact ? 1024 : 2048;
  return (
    <Canvas
      shadows
      frameloop="demand"
      dpr={[1, compact ? 1.5 : 2]}
      camera={{ fov: 42, near: 0.4, far: 220, position: cam.position }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onPointerMissed={onBackgroundClick}
    >
      <color attach="background" args={[palette.bg]} />
      <fog attach="fog" args={[palette.bg, 50, 120]} />

      <hemisphereLight args={[palette.sky, palette.ground, palette.hemi]} />
      <directionalLight position={[10, 18, 10]} intensity={palette.sun} color={palette.sunColor} castShadow shadow-mapSize={[shadowSize, shadowSize]} shadow-bias={-0.0004} shadow-normalBias={0.04}>
        <orthographicCamera attach="shadow-camera" args={[-24, 24, 24, -24, 0.5, 70]} />
      </directionalLight>
      <directionalLight position={[-12, 8, -8]} intensity={palette.fill} color={palette.fillColor} />
      <pointLight position={[0, 9, 0]} intensity={palette.point} distance={40} color={palette.sunColor} />

      <Suspense fallback={null}>
        <MonumentModel monument={monument} store={store} explode={explode} shared={shared} />
      </Suspense>
      {weather && <WeatherSky palette={palette} weather={weather} />}
      {weather && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.018, 0]}>
          <planeGeometry args={[60, 60]} />
          <MeshReflectorMaterial
            color={palette.reflection}
            roughness={palette.roughness}
            blur={[300, 100]}
            resolution={512}
            mixBlur={0.85}
            mirror={palette.mirror}
            mixStrength={0.85}
            depthScale={0.4}
          />
        </mesh>
      )}
      {weather === 'rain' && <Rain />}
      <POIMarkers pois={pois || monument.pois} explodeCfg={monument.explode} shared={shared} activeId={activePoiId} onSelect={onSelectPoi} />

      {/* Museum floor: dark disc, faint grid, gold ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]} receiveShadow>
        <circleGeometry args={[34, 64]} />
        <meshStandardMaterial color={palette.floor} roughness={0.85} metalness={0.2} />
      </mesh>
      <gridHelper args={[60, 60, palette.grid[0], palette.grid[1]]} position={[0, -0.02, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <ringGeometry args={[19.8, 20, 96]} />
        <meshBasicMaterial color={palette.ring} transparent opacity={palette.ringOpacity} />
      </mesh>

      <OrbitControls
        makeDefault
        enabled={cameraMode !== 'free'}
        enableDamping
        dampingFactor={0.07}
        target={cam.target}
        autoRotate={cameraMode === 'turntable'}
        autoRotateSpeed={1.2}
        enablePan={false}
        minDistance={cam.minDistance}
        maxDistance={cam.maxDistance}
        maxPolarAngle={Math.PI * 0.495}
      />
      <ResetCameraForStandardMode cameraMode={cameraMode} cameraResetKey={cameraResetKey} position={cam.position} target={cam.target} />
      {cameraMode === 'free'
        ? <FreeCameraControls goal={cameraGoal} />
        : <CameraRig key={cameraResetKey} goal={cameraGoal} />}
      <ResponsiveFraming top={insets.top} bottom={insets.bottom} />
    </Canvas>
  );
}