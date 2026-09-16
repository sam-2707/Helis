import type {
  ClassRoom,
  ConsentRecord,
  Conversation,
  Digest,
  GroupMember,
  Guardian,
  GuardianLink,
  KanbanBoard,
  KanbanCard,
  KanbanColumn,
  Message,
  Project,
  ProjectGroup,
  School,
  Student,
  StudentEvent,
} from "@/lib/types";

const school: School = {
  id: "school-1",
  name: "Green Valley Public School",
};

const classes: ClassRoom[] = [
  {
    id: "class-5a",
    schoolId: school.id,
    grade: 5,
    section: "A",
    name: "Grade 5 — Section A",
  },
  {
    id: "class-6b",
    schoolId: school.id,
    grade: 6,
    section: "B",
    name: "Grade 6 — Section B",
  },
];

const students: Student[] = [
  {
    id: "stu-1",
    classId: "class-5a",
    name: "Arjun Mehta",
    grade: 5,
    preferredLanguage: "hi",
  },
  {
    id: "stu-2",
    classId: "class-5a",
    name: "Priya Sharma",
    grade: 5,
    preferredLanguage: "en",
  },
  {
    id: "stu-3",
    classId: "class-5a",
    name: "Rohan Patel",
    grade: 5,
    preferredLanguage: "hi",
  },
  {
    id: "stu-4",
    classId: "class-5a",
    name: "Ananya Iyer",
    grade: 5,
    preferredLanguage: "en",
  },
  {
    id: "stu-5",
    classId: "class-5a",
    name: "Kabir Singh",
    grade: 5,
    preferredLanguage: "hi",
  },
];

const guardians: Guardian[] = [
  {
    id: "guard-1",
    name: "Rajesh Mehta",
    phone: "+919876543210",
    preferredLanguage: "hi",
  },
  {
    id: "guard-2",
    name: "Sunita Sharma",
    phone: "+919876543211",
    preferredLanguage: "en",
  },
  {
    id: "guard-3",
    name: "Vikram Patel",
    phone: "+919876543212",
    preferredLanguage: "hi",
  },
  {
    id: "guard-4",
    name: "Lakshmi Iyer",
    phone: "+919876543213",
    preferredLanguage: "en",
  },
  {
    id: "guard-5",
    name: "Harpreet Singh",
    phone: "+919876543214",
    preferredLanguage: "hi",
  },
];

const guardianLinks: GuardianLink[] = students.map((student, index) => ({
  guardianId: guardians[index].id,
  studentId: student.id,
}));

const now = Date.now();
const day = 24 * 60 * 60 * 1000;

let events: StudentEvent[] = [
  {
    id: "evt-1",
    studentId: "stu-1",
    classId: "class-5a",
    createdBy: "teacher-1",
    occurredAt: new Date(now - 2 * day).toISOString(),
    type: "academic",
    valence: "positive",
    severity: 1,
    tags: ["math", "participation"],
    body: "Strong participation in fraction exercises.",
  },
  {
    id: "evt-2",
    studentId: "stu-1",
    classId: "class-5a",
    createdBy: "teacher-1",
    occurredAt: new Date(now - 1 * day).toISOString(),
    type: "behavior",
    valence: "concern",
    severity: 2,
    tags: ["homework"],
    body: "Homework not submitted for two consecutive days.",
  },
  {
    id: "evt-3",
    studentId: "stu-1",
    classId: "class-5a",
    createdBy: "teacher-1",
    occurredAt: new Date(now - 0.5 * day).toISOString(),
    type: "win",
    valence: "positive",
    severity: 1,
    tags: ["science"],
    body: "Volunteered to explain the water cycle to the class.",
  },
  {
    id: "evt-4",
    studentId: "stu-2",
    classId: "class-5a",
    createdBy: "teacher-1",
    occurredAt: new Date(now - 1 * day).toISOString(),
    type: "attendance",
    valence: "neutral",
    severity: 1,
    tags: ["late"],
    body: "Arrived 10 minutes late.",
  },
  {
    id: "evt-5",
    studentId: "stu-3",
    classId: "class-5a",
    createdBy: "teacher-1",
    occurredAt: new Date(now - 3 * day).toISOString(),
    type: "attendance",
    valence: "concern",
    severity: 2,
    tags: ["absent"],
    body: "Absent without note.",
  },
  {
    id: "evt-6",
    studentId: "stu-3",
    classId: "class-5a",
    createdBy: "teacher-1",
    occurredAt: new Date(now - 1 * day).toISOString(),
    type: "attendance",
    valence: "concern",
    severity: 2,
    tags: ["late"],
    body: "Late again — third time this week.",
  },
  {
    id: "evt-7",
    studentId: "stu-3",
    classId: "class-5a",
    createdBy: "teacher-1",
    occurredAt: new Date(now - 0.2 * day).toISOString(),
    type: "academic",
    valence: "concern",
    severity: 2,
    tags: ["homework"],
    body: "Math worksheet incomplete.",
  },
  {
    id: "evt-8",
    studentId: "stu-4",
    classId: "class-5a",
    createdBy: "teacher-1",
    occurredAt: new Date(now - 2 * day).toISOString(),
    type: "win",
    valence: "positive",
    severity: 1,
    tags: ["reading"],
    body: "Led peer reading circle confidently.",
  },
  {
    id: "evt-9",
    studentId: "stu-5",
    classId: "class-5a",
    createdBy: "teacher-1",
    occurredAt: new Date(now - 4 * day).toISOString(),
    type: "behavior",
    valence: "concern",
    severity: 1,
    tags: ["focus"],
    body: "Distracted during group work.",
  },
];

let digests: Digest[] = [];
let consents: ConsentRecord[] = [
  {
    id: "consent-1",
    guardianId: "guard-1",
    channel: "whatsapp",
    consentedAt: new Date(now - 7 * day).toISOString(),
    templateVersionAcknowledged: "v1",
  },
  {
    id: "consent-2",
    guardianId: "guard-2",
    channel: "whatsapp",
    consentedAt: new Date(now - 7 * day).toISOString(),
    templateVersionAcknowledged: "v1",
  },
];

const COLUMN_TEMPLATE = ["To Do", "In Progress", "Review", "Done"] as const;

let projects: Project[] = [
  {
    id: "proj-1",
    classId: "class-5a",
    title: "Science Fair — Water Cycle",
    description: "Build a model and present how the water cycle works.",
    dueDate: new Date(now + 14 * day).toISOString(),
    status: "active",
    createdAt: new Date(now - 5 * day).toISOString(),
  },
];

let projectGroups: ProjectGroup[] = [
  { id: "grp-a", projectId: "proj-1", name: "Group A" },
  { id: "grp-b", projectId: "proj-1", name: "Group B" },
];

let groupMembers: GroupMember[] = [
  { groupId: "grp-a", studentId: "stu-1", role: "leader" },
  { groupId: "grp-a", studentId: "stu-2", role: "member" },
  { groupId: "grp-a", studentId: "stu-3", role: "member" },
  { groupId: "grp-b", studentId: "stu-4", role: "leader" },
  { groupId: "grp-b", studentId: "stu-5", role: "member" },
];

let boards: KanbanBoard[] = [
  { id: "board-a", groupId: "grp-a", projectId: "proj-1" },
  { id: "board-b", groupId: "grp-b", projectId: "proj-1" },
];

let columns: KanbanColumn[] = [
  ...COLUMN_TEMPLATE.map((name, position) => ({
    id: `col-a-${position}`,
    boardId: "board-a",
    name,
    position,
  })),
  ...COLUMN_TEMPLATE.map((name, position) => ({
    id: `col-b-${position}`,
    boardId: "board-b",
    name,
    position,
  })),
];

let cards: KanbanCard[] = [
  {
    id: "card-1",
    columnId: "col-a-2",
    boardId: "board-a",
    title: "Build prototype",
    body: "Cardboard model of evaporation and condensation.",
    assigneeId: "stu-1",
    position: 0,
    dueDate: new Date(now + 3 * day).toISOString(),
    movedAt: new Date(now - 1 * day).toISOString(),
  },
  {
    id: "card-2",
    columnId: "col-a-0",
    boardId: "board-a",
    title: "Presentation slides",
    body: "5 slides max — labels in EN + HI.",
    assigneeId: "stu-2",
    position: 0,
    dueDate: new Date(now - 1 * day).toISOString(),
    movedAt: new Date(now - 3 * day).toISOString(),
  },
  {
    id: "card-3",
    columnId: "col-a-1",
    boardId: "board-a",
    title: "Research notes",
    body: "Collect 3 facts from textbook chapter 4.",
    assigneeId: "stu-3",
    position: 0,
    movedAt: new Date(now - 2 * day).toISOString(),
  },
  {
    id: "card-4",
    columnId: "col-b-3",
    boardId: "board-b",
    title: "Poster layout",
    body: "Final poster approved by teacher.",
    assigneeId: "stu-4",
    position: 0,
    movedAt: new Date(now - 0.5 * day).toISOString(),
  },
  {
    id: "card-5",
    columnId: "col-b-1",
    boardId: "board-b",
    title: "Demo rehearsal",
    body: "Practice 2-minute talk.",
    assigneeId: "stu-5",
    position: 0,
    movedAt: new Date(now - 1 * day).toISOString(),
  },
];

let conversations: Conversation[] = [
  {
    id: "conv-1",
    studentId: "stu-1",
    guardianId: "guard-1",
    teacherId: "teacher-1",
    updatedAt: new Date(now - 0.1 * day).toISOString(),
  },
];

let messages: Message[] = [
  {
    id: "msg-1",
    conversationId: "conv-1",
    sender: "parent",
    body: "How has Arjun been with homework this week?",
    createdAt: new Date(now - 0.1 * day).toISOString(),
  },
];

function nextId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export const demoStore = {
  getSchool() {
    return school;
  },

  listClasses() {
    return classes;
  },

  getClass(classId: string) {
    return classes.find((item) => item.id === classId);
  },

  listStudentsByClass(classId: string) {
    return students.filter((student) => student.classId === classId);
  },

  listStudents() {
    return students;
  },

  getStudent(studentId: string) {
    return students.find((student) => student.id === studentId);
  },

  listGuardians() {
    return guardians;
  },

  getGuardian(guardianId: string) {
    return guardians.find((g) => g.id === guardianId);
  },

  listEventsForStudent(studentId: string) {
    return events
      .filter((event) => event.studentId === studentId)
      .sort(
        (a, b) =>
          new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
      );
  },

  listEventsForClass(classId: string) {
    return events
      .filter((event) => event.classId === classId)
      .sort(
        (a, b) =>
          new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
      );
  },

  addEvent(input: Omit<StudentEvent, "id" | "createdBy" | "occurredAt"> & { createdBy?: string; occurredAt?: string }) {
    const event: StudentEvent = {
      id: nextId("evt"),
      createdBy: input.createdBy ?? "teacher-1",
      occurredAt: input.occurredAt ?? new Date().toISOString(),
      studentId: input.studentId,
      classId: input.classId,
      type: input.type,
      valence: input.valence,
      severity: input.severity,
      tags: input.tags,
      body: input.body,
      sourceRef: input.sourceRef,
    };
    events = [event, ...events];
    return event;
  },

  getGuardianForStudent(studentId: string) {
    const link = guardianLinks.find((item) => item.studentId === studentId);
    if (!link) return undefined;
    return guardians.find((guardian) => guardian.id === link.guardianId);
  },

  listChildrenForGuardian(guardianId: string) {
    const ids = guardianLinks
      .filter((l) => l.guardianId === guardianId)
      .map((l) => l.studentId);
    return students.filter((s) => ids.includes(s.id));
  },

  hasConsentForStudent(studentId: string) {
    const guardian = this.getGuardianForStudent(studentId);
    if (!guardian) return false;
    return consents.some((consent) => consent.guardianId === guardian.id);
  },

  saveDigest(digest: Omit<Digest, "id">) {
    const saved: Digest = { id: nextId("dig"), ...digest };
    digests = [
      saved,
      ...digests.filter((item) => item.studentId !== digest.studentId),
    ];
    return saved;
  },

  getLatestDigest(studentId: string) {
    return digests.find((digest) => digest.studentId === studentId);
  },

  getDigestById(id: string) {
    return digests.find((digest) => digest.id === id);
  },

  updateDigest(id: string, patch: Partial<Digest>) {
    digests = digests.map((digest) =>
      digest.id === id ? { ...digest, ...patch } : digest,
    );
    return digests.find((digest) => digest.id === id);
  },

  // ——— Projects / Kanban ———

  listProjectsByClass(classId: string) {
    return projects.filter((p) => p.classId === classId);
  },

  getProject(projectId: string) {
    return projects.find((p) => p.id === projectId);
  },

  createProject(input: {
    classId: string;
    title: string;
    description: string;
    dueDate: string;
    groupCount: number;
  }) {
    const project: Project = {
      id: nextId("proj"),
      classId: input.classId,
      title: input.title,
      description: input.description,
      dueDate: input.dueDate,
      status: "active",
      createdAt: new Date().toISOString(),
    };
    projects = [project, ...projects];

    const classStudents = this.listStudentsByClass(input.classId);
    const groupCount = Math.max(1, Math.min(input.groupCount, classStudents.length));

    for (let i = 0; i < groupCount; i++) {
      const group: ProjectGroup = {
        id: nextId("grp"),
        projectId: project.id,
        name: `Group ${String.fromCharCode(65 + i)}`,
      };
      projectGroups = [...projectGroups, group];

      const board: KanbanBoard = {
        id: nextId("board"),
        groupId: group.id,
        projectId: project.id,
      };
      boards = [...boards, board];

      for (let p = 0; p < COLUMN_TEMPLATE.length; p++) {
        columns = [
          ...columns,
          {
            id: nextId("col"),
            boardId: board.id,
            name: COLUMN_TEMPLATE[p],
            position: p,
          },
        ];
      }

      // Round-robin assign students
      const slice = classStudents.filter((_, idx) => idx % groupCount === i);
      for (let m = 0; m < slice.length; m++) {
        groupMembers = [
          ...groupMembers,
          {
            groupId: group.id,
            studentId: slice[m].id,
            role: m === 0 ? "leader" : "member",
          },
        ];
      }
    }

    return project;
  },

  listGroupsByProject(projectId: string) {
    return projectGroups.filter((g) => g.projectId === projectId);
  },

  getGroup(groupId: string) {
    return projectGroups.find((g) => g.id === groupId);
  },

  listMembersByGroup(groupId: string) {
    return groupMembers.filter((m) => m.groupId === groupId);
  },

  getGroupForStudent(projectId: string, studentId: string) {
    const groupIds = projectGroups
      .filter((g) => g.projectId === projectId)
      .map((g) => g.id);
    const membership = groupMembers.find(
      (m) => groupIds.includes(m.groupId) && m.studentId === studentId,
    );
    if (!membership) return undefined;
    return projectGroups.find((g) => g.id === membership.groupId);
  },

  getBoardByGroup(groupId: string) {
    return boards.find((b) => b.groupId === groupId);
  },

  getBoard(boardId: string) {
    return boards.find((b) => b.id === boardId);
  },

  listColumnsByBoard(boardId: string) {
    return columns
      .filter((c) => c.boardId === boardId)
      .sort((a, b) => a.position - b.position);
  },

  listCardsByBoard(boardId: string) {
    return cards
      .filter((c) => c.boardId === boardId)
      .sort((a, b) => a.position - b.position);
  },

  getCard(cardId: string) {
    return cards.find((c) => c.id === cardId);
  },

  addCard(input: {
    boardId: string;
    columnId: string;
    title: string;
    body: string;
    assigneeId?: string;
    dueDate?: string;
  }) {
    const existing = cards.filter((c) => c.columnId === input.columnId);
    const card: KanbanCard = {
      id: nextId("card"),
      boardId: input.boardId,
      columnId: input.columnId,
      title: input.title,
      body: input.body,
      assigneeId: input.assigneeId,
      position: existing.length,
      dueDate: input.dueDate,
      movedAt: new Date().toISOString(),
    };
    cards = [...cards, card];
    return card;
  },

  moveCard(cardId: string, toColumnId: string) {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return undefined;

    const fromColumn = columns.find((c) => c.id === card.columnId);
    const toColumn = columns.find((c) => c.id === toColumnId);
    if (!toColumn) return undefined;

    const board = boards.find((b) => b.id === card.boardId);
    const group = board
      ? projectGroups.find((g) => g.id === board.groupId)
      : undefined;
    const project = group
      ? projects.find((p) => p.id === group.projectId)
      : undefined;

    cards = cards.map((c) =>
      c.id === cardId
        ? {
            ...c,
            columnId: toColumnId,
            movedAt: new Date().toISOString(),
            position: cards.filter((x) => x.columnId === toColumnId).length,
          }
        : c,
    );

    const updated = cards.find((c) => c.id === cardId)!;

    // Emit StudentEvent for digest/Pulse when card moves to Done or is overdue concern
    if (project && updated.assigneeId) {
      const isDone = toColumn.name === "Done";
      const wasDone = fromColumn?.name === "Done";
      if (isDone && !wasDone) {
        this.addEvent({
          studentId: updated.assigneeId,
          classId: project.classId,
          type: "academic",
          valence: "positive",
          severity: 1,
          tags: ["project", "kanban"],
          body: `${group?.name ?? "Group"} moved "${updated.title}" to Done.`,
          sourceRef: updated.id,
          createdBy: "system",
        });
      } else if (
        !isDone &&
        updated.dueDate &&
        new Date(updated.dueDate) < new Date()
      ) {
        this.addEvent({
          studentId: updated.assigneeId,
          classId: project.classId,
          type: "academic",
          valence: "concern",
          severity: 2,
          tags: ["project", "kanban", "overdue"],
          body: `${group?.name ?? "Group"}: "${updated.title}" is overdue (now in ${toColumn.name}).`,
          sourceRef: updated.id,
          createdBy: "system",
        });
      }
    }

    return updated;
  },

  // ——— Conversations ———

  getOrCreateConversation(studentId: string) {
    const existing = conversations.find((c) => c.studentId === studentId);
    if (existing) return existing;

    const guardian = this.getGuardianForStudent(studentId);
    if (!guardian) return undefined;

    const conv: Conversation = {
      id: nextId("conv"),
      studentId,
      guardianId: guardian.id,
      teacherId: "teacher-1",
      updatedAt: new Date().toISOString(),
    };
    conversations = [conv, ...conversations];
    return conv;
  },

  listConversationsByClass(classId: string) {
    const studentIds = this.listStudentsByClass(classId).map((s) => s.id);
    return conversations.filter((c) => studentIds.includes(c.studentId));
  },

  getConversation(conversationId: string) {
    return conversations.find((c) => c.id === conversationId);
  },

  listMessages(conversationId: string) {
    return messages
      .filter((m) => m.conversationId === conversationId)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
  },

  addMessage(input: {
    conversationId: string;
    sender: Message["sender"];
    body: string;
    aiDraft?: string;
  }) {
    const message: Message = {
      id: nextId("msg"),
      conversationId: input.conversationId,
      sender: input.sender,
      body: input.body,
      createdAt: new Date().toISOString(),
      aiDraft: input.aiDraft,
    };
    messages = [...messages, message];
    conversations = conversations.map((c) =>
      c.id === input.conversationId
        ? { ...c, updatedAt: message.createdAt }
        : c,
    );
    return message;
  },

  setMessageAiDraft(messageId: string, aiDraft: string) {
    messages = messages.map((m) =>
      m.id === messageId ? { ...m, aiDraft } : m,
    );
    return messages.find((m) => m.id === messageId);
  },
};
