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
import type { LearningViewMode } from "@/types/learning-views";
import { CORE_TOPIC_ID, type GuidedLayout } from "@/lib/guidedRoomLayout";
import {
  getCachedGuidedLayout,
  getCachedLayerRenderPlan,
} from "@/lib/roomComputeCache";
import type { PerformanceProfile } from "@/lib/performanceProfile";
import type { LayerStack } from "@/types/nested-worlds";
import { useAppStore } from "@/store/appStore";
import { useViewport } from "@/hooks/useViewport";
import { MobileSceneToolbar } from "@/components/3d/MobileSceneToolbar";

interface SceneProps {
  room: KnowledgeRoom;
  selectedId: string | null;
  onSelectConcept: (id: string | null) => void;
  onConceptActivate: (conceptId: string) => void;
  onConceptDive?: (conceptId: string) => void;
  onSelectConnection?: (sourceId: string, targetId: string) => void;
  view: LearningViewMode;
  layout: GuidedLayout;
  layerStack: LayerStack;
  profile: PerformanceProfile;
  focusCameraTrigger?: number;
}

const CoreConnectionLines = memo(function CoreConnectionLines({
  mainIdeas,
  positionCache,
  highlightedIds,
  dimmedIds,
  onLineClick,
  dashed,
}: {
  mainIdeas: Concept[];
  positionCache: Map<string, { x: number; y: number; z: number }>;
  highlightedIds: Set<string>;
  dimmedIds: Set<string>;
  onLineClick?: (source: string, target: string) => void;
  dashed?: boolean;
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
          color={lit ? "#22d3ee" : "#8b5cf6"}
          lineWidth={lit ? 2 : 1}
          transparent
          opacity={dim ? 0.08 : lit ? 0.9 : 0.5}
          dashed={dashed}
          dashScale={dashed ? 2 : undefined}
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
          color={lit ? "#22d3ee" : "#6366f1"}
          lineWidth={lit ? 2 : 1}
          transparent
          opacity={dim ? 0.06 : lit ? 0.85 : 0.28}
          onClick={(e) => {
            e.stopPropagation();
            onLineClick?.(rel.source, rel.target);
          }}
        />
      ))}
    </>
  );
});

const SceneLighting = memo(function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[6, 10, 4]} intensity={0.9} color="#e0f2fe" />
    </>
  );
});

function OrbitRing({
  children,
  active,
}: {
  children: ReactNode;
  active: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current && active) ref.current.rotation.y += delta * 0.035;
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
  view,
  layout,
  layerStack,
  profile,
  focusCameraTrigger = 0,
}: SceneProps) {
  const { language } = useAppStore();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const focusId = selectedId;

  const layerPlan = useMemo(
    () =>
      getCachedLayerRenderPlan(room, layerStack, view, layout, profile, language),
    [room, layerStack, view, layout, profile, language]
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

  const showPedestals =
    profile.showPedestals && (view === "explore" || view === "room");
  const showFloor =
    profile.showDecorFloor && (view === "room" || view === "explore");
  const orbitActive =
    view === "focus" && layerDepth === 0 && !focusId && profile.enableOrbitSpin;

  const bg =
    view === "creative" ? "#0c1929" : view === "explore" ? "#050810" : "#030712";

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

  const showPeerLines = layerDepth > 0;

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

  return (
    <>
      <color attach="background" args={[bg]} />
      <fog
        attach="fog"
        args={[bg, 12, view === "creative" ? profile.fogFar + 8 : profile.fogFar]}
      />
      <SceneLighting />

      {view !== "creative" && profile.starCount > 0 && (
        <Stars
          radius={60}
          depth={40}
          count={profile.starCount}
          factor={3}
          fade
          speed={0.5}
        />
      )}
      {profile.enableSparkles && profile.sparkleCount > 0 && view === "explore" && (
        <Sparkles
          count={profile.sparkleCount}
          scale={12}
          size={1.5}
          speed={0.2}
          opacity={0.25}
          color="#22d3ee"
        />
      )}

      {showFloor && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
            <circleGeometry args={[profile.floorRadius, profile.floorSegments]} />
            <meshStandardMaterial color="#0f172a" metalness={0.15} roughness={0.9} />
          </mesh>
          {view === "room" && !profile.isMobile && (
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[1.2, 1.4, 0.25, 12]} />
              <meshStandardMaterial
                color="#422006"
                emissive="#78350f"
                emissiveIntensity={0.12}
              />
            </mesh>
          )}
        </>
      )}

      {view === "focus" && profile.enableInfiniteGrid && (
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

      <CoreConnectionLines
        mainIdeas={visibleConcepts}
        positionCache={positionCache}
        highlightedIds={highlightIds}
        dimmedIds={dimmedIds}
        onLineClick={onSelectConnection}
        dashed={view === "room"}
      />

      {showPeerLines && peerRelationships.length > 0 && (
        <IdeaConnectionLines
          relationships={peerRelationships}
          positionCache={positionCache}
          highlightedIds={highlightIds}
          dimmedIds={dimmedIds}
          onLineClick={onSelectConnection}
        />
      )}

      {view === "focus" ? (
        <OrbitRing active={orbitActive}>{nodeElements}</OrbitRing>
      ) : (
        nodeElements
      )}

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
          focusId
            ? profile.orbitMaxDistanceFocused
            : view === "creative"
              ? profile.orbitMaxDistance + 2
              : profile.orbitMaxDistance
        }
        maxPolarAngle={Math.PI / (profile.isMobile ? 2.05 : 1.85)}
        minPolarAngle={profile.isMobile ? 0.35 : 0.2}
      />
    </>
  );
});

export interface KnowledgeCanvasProps {
  room: KnowledgeRoom;
  selectedId: string | null;
  onSelectConcept: (id: string | null) => void;
  onConceptActivate: (conceptId: string) => void;
  onSelectConnection?: (sourceId: string, targetId: string) => void;
  view: LearningViewMode;
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
  view,
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

  const cameraPosition = useMemo((): [number, number, number] => {
    if (view === "creative" && !profile.isMobile) {
      return [0, 5.5, 13];
    }
    return profile.cameraDefault;
  }, [view, profile]);

  return (
    <div className="w-full h-full min-h-[420px] rounded-2xl overflow-hidden border border-cyan-500/10 flex flex-col">
      <div className="flex flex-wrap items-center gap-2 p-2 border-b border-slate-800/80 bg-slate-950/50">
        <Button type="button" size="sm" variant="outline" onClick={handleReset}>
          {t.resetView}
        </Button>
        <div className="ml-auto hidden md:block max-w-[180px]">
          <MapLegendPanel compact />
        </div>
      </div>
      <div
        className={`flex-1 min-h-[380px] relative transition-opacity duration-300 ${
          transitioning ? "opacity-40" : "opacity-100"
        }`}
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
              view={view}
              layout={layout}
              layerStack={layerStack}
              profile={profile}
              focusCameraTrigger={focusCameraTrigger}
            />
          </Suspense>
        </Canvas>
        {isMobile && onSwitch2d && (
          <MobileSceneToolbar
            hasSelection={!!selectedId}
            onResetView={handleReset}
            onFocusSelected={() => setFocusCameraTrigger((n) => n + 1)}
            onSwitch2d={onSwitch2d}
          />
        )}
      </div>
      <p className="text-xs text-slate-500 text-center py-2 px-3">
        {isMobile ? t.mobileSceneHint : hint}
      </p>
    </div>
  );
}
