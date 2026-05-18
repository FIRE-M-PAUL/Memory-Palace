"use client";

import { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Grid, Float, Line } from "@react-three/drei";
import * as THREE from "three";
import { ConceptNode } from "./ConceptNode";
import type { Concept, Relationship } from "@/types/learning";
import type { KnowledgeRoom } from "@/types/memory-palace";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/appStore";
import { MapLegendPanel } from "@/components/MapLegendPanel";

const VISIBLE_DEFAULT = 16;

interface KnowledgeRoom3DProps {
  room: KnowledgeRoom;
  selectedId: string | null;
  onSelectConcept: (id: string) => void;
  onSelectConnection?: (sourceId: string, targetId: string) => void;
  showStudyPath?: boolean;
  routeConceptIds?: string[];
}

function ConnectionLines({
  concepts,
  relationships,
  highlightedId,
  onLineClick,
}: {
  concepts: Concept[];
  relationships: Relationship[];
  highlightedId: string | null;
  onLineClick?: (source: string, target: string) => void;
}) {
  const conceptMap = useMemo(
    () => new Map(concepts.map((c) => [c.id, c])),
    [concepts]
  );

  const lines = useMemo(() => {
    return relationships
      .map((rel) => {
        const source = conceptMap.get(rel.source);
        const target = conceptMap.get(rel.target);
        if (!source || !target) return null;
        const isHighlighted =
          highlightedId === rel.source || highlightedId === rel.target;
        return {
          key: `${rel.source}-${rel.target}`,
          sourceId: rel.source,
          targetId: rel.target,
          points: [
            new THREE.Vector3(
              source.position.x,
              source.position.y,
              source.position.z
            ),
            new THREE.Vector3(
              target.position.x,
              target.position.y,
              target.position.z
            ),
          ],
          isHighlighted,
        };
      })
      .filter(Boolean) as {
      key: string;
      sourceId: string;
      targetId: string;
      points: THREE.Vector3[];
      isHighlighted: boolean;
    }[];
  }, [relationships, conceptMap, highlightedId]);

  return (
    <>
      {lines.map((line) => (
        <Line
          key={line.key}
          points={line.points}
          color={line.isHighlighted ? "#22d3ee" : "#6366f1"}
          lineWidth={line.isHighlighted ? 2.5 : 1}
          transparent
          opacity={line.isHighlighted ? 0.95 : 0.35}
          onClick={(e) => {
            e.stopPropagation();
            onLineClick?.(line.sourceId, line.targetId);
          }}
        />
      ))}
    </>
  );
}

function CentralCore() {
  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <group position={[0, 0, 0]}>
        <mesh>
          <icosahedronGeometry args={[0.6, 1]} />
          <meshStandardMaterial
            color="#a78bfa"
            emissive="#a78bfa"
            emissiveIntensity={1.5}
            metalness={0.9}
            roughness={0.1}
            wireframe
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#22d3ee"
            emissiveIntensity={2}
            transparent
            opacity={0.8}
          />
        </mesh>
      </group>
    </Float>
  );
}

function Scene({
  room,
  selectedId,
  onSelectConcept,
  onSelectConnection,
  visibleConcepts,
}: KnowledgeRoom3DProps & { visibleConcepts: Concept[] }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const visibleIds = new Set(visibleConcepts.map((c) => c.id));
  const visibleRels = room.relationships.filter(
    (r) => visibleIds.has(r.source) && visibleIds.has(r.target)
  );

  return (
    <>
      <color attach="background" args={["#030712"]} />
      <fog attach="fog" args={["#030712", 15, 35]} />
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#22d3ee" />
      <pointLight position={[-10, -5, -10]} intensity={0.5} color="#a78bfa" />
      <spotLight
        position={[0, 15, 0]}
        angle={0.5}
        penumbra={1}
        intensity={0.8}
        color="#3b82f6"
      />

      <Stars radius={80} depth={50} count={3000} factor={4} fade speed={1} />
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

      <CentralCore />

      <ConnectionLines
        concepts={visibleConcepts}
        relationships={visibleRels}
        highlightedId={selectedId ?? hoveredId}
        onLineClick={onSelectConnection}
      />

      {visibleConcepts.map((concept) => (
        <ConceptNode
          key={concept.id}
          concept={concept}
          selected={selectedId === concept.id}
          hovered={hoveredId === concept.id}
          onClick={() => onSelectConcept(concept.id)}
          onHover={(h) => setHoveredId(h ? concept.id : null)}
        />
      ))}

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minDistance={5}
        maxDistance={25}
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
  const t = useAppStore((s) => s.t);
  const [showAll, setShowAll] = useState(false);
  const [controlsKey, setControlsKey] = useState(0);

  const sorted = useMemo(() => {
    const order = { high: 0, medium: 1, low: 2 };
    return [...room.concepts].sort(
      (a, b) => order[a.importance] - order[b.importance]
    );
  }, [room.concepts]);

  const visibleConcepts = showAll ? sorted : sorted.slice(0, VISIBLE_DEFAULT);

  const resetView = () => setControlsKey((k) => k + 1);

  return (
    <div className="w-full h-full min-h-[400px] rounded-2xl overflow-hidden border border-cyan-500/10 flex flex-col">
      <div className="flex flex-wrap items-center gap-2 p-2 border-b border-slate-800/80 bg-slate-950/50">
        <Button type="button" size="sm" variant="outline" onClick={resetView}>
          {t.resetView}
        </Button>
        {selectedId && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onSelectConcept(selectedId)}
          >
            {t.focusIdea}
          </Button>
        )}
        {sorted.length > VISIBLE_DEFAULT && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-cyan-300"
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll ? t.showFewerIdeas : t.showMoreIdeas}
          </Button>
        )}
        <div className="ml-auto hidden md:block max-w-[180px]">
          <MapLegendPanel compact />
        </div>
      </div>
      <div className="flex-1 min-h-[360px]">
        <Canvas
          key={controlsKey}
          camera={{ position: [0, 4, 12], fov: 55 }}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            <Scene
              room={room}
              selectedId={selectedId}
              onSelectConcept={onSelectConcept}
              onSelectConnection={onSelectConnection}
              visibleConcepts={visibleConcepts}
            />
          </Suspense>
        </Canvas>
      </div>
      <p className="text-xs text-slate-500 text-center py-2 px-3">{t.mapClickHint}</p>
    </div>
  );
}
