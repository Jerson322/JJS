import { assignStaffAction } from "@/server/actions/admin-request.actions";

interface AssignStaffFormProps {
  requestId: string;
  staffUsers: { id: string; name: string }[];
  currentStaffId: string | null;
}

export function AssignStaffForm({
  requestId,
  staffUsers,
  currentStaffId,
}: AssignStaffFormProps) {
  return (
    <form
      action={assignStaffAction}
      style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}
    >
      <input type="hidden" name="requestId" value={requestId} />
      <select name="staffUserId" defaultValue={currentStaffId ?? ""}>
        <option value="">Sin asignar</option>
        {staffUsers.map((staff) => (
          <option key={staff.id} value={staff.id}>
            {staff.name}
          </option>
        ))}
      </select>
      <button className="button secondary" type="submit">
        Asignar
      </button>
    </form>
  );
}
