"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Grid, Line } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { ConceptNode } from "./ConceptNode";
import { CentralCoreTopic } from "./CentralCoreTopic";
import { CameraFocus } from "./CameraFocus";
import type { Concept, Relationship } from "@/types/learning";
import type { KnowledgeRoom } from "@/types/memory-palace";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/appStore";
import { MapLegendPanel } from "@/components/MapLegendPanel";
import {
  buildGuidedLayout,
  CORE_TOPIC_ID,
  getConceptPosition,
  getRelatedIdeaIds,
  getVisibleConcepts,
  type MapDisplayMode,
} from "@/lib/guidedRoomLayout";

interface KnowledgeRoom3DProps {
  room: KnowledgeRoom;
  selectedId: string | null;
  onSelectConcept: (id: string | null) => void;
  onSelectConnection?: (sourceId: string, targetId: string) => void;
  showStudyPath?: boolean;
  routeConceptIds?: string[];
}

function CoreConnectionLines({
  mainIdeas,
  positions,
  highlightedIds,
  dimmedIds,
  onLineClick,
}: {
  mainIdeas: Concept[];
  positions: Map<string, { x: number; y: number; z: number }>;
  highlightedIds: Set<string>;
  dimmedIds: Set<string>;
  onLineClick?: (source: string, target: string) => void;
}) {
  const origin = new THREE.Vector3(0, 0, 0);

  return (
    <>
      {mainIdeas.map((concept) => {
        const pos = positions.get(concept.id);
        if (!pos) return null;
        const target = new THREE.Vector3(pos.x, pos.y, pos.z);
        const lit =
          highlightedIds.has(concept.id) ||
          highlightedIds.has(CORE_TOPIC_ID);
        const dim =
          dimmedIds.size > 0 &&
          !lit &&
          (dimmedIds.has(concept.id) || dimmedIds.has(CORE_TOPIC_ID));

        return (
          <Line
            key={`core-${concept.id}`}
            points={[origin, target]}
            color={lit ? "#22d3ee" : "#8b5cf6"}
            lineWidth={lit ? 2.5 : 1.2}
            transparent
            opacity={dim ? 0.08 : lit ? 0.95 : 0.55}
            onClick={(e) => {
              e.stopPropagation();
              onLineClick?.(CORE_TOPIC_ID, concept.id);
            }}
          />
        );
      })}
    </>
  );
}

function IdeaConnectionLines({
  concepts,
  relationships,
  highlightedIds,
  dimmedIds,
  onLineClick,
}: {
  concepts: Concept[];
  relationships: Relationship[];
  highlightedIds: Set<string>;
  dimmedIds: Set<string>;
  onLineClick?: (source: string, target: string) => void;
}) {
  const conceptMap = useMemo(
    () => new Map(concepts.map((c) => [c.id, c])),
    [concepts]
  );

  return (
    <>
      {relationships.map((rel) => {
        const source = conceptMap.get(rel.source);
        const target = conceptMap.get(rel.target);
        if (!source || !target) return null;
        const lit =
          highlightedIds.has(rel.source) || highlightedIds.has(rel.target);
        const dim =
          dimmedIds.size > 0 &&
          !lit &&
          (dimmedIds.has(rel.source) || dimmedIds.has(rel.target));

        return (
          <Line
            key={`${rel.source}-${rel.target}`}
            points={[
              new THREE.Vector3(source.position.x, source.position.y, source.position.z),
              new THREE.Vector3(target.position.x, target.position.y, target.position.z),
            ]}
            color={lit ? "#22d3ee" : "#6366f1"}
            lineWidth={lit ? 2.5 : 1}
            transparent
            opacity={dim ? 0.06 : lit ? 0.9 : 0.3}
            onClick={(e) => {
              e.stopPropagation();
              onLineClick?.(rel.source, rel.target);
            }}
          />
        );
      })}
    </>
  );
}

function GuidedScene({
  room,
  selectedId,
  onSelectConcept,
  onSelectConnection,
  mapMode,
  layout,
}: KnowledgeRoom3DProps & {
  mapMode: MapDisplayMode;
  layout: ReturnType<typeof buildGuidedLayout>;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const focusId = selectedId;
  const relatedIds = useMemo(
    () => (focusId ? getRelatedIdeaIds(room, focusId) : new Set<string>()),
    [room, focusId]
  );

  const visibleConcepts = useMemo(
    () => getVisibleConcepts(room, mapMode, layout),
    [room, mapMode, layout]
  );

  const exploreConcepts = mapMode === "explore" ? room.concepts : visibleConcepts;

  const dimmedIds = useMemo(() => {
    if (!focusId) return new Set<string>();
    const dim = new Set<string>();
    for (const c of exploreConcepts) {
      if (!relatedIds.has(c.id)) dim.add(c.id);
    }
    return dim;
  }, [focusId, exploreConcepts, relatedIds]);

  const highlightIds = useMemo(() => {
    const h = new Set(relatedIds);
    if (focusId) h.add(CORE_TOPIC_ID);
    if (hoveredId) h.add(hoveredId);
    return h;
  }, [relatedIds, focusId, hoveredId]);

  const focusPosition = useMemo(() => {
    if (!focusId) return null;
    const c = room.concepts.find((x) => x.id === focusId);
    if (!c) return null;
    const p = getConceptPosition(c, mapMode, layout);
    return new THREE.Vector3(p.x, p.y, p.z);
  }, [focusId, room.concepts, mapMode, layout]);

  const simplePositions = layout.simplePositions;

  return (
    <>
      <color attach="background" args={["#030712"]} />
      <fog attach="fog" args={["#030712", 12, 32]} />
      <ambientLight intensity={0.35} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#22d3ee" />
      <pointLight position={[-10, -5, -10]} intensity={0.5} color="#a78bfa" />
      <spotLight position={[0, 15, 0]} angle={0.5} penumbra={1} intensity={0.8} color="#3b82f6" />

      <Stars radius={80} depth={50} count={2500} factor={4} fade speed={1} />
      <Grid
        position={[0, -3, 0]}
        args={[30, 30]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#1e3a5f"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#22d3ee"
        fadeDistance={25}
        infiniteGrid
      />

      <CentralCoreTopic title={layout.coreTitle} pulse={!focusId} />

      <CameraFocus
        focusPosition={focusPosition}
        active={!!focusId}
        controlsRef={controlsRef}
      />

      {mapMode === "simple" ? (
        <CoreConnectionLines
          mainIdeas={layout.mainIdeas}
          positions={simplePositions}
          highlightedIds={highlightIds}
          dimmedIds={dimmedIds}
          onLineClick={onSelectConnection}
        />
      ) : (
        <IdeaConnectionLines
          concepts={room.concepts}
          relationships={room.relationships}
          highlightedIds={highlightIds}
          dimmedIds={dimmedIds}
          onLineClick={onSelectConnection}
        />
      )}

      {exploreConcepts.map((concept) => {
        const pos = getConceptPosition(concept, mapMode, layout);
        const isSelected = selectedId === concept.id;
        const isRelated = relatedIds.has(concept.id);
        const dimmed = focusId !== null && !isRelated;

        if (mapMode === "simple" && !layout.mainIdeaIds.has(concept.id)) {
          return null;
        }

        return (
          <ConceptNode
            key={concept.id}
            concept={concept}
            position={pos}
            selected={isSelected}
            hovered={hoveredId === concept.id}
            highlighted={isRelated && focusId !== null && !isSelected}
            dimmed={dimmed}
            onClick={() => onSelectConcept(concept.id)}
            onHover={(h) => setHoveredId(h ? concept.id : null)}
          />
        );
      })}

      <OrbitControls
        ref={controlsRef}
        enablePan
        enableZoom
        enableRotate
        minDistance={focusId ? 3 : 5}
        maxDistance={focusId ? 14 : 22}
        maxPolarAngle={Math.PI / 1.8}
      />
    </>
  );
}

export function KnowledgeRoom3D({
  room,
  selectedId,
  onSelectConcept,
  onSelectConnection,
}: KnowledgeRoom3DProps) {
  const { language, t } = useAppStore();
  const [mapMode, setMapMode] = useState<MapDisplayMode>("simple");
  const [controlsKey, setControlsKey] = useState(0);

  const layout = useMemo(
    () => buildGuidedLayout(room, language),
    [room, language]
  );

  const handleReset = () => {
    setControlsKey((k) => k + 1);
    onSelectConcept(null);
  };

  return (
    <div className="w-full h-full min-h-[420px] rounded-2xl overflow-hidden border border-cyan-500/10 flex flex-col">
      <div className="flex flex-wrap items-center gap-2 p-2 border-b border-slate-800/80 bg-slate-950/50">
        <div className="flex rounded-lg border border-slate-700 overflow-hidden">
          <Button
            type="button"
            size="sm"
            variant={mapMode === "simple" ? "default" : "ghost"}
            className="rounded-none min-h-[36px]"
            onClick={() => setMapMode("simple")}
          >
            {t.simpleView}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mapMode === "explore" ? "default" : "ghost"}
            className="rounded-none min-h-[36px]"
            onClick={() => setMapMode("explore")}
          >
            {t.exploreView}
          </Button>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={handleReset}>
          {t.resetView}
        </Button>
        <div className="ml-auto hidden md:block max-w-[180px]">
          <MapLegendPanel compact />
        </div>
      </div>
      <p className="text-xs text-slate-500 px-3 py-1 border-b border-slate-800/50">
        {mapMode === "simple" ? t.simpleViewHelp : t.exploreViewHelp}
      </p>
      <div className="flex-1 min-h-[380px]">
        <Canvas
          key={`${controlsKey}-${mapMode}`}
          camera={{ position: [0, 4, 12], fov: 55 }}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            <GuidedScene
              room={room}
              selectedId={selectedId}
              onSelectConcept={onSelectConcept}
              onSelectConnection={onSelectConnection}
              mapMode={mapMode}
              layout={layout}
            />
          </Suspense>
        </Canvas>
      </div>
      <p className="text-xs text-slate-500 text-center py-2 px-3">{t.mapClickHint}</p>
    </div>
  );
}
