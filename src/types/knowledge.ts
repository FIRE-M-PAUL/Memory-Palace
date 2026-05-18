/** @deprecated Use @/types/learning and @/types/memory-palace */
export * from "./learning";
export type { KnowledgeRoom } from "./memory-palace";
export { getClusterColor, CLUSTER_COLORS } from "./memory-palace";

import type { KnowledgeRoom } from "./memory-palace";

/** Room data without persistence fields — used by 3D/panel components */
export type KnowledgeRoomData = KnowledgeRoom;
