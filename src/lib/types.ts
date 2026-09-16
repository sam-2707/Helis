export type UserRole = "teacher" | "parent" | "admin" | "student";

export type EventType =
  | "attendance"
  | "academic"
  | "behavior"
  | "social"
  | "win"
  | "note";

export type EventValence = "positive" | "neutral" | "concern";

export type DigestStatus = "draft" | "approved" | "sent" | "failed";

export type PreferredLanguage = "en" | "hi";

export type ProjectStatus = "active" | "completed" | "archived";

export type GroupMemberRole = "leader" | "member";

export type MessageSender = "parent" | "teacher" | "ai";

export interface School {
  id: string;
  name: string;
}

export interface ClassRoom {
  id: string;
  schoolId: string;
  grade: number;
  section: string;
  name: string;
}

export interface Student {
  id: string;
  classId: string;
  name: string;
  grade: number;
  preferredLanguage: PreferredLanguage;
}

export interface Guardian {
  id: string;
  name: string;
  phone: string;
  preferredLanguage: PreferredLanguage;
}

export interface GuardianLink {
  guardianId: string;
  studentId: string;
}

export interface StudentEvent {
  id: string;
  studentId: string;
  classId: string;
  createdBy: string;
  occurredAt: string;
  type: EventType;
  valence: EventValence;
  severity: 1 | 2 | 3;
  tags: string[];
  body: string;
  sourceRef?: string;
}

export interface ConsentRecord {
  id: string;
  guardianId: string;
  channel: "whatsapp";
  consentedAt: string;
  templateVersionAcknowledged: string;
}

export interface Digest {
  id: string;
  studentId: string;
  periodStart: string;
  periodEnd: string;
  summaryEn: string;
  summaryHi: string;
  highlights: string[];
  suggestedHomeActions: string[];
  status: DigestStatus;
  deliveryChannel: "whatsapp" | "inapp";
  sentAt?: string;
  deliveryLog?: string;
}

export interface DigestDraft {
  summary_en: string;
  summary_hi: string;
  highlights: string[];
  suggested_home_actions: string[];
  risk_note?: string;
}

export interface CreateEventInput {
  studentId: string;
  classId: string;
  type: EventType;
  valence: EventValence;
  severity: 1 | 2 | 3;
  tags: string[];
  body: string;
  sourceRef?: string;
}

export interface RiskSignal {
  studentId: string;
  score: number;
  level: "low" | "watch" | "elevated";
  reasons: string[];
  windowDays: number;
  positiveCount: number;
  concernCount: number;
  attendanceConcerns: number;
  sparkline: number[];
}

export interface Project {
  id: string;
  classId: string;
  title: string;
  description: string;
  dueDate: string;
  status: ProjectStatus;
  createdAt: string;
}

export interface ProjectGroup {
  id: string;
  projectId: string;
  name: string;
}

export interface GroupMember {
  groupId: string;
  studentId: string;
  role: GroupMemberRole;
}

export interface KanbanBoard {
  id: string;
  groupId: string;
  projectId: string;
}

export interface KanbanColumn {
  id: string;
  boardId: string;
  name: string;
  position: number;
}

export interface KanbanCard {
  id: string;
  columnId: string;
  boardId: string;
  title: string;
  body: string;
  assigneeId?: string;
  position: number;
  dueDate?: string;
  movedAt: string;
}

export interface Conversation {
  id: string;
  studentId: string;
  guardianId: string;
  teacherId: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: MessageSender;
  body: string;
  createdAt: string;
  aiDraft?: string;
}
