import type { KnowledgeRoom } from "@/types/memory-palace";
import type { LanguageCode } from "@/types/learning";
import { resolveText } from "@/lib/multilingual";
import {
  CORE_TOPIC_ID,
  getConnectionToCoreText,
  resolveConnectionParties,
} from "@/lib/guidedRoomLayout";
import { findRelationship } from "@/lib/relationshipHelpers";
import { getTranslationsSync } from "@/lib/i18n";

export interface RelationshipExplanation {
  titleA: string;
  titleB: string;
  connectionType: string;
  explanation: string;
  sourceExcerpt?: string;
  studyTip?: string;
  isCoreLink: boolean;
}

export function explainRelationship(
  room: KnowledgeRoom,
  ideaAId: string,
  ideaBId: string,
  language: LanguageCode,
  coreTitle?: string
): RelationshipExplanation {
  const t = getTranslationsSync(language);
  const core = coreTitle ?? resolveText(room.title, language);
  const parties = resolveConnectionParties(room, ideaAId, ideaBId, core, language);

  const ideaA = room.concepts.find((c) => c.id === ideaAId);

  const mainIdea =
    ideaAId === CORE_TOPIC_ID
      ? room.concepts.find((c) => c.id === ideaBId)
      : ideaBId === CORE_TOPIC_ID
        ? room.concepts.find((c) => c.id === ideaAId)
        : null;

  const rel =
    parties.isCoreLink ? null : findRelationship(room, ideaAId, ideaBId);

  const explanation =
    parties.isCoreLink && mainIdea
      ? getConnectionToCoreText(room, mainIdea, core, language)
      : rel?.explanation
        ? resolveText(rel.explanation, language)
        : `${parties.titleA} and ${parties.titleB} connect in your study map.`;

  const sourceExcerpt =
    parties.isCoreLink && mainIdea?.sourceExcerpt
      ? resolveText(mainIdea.sourceExcerpt, language)
      : rel?.sourceExcerpt
        ? resolveText(rel.sourceExcerpt, language)
        : ideaA?.sourceExcerpt
          ? resolveText(ideaA.sourceExcerpt, language)
          : undefined;

  const studyTip =
    parties.isCoreLink && mainIdea?.studyTip
      ? resolveText(mainIdea.studyTip, language)
      : rel?.studyTip
        ? resolveText(rel.studyTip, language)
        : undefined;

  return {
    titleA: parties.titleA,
    titleB: parties.titleB,
    connectionType: parties.isCoreLink
      ? t.connectionTypes.partOf
      : rel?.label ?? t.connectionTypes.relatesTo,
    explanation,
    sourceExcerpt,
    studyTip,
    isCoreLink: parties.isCoreLink,
  };
}
