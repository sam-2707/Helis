"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { DigestPanel } from "@/components/digest-panel";
import { EventComposer } from "@/components/event-composer";
import { EventTimeline } from "@/components/event-timeline";
import { ProjectsPanel } from "@/components/projects-panel";
import { PulsePanel } from "@/components/pulse-panel";
import { TeacherInbox } from "@/components/teacher-inbox";
import { flushOutbox } from "@/lib/offline/event-queue";
import type { ClassRoom, Student, StudentEvent } from "@/lib/types";

interface ClassWorkspaceProps {
  classRoom: ClassRoom;
  students: Student[];
  consentByStudent: Record<string, boolean>;
  initialEvents?: StudentEvent[];
}

type Tab = "signals" | "pulse" | "projects" | "inbox";

export function ClassWorkspace({
  classRoom,
  students,
  consentByStudent,
  initialEvents = [],
}: ClassWorkspaceProps) {
  const [events, setEvents] = useState<StudentEvent[]>(initialEvents);
  const [selectedStudentId, setSelectedStudentId] = useState(
    students[0]?.id ?? "",
  );
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("signals");

  const studentNames = useMemo(
    () =>
      Object.fromEntries(students.map((student) => [student.id, student.name])),
    [students],
  );

  const selectedStudent = students.find(
    (student) => student.id === selectedStudentId,
  );

  const loadEvents = useCallback(async () => {
    const response = await fetch(`/api/events?classId=${classRoom.id}`);
    const data = await response.json();
    setEvents(data.events ?? []);
  }, [classRoom.id]);

  useEffect(() => {
    void loadEvents();
    void flushOutbox().then((result) => {
      if (result.flushed > 0) {
        setSyncMessage(`Synced ${result.flushed} offline event(s).`);
        void loadEvents();
      }
    });

    function handleOnline() {
      void flushOutbox().then((result) => {
        if (result.flushed > 0) {
          setSyncMessage(`Synced ${result.flushed} offline event(s).`);
          void loadEvents();
        }
      });
    }

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [loadEvents]);

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "signals", label: "Signals" },
    { id: "pulse", label: "Pulse" },
    { id: "projects", label: "Projects" },
    { id: "inbox", label: "Inbox" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-full px-4 py-2 text-sm ${
              tab === item.id
                ? "bg-[var(--accent)] text-white"
                : "border border-[var(--border)] bg-[var(--surface)]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "signals" ? (
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <EventComposer
              classId={classRoom.id}
              students={students}
              onCreated={() => {
                void loadEvents();
              }}
            />
            <div>
              <h2 className="mb-3 text-xl text-[var(--ink)]">Recent signals</h2>
              <EventTimeline events={events} studentNames={studentNames} />
            </div>
          </div>

          <div className="space-y-4">
            <label className="grid gap-1 text-sm">
              <span className="text-[var(--muted)]">Digest for student</span>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="rounded-lg border border-[var(--border)] bg-white px-3 py-2"
              >
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </label>

            {selectedStudent ? (
              <DigestPanel
                student={selectedStudent}
                hasConsent={consentByStudent[selectedStudent.id] ?? false}
              />
            ) : null}

            {syncMessage ? (
              <p className="text-sm text-[var(--muted)]">{syncMessage}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {tab === "pulse" ? <PulsePanel classId={classRoom.id} /> : null}
      {tab === "projects" ? <ProjectsPanel classId={classRoom.id} /> : null}
      {tab === "inbox" ? <TeacherInbox classId={classRoom.id} /> : null}
    </div>
  );
}
