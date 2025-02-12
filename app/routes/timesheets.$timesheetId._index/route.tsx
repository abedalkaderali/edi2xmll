import { useLoaderData, Form, useNavigate, useSubmit } from "react-router";
import { getDB } from "~/db/getDB";
import { useState } from "react";
import { Link } from "react-router-dom";

export async function loader({ params }) {
  const db = await getDB();
  const timesheet = await db.get("SELECT * FROM timesheets WHERE id=?;", [params.timesheetId]);

  if (!timesheet) {
    throw new Response("Timesheet Not Found", { status: 404 });
  }
  return { timesheet };
}


export async function action({ request, params }) {
  const formData = await request.formData();
  const start_time = formData.get("start_time");
  const end_time = formData.get("end_time");

  const db = await getDB();
  await db.run(
    "UPDATE timesheets SET start_time = ?, end_time = ? WHERE id = ?",
    [start_time, end_time, params.timesheetId]
  );

  return null; 
}

export default function TimesheetPage() {
  const { timesheet } = useLoaderData();
  const navigate = useNavigate();
  const submit = useSubmit();
  const [isEditing, setIsEditing] = useState(false);
  const [updatedTimesheet, setUpdatedTimesheet] = useState({
    start_time: timesheet?.start_time,
    end_time: timesheet?.end_time
  });

 
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("start_time", updatedTimesheet.start_time);
    formData.append("end_time", updatedTimesheet.end_time);

    submit(formData, { method: "post" });
    setIsEditing(false);
  };

  return (
    <div>
      <h2>Timesheet #{timesheet?.id}</h2>
      
      {isEditing ? (
        
        <form onSubmit={handleSubmit}>
          <label>
            Start Time:
            <input
              type="datetime-local"
              name="start_time"
              value={updatedTimesheet.start_time}
              onChange={(e) => setUpdatedTimesheet({ ...updatedTimesheet, start_time: e.target.value })}
              required
            />
          </label>
          <br />
          <label>
            End Time:
            <input
              type="datetime-local"
              name="end_time"
              value={updatedTimesheet.end_time}
              onChange={(e) => setUpdatedTimesheet({ ...updatedTimesheet, end_time: e.target.value })}
              required
            />
          </label>
          <br />
          <button type="submit">Save</button>
          <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
        </form>
      ) : (
      
        <ul>
          <li><strong>Employee:</strong> {timesheet?.employee_name} (ID: {timesheet?.employee_id})</li>
          <li><strong>Start Time:</strong> {timesheet?.start_time}</li>
          <li><strong>End Time:</strong> {timesheet?.end_time}</li>
        </ul>
      )}

      {!isEditing && <button onClick={() => setIsEditing(true)}>Update</button>}

      <ul>
        <li><Link to='/timesheets'>Go to Timesheets</Link></li>
        <li><Link to='/employees'>Go to Employees</Link></li>
      </ul>
    </div>
  );
}
