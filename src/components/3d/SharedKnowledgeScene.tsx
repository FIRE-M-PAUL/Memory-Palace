"use client";

import {
  Suspense,
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Grid, Line, Sparkles } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { ConceptNode } from "./ConceptNode";
import { CentralCoreTopic } from "./CentralCoreTopic";
import { CameraFocus } from "./CameraFocus";
import { InstancedPedestals } from "./InstancedPedestals";
import { Button } from "@/components/ui/button";
import { MapLegendPanel } from "@/components/MapLegendPanel";
import type { Concept, Relationship } from "@/types/learning";
import type { KnowledgeRoom } from "@/types/memory-palace";
import { CORE_TOPIC_ID, type GuidedLayout } from "@/lib/guidedRoomLayout";
import {
  getCachedGuidedLayout,
  getCachedLayerRenderPlan,
} from "@/lib/roomComputeCache";
import type { PerformanceProfile } from "@/lib/performanceProfile";
import type { LayerStack } from "@/types/nested-worlds";
import { useAppStore } from "@/store/appStore";
import { useViewport } from "@/hooks/useViewport";
import { MobileControls } from "@/components/MobileControls";
import { cn } from "@/lib/utils";

interface SceneProps {
  room: KnowledgeRoom;
  selectedId: string | null;
  onSelectConcept: (id: string | null) => void;
  onConceptActivate: (conceptId: string) => void;
  onConceptDive?: (conceptId: string) => void;
  onSelectConnection?: (sourceId: string, targetId: string) => void;
  layout: GuidedLayout;
  layerStack: LayerStack;
  profile: PerformanceProfile;
  focusCameraTrigger?: number;
  transitioning?: boolean;
}

const CoreConnectionLines = memo(function CoreConnectionLines({
  mainIdeas,
  positionCache,
  highlightedIds,
  dimmedIds,
  onLineClick,
}: {
  mainIdeas: Concept[];
  positionCache: Map<string, { x: number; y: number; z: number }>;
  highlightedIds: Set<string>;
  dimmedIds: Set<string>;
  onLineClick?: (source: string, target: string) => void;
}) {
  const origin = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  const segments = useMemo(() => {
    return mainIdeas
      .map((concept) => {
        const pos = positionCache.get(concept.id);
        if (!pos) return null;
        const lit =
          highlightedIds.has(concept.id) || highlightedIds.has(CORE_TOPIC_ID);
        const dim =
          dimmedIds.size > 0 &&
          !lit &&
          (dimmedIds.has(concept.id) || dimmedIds.has(CORE_TOPIC_ID));
        return {
          id: concept.id,
          target: new THREE.Vector3(pos.x, pos.y, pos.z),
          lit,
          dim,
        };
      })
      .filter(Boolean) as {
      id: string;
      target: THREE.Vector3;
      lit: boolean;
      dim: boolean;
    }[];
  }, [mainIdeas, positionCache, highlightedIds, dimmedIds]);

  return (
    <>
      {segments.map(({ id, target, lit, dim }) => (
        <Line
          key={`core-${id}`}
          points={[origin, target]}
          color={lit ? "#5eead4" : "#a78bfa"}
          lineWidth={lit ? 1.8 : 1.1}
          transparent
          opacity={dim ? 0.06 : lit ? 0.88 : 0.38}
          dashed
          dashScale={2.2}
          onClick={(e) => {
            e.stopPropagation();
            onLineClick?.(CORE_TOPIC_ID, id);
          }}
        />
      ))}
    </>
  );
});

const IdeaConnectionLines = memo(function IdeaConnectionLines({
  relationships,
  positionCache,
  highlightedIds,
  dimmedIds,
  onLineClick,
}: {
  relationships: Relationship[];
  positionCache: Map<string, { x: number; y: number; z: number }>;
  highlightedIds: Set<string>;
  dimmedIds: Set<string>;
  onLineClick?: (source: string, target: string) => void;
}) {
  const segments = useMemo(() => {
    return relationships
      .map((rel) => {
        const sp = positionCache.get(rel.source);
        const tp = positionCache.get(rel.target);
        if (!sp || !tp) return null;
        const lit =
          highlightedIds.has(rel.source) || highlightedIds.has(rel.target);
        const dim =
          dimmedIds.size > 0 &&
          !lit &&
          (dimmedIds.has(rel.source) || dimmedIds.has(rel.target));
        return {
          key: `${rel.source}-${rel.target}`,
          start: new THREE.Vector3(sp.x, sp.y, sp.z),
          end: new THREE.Vector3(tp.x, tp.y, tp.z),
          lit,
          dim,
          rel,
        };
      })
      .filter(Boolean) as {
      key: string;
      start: THREE.Vector3;
      end: THREE.Vector3;
      lit: boolean;
      dim: boolean;
      rel: Relationship;
    }[];
  }, [relationships, positionCache, highlightedIds, dimmedIds]);

  return (
    <>
      {segments.map(({ key, start, end, lit, dim, rel }) => (
        <Line
          key={key}
          points={[start, end]}
          color={lit ? "#5eead4" : "#818cf8"}
          lineWidth={lit ? 1.6 : 1}
          transparent
          opacity={dim ? 0.05 : lit ? 0.75 : 0.22}
          dashed
          dashScale={2.5}
          onClick={(e) => {
            e.stopPropagation();
            onLineClick?.(rel.source, rel.target);
          }}
        />
      ))}
    </>
  );
});

const SceneLighting = memo(function SceneLighting({ mobile }: { mobile: boolean }) {
  return (
    <>
      <ambientLight intensity={mobile ? 0.38 : 0.45} />
      <directionalLight position={[6, 10, 4]} intensity={mobile ? 0.72 : 0.9} color="#e0f2fe" />
      {mobile && (
        <>
          <pointLight position={[-4, 3, 6]} intensity={0.35} color="#22d3ee" distance={28} decay={2} />
          <pointLight position={[5, -2, -4]} intensity={0.22} color="#a78bfa" distance={24} decay={2} />
        </>
      )}
    </>
  );
});

function OrbitRing({
  children,
  active,
  speed,
}: {
  children: ReactNode;
  active: boolean;
  speed: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current && active && speed > 0) ref.current.rotation.y += delta * speed;
  });
  return <group ref={ref}>{children}</group>;
}

const SceneContent = memo(function SceneContent({
  room,
  selectedId,
  onSelectConcept,
  onConceptActivate,
  onConceptDive,
  onSelectConnection,
  layout,
  layerStack,
  profile,
  focusCameraTrigger = 0,
  transitioning = false,
}: SceneProps) {
  const { language } = useAppStore();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const focusId = selectedId;

  const layerPlan = useMemo(
    () => getCachedLayerRenderPlan(room, layerStack, layout, profile, language),
    [room, layerStack, layout, profile, language]
  );

  const {
    visibleConcepts,
    positionCache,
    localRelationships,
    layerCoreTitle,
    layerDepth,
  } = layerPlan;

  const peerRelationships = useMemo(
    () =>
      localRelationships.filter(
        (r) =>
          visibleConcepts.some((c) => c.id === r.source) &&
          visibleConcepts.some((c) => c.id === r.target)
      ),
    [localRelationships, visibleConcepts]
  );

  const highlightIds = useMemo(() => {
    const h = new Set<string>();
    if (focusId) h.add(focusId);
    h.add(CORE_TOPIC_ID);
    if (hoveredId) h.add(hoveredId);
    return h;
  }, [focusId, hoveredId]);

  const dimmedIds = useMemo(() => {
    if (!focusId) return new Set<string>();
    const dim = new Set<string>();
    for (const c of visibleConcepts) {
      if (c.id !== focusId && c.id !== hoveredId) dim.add(c.id);
    }
    return dim;
  }, [focusId, hoveredId, visibleConcepts]);

  const focusPosition = useMemo(() => {
    if (!focusId) return null;
    const p = positionCache.get(focusId);
    return p ? new THREE.Vector3(p.x, p.y, p.z) : null;
  }, [focusId, positionCache]);

  const showPedestals = false;
  const showFloor = false;
  const orbitActive =
    layerDepth === 0 && !focusId && profile.enableOrbitSpin && profile.orbitRingSpeed > 0;
  const bg = "#030712";

  const pedestalPositions = useMemo(
    () =>
      showPedestals
        ? visibleConcepts.map((c) => positionCache.get(c.id)).filter(Boolean) as {
            x: number;
            y: number;
            z: number;
          }[]
        : [],
    [showPedestals, visibleConcepts, positionCache]
  );

  const handleHover = useCallback((conceptId: string, h: boolean) => {
    setHoveredId(h ? conceptId : null);
  }, []);

  const showPeerLines = layerDepth > 0 && !profile.isMobile;
  const showCoreLines = !profile.isMobile;
  const nodeElements = useMemo(() => {
    return visibleConcepts.map((concept) => {
      const pos = positionCache.get(concept.id);
      if (!pos) return null;
      const isSelected = selectedId === concept.id;
      const dimmed = dimmedIds.has(concept.id);

      return (
        <ConceptNode
          key={concept.id}
          concept={concept}
          position={pos}
          selected={isSelected}
          hovered={hoveredId === concept.id}
          highlighted={hoveredId === concept.id && !isSelected}
          dimmed={dimmed}
          profile={profile}
          onSelect={() => {
            onSelectConcept(concept.id);
            onConceptActivate(concept.id);
          }}
          onDive={
            onConceptDive
              ? () => {
                  onSelectConcept(concept.id);
                  onConceptDive(concept.id);
                }
              : undefined
          }
          onHover={(h) => handleHover(concept.id, h)}
        />
      );
    });
  }, [
    visibleConcepts,
    positionCache,
    selectedId,
    hoveredId,
    dimmedIds,
    profile,
    onSelectConcept,
    onConceptActivate,
    onConceptDive,
    handleHover,
  ]);

  const content = (
    <>
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, 10, profile.fogFar * (transitioning ? 0.92 : 1)]} />
      <SceneLighting mobile={profile.isMobile} />

      {profile.starCount > 0 && (
        <Stars
          radius={profile.isMobile ? 54 : 60}
          depth={profile.isMobile ? 34 : 40}
          count={profile.starCount}
          factor={profile.isMobile ? 1.9 : 3}
          fade
          speed={profile.isMobile ? 0.2 : 0.5}
        />
      )}
      {profile.enableSparkles && profile.sparkleCount > 0 && (
        <Sparkles
          count={profile.sparkleCount}
          scale={profile.isMobile ? 14 : 12}
          size={profile.isMobile ? 0.85 : 1.5}
          speed={profile.isMobile ? 0.08 : 0.2}
          opacity={profile.isMobile ? 0.22 : 0.25}
          color="#67e8f9"
        />
      )}

      {showFloor && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
            <circleGeometry args={[profile.floorRadius, profile.floorSegments]} />
            <meshStandardMaterial color="#0f172a" metalness={0.15} roughness={0.9} />
          </mesh>
        </>
      )}

      {profile.enableInfiniteGrid && (
        <Grid
          position={[0, -3, 0]}
          args={[24, 24]}
          cellSize={1}
          cellThickness={0.4}
          cellColor="#1e3a5f"
          sectionSize={5}
          sectionThickness={0.8}
          sectionColor="#22d3ee"
          fadeDistance={22}
          infiniteGrid
        />
      )}

      {showPedestals && <InstancedPedestals positions={pedestalPositions} />}

      <CentralCoreTopic
        title={layerCoreTitle}
        pulse={!focusId}
        profile={profile}
      />

      <CameraFocus
        focusPosition={focusPosition}
        active={!!focusId}
        controlsRef={controlsRef}
        profile={profile}
        forceFocus={focusCameraTrigger > 0}
      />

      {showCoreLines && (
        <CoreConnectionLines
          mainIdeas={visibleConcepts}
          positionCache={positionCache}
          highlightedIds={highlightIds}
          dimmedIds={dimmedIds}
          onLineClick={onSelectConnection}
        />
      )}

      {showPeerLines && peerRelationships.length > 0 && (
        <IdeaConnectionLines
          relationships={peerRelationships}
          positionCache={positionCache}
          highlightedIds={highlightIds}
          dimmedIds={dimmedIds}
          onLineClick={onSelectConnection}
        />
      )}

      <OrbitRing active={orbitActive} speed={profile.orbitRingSpeed}>
        {nodeElements}
      </OrbitRing>

      <OrbitControls
        ref={controlsRef}
        enablePan={profile.enablePan}
        enableZoom
        enableRotate
        enableDamping
        dampingFactor={profile.orbitDamping}
        rotateSpeed={profile.rotateSpeed}
        minDistance={profile.orbitMinDistance}
        maxDistance={
          focusId ? profile.orbitMaxDistanceFocused : profile.orbitMaxDistance
        }
        maxPolarAngle={Math.PI / (profile.isMobile ? 2.05 : 1.85)}
        minPolarAngle={profile.isMobile ? 0.35 : 0.2}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN,
        }}
      />
    </>
  );

  if (profile.sceneLiftY !== 0) {
    return <group position={[0, profile.sceneLiftY, 0]}>{content}</group>;
  }

  return content;
});

export interface KnowledgeCanvasProps {
  room: KnowledgeRoom;
  selectedId: string | null;
  onSelectConcept: (id: string | null) => void;
  onConceptActivate: (conceptId: string) => void;
  onSelectConnection?: (sourceId: string, targetId: string) => void;
  layerStack: LayerStack;
  layerKey: string;
  transitioning?: boolean;
  hint: string;
  onReset: () => void;
  onConceptDive?: (conceptId: string) => void;
  onSwitch2d?: () => void;
}

export function KnowledgeCanvas({
  room,
  selectedId,
  onSelectConcept,
  onConceptActivate,
  onConceptDive,
  onSelectConnection,
  layerStack,
  layerKey,
  transitioning = false,
  hint,
  onReset,
  onSwitch2d,
}: KnowledgeCanvasProps) {
  const { language, t } = useAppStore();
  const { profile, isMobile } = useViewport();
  const [focusCameraTrigger, setFocusCameraTrigger] = useState(0);

  const layout = useMemo(
    () => getCachedGuidedLayout(room, language),
    [room, language]
  );

  const handleReset = useCallback(() => {
    onReset();
    setFocusCameraTrigger((n) => n + 1);
  }, [onReset]);

  const cameraPosition = useMemo(
    (): [number, number, number] => profile.cameraDefault,
    [profile]
  );

  return (
    <div
      className={cn(
        "w-full flex flex-col overflow-hidden",
        isMobile
          ? "h-[min(66dvh,520px)] min-h-[296px] rounded-xl border border-cyan-400/15 bg-gradient-to-b from-[#071018] via-slate-950/95 to-[#030712] shadow-[0_0_28px_-10px_rgba(34,211,238,0.1)]"
          : "h-full min-h-[420px] rounded-2xl border border-cyan-500/10"
      )}
    >
      {!isMobile && (
      <div className="flex flex-wrap items-center gap-2 p-2 border-b border-slate-800/80 bg-slate-950/50">
        <Button type="button" size="sm" variant="outline" onClick={handleReset}>
          {t.resetView}
        </Button>
        <div className="ml-auto max-w-[180px]">
          <MapLegendPanel compact />
        </div>
      </div>
      )}
      <div
          className={cn(
            "flex-1 relative min-h-0 transition-opacity duration-500 ease-out",
            isMobile ? "min-h-[260px]" : "min-h-[380px]",
            transitioning ? "opacity-[0.32]" : "opacity-100"
          )}
      >
        <Canvas
          key={`${room.id}-${layerKey}-${profile.viewport}`}
          dpr={profile.dpr}
          camera={{ position: cameraPosition, fov: profile.cameraFov }}
          gl={{
            antialias: !profile.isMobile,
            alpha: true,
            powerPreference: "high-performance",
            stencil: false,
          }}
        >
          <Suspense fallback={null}>
            <SceneContent
              room={room}
              selectedId={selectedId}
              onSelectConcept={onSelectConcept}
              onConceptActivate={onConceptActivate}
              onConceptDive={onConceptDive}
              onSelectConnection={onSelectConnection}
              layout={layout}
              layerStack={layerStack}
              profile={profile}
              focusCameraTrigger={focusCameraTrigger}
              transitioning={transitioning}
            />
          </Suspense>
        </Canvas>
        {isMobile && onSwitch2d && (
          <>
            <div
              className="pointer-events-none absolute inset-0 z-[1] rounded-[inherit] opacity-70"
              aria-hidden
              style={{
                background:
                  "radial-gradient(ellipse 95% 78% at 50% 42%, transparent 0%, rgba(2,6,23,0.14) 52%, rgba(2,6,23,0.72) 100%)",
              }}
            />
            <div className="absolute top-3 left-3 right-3 z-10 pointer-events-none flex justify-center">
              <p className="text-[9px] leading-snug tracking-wide text-cyan-100/58 bg-slate-950/35 backdrop-blur-md rounded-full px-3 py-1 border border-cyan-400/10 max-w-[min(94%,18rem)] text-center shadow-[0_4px_16px_rgba(0,0,0,0.28)]">
                {t.mobileSceneHint}
              </p>
            </div>
            <MobileControls
              hasSelection={!!selectedId}
              onResetView={handleReset}
              onFocusSelected={() => setFocusCameraTrigger((n) => n + 1)}
              onSwitch2d={onSwitch2d}
            />
          </>
        )}
      </div>
      {!isMobile && (
        <p className="text-xs text-slate-500 text-center py-2 px-3">{hint}</p>
      )}
    </div>
  );
}
