import { useLoaderData, useSubmit } from "react-router";
import { useState } from "react";
import { getDB } from "~/db/getDB";


export async function loader() {
  const db = await getDB();
  const timesheetsAndEmployees = await db.all(
    "SELECT timesheets.*, employees.full_name, employees.id AS employee_id FROM timesheets JOIN employees ON timesheets.employee_id = employees.id"
  );

  return { timesheetsAndEmployees };
}


export async function action({ request }) {
  const formData = await request.formData();
  const timesheetId = formData.get("timesheet_id");
  const start_time = formData.get("start_time");
  const end_time = formData.get("end_time");

  const db = await getDB();
  await db.run(
    "UPDATE timesheets SET start_time = ?, end_time = ? WHERE id = ?",
    [start_time, end_time, timesheetId]
  );

  return null;
}

export default function TimesheetsPage() {
  const { timesheetsAndEmployees } = useLoaderData();
  const submit = useSubmit();
  const [selectedTimesheet, setSelectedTimesheet] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedTimesheet, setUpdatedTimesheet] = useState({ start_time: "", end_time: "" });

  
  const handleSelectTimesheet = (timesheet) => {
    setSelectedTimesheet(timesheet);
    setIsEditing(false);
  };

 
  const handleEdit = () => {
    setIsEditing(true);
    setUpdatedTimesheet({
      start_time: selectedTimesheet.start_time,
      end_time: selectedTimesheet.end_time
    });
  };


  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("timesheet_id", selectedTimesheet.id);
    formData.append("start_time", updatedTimesheet.start_time);
    formData.append("end_time", updatedTimesheet.end_time);

    submit(formData, { method: "post" });
    setIsEditing(false);
    setSelectedTimesheet({ selectedTimesheet, updatedTimesheet }); 
  };

  return (
    <div>
      {!selectedTimesheet ? (
      
        <div>
          <h1>Timesheets</h1>
          <div>
            {timesheetsAndEmployees.map((timesheet) => (
              <div key={timesheet.id} onClick={() => handleSelectTimesheet(timesheet)} style={{ cursor: "pointer", padding: "10px", borderBottom: "1px solid #ccc" }}>
                <ul>
                  <li>
                    <strong>Timesheet #{timesheet.id}</strong>
                  </li>
                  <ul>
                    <li>Employee: {timesheet.full_name} (ID: {timesheet.employee_id})</li>
                    <li>Start Time: {timesheet.start_time}</li>
                    <li>End Time: {timesheet.end_time}</li>
                  </ul>
                </ul>
              </div>
            ))}
          </div>
          <hr />
          <ul>
            <li><a href="/timesheets/new">New Timesheet</a></li>
            <li><a href="/employees">Employees</a></li>
          </ul>
        </div>
      ) : (
     
        <div>
          <h2>Timesheet #{selectedTimesheet.id}</h2>
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
              <li><strong>Employee:</strong> {selectedTimesheet.full_name} (ID: {selectedTimesheet.employee_id})</li>
              <li><strong>Start Time:</strong> {selectedTimesheet.start_time}</li>
              <li><strong>End Time:</strong> {selectedTimesheet.end_time}</li>
            </ul>
          )}

          {!isEditing && <button onClick={handleEdit}>Update</button>}
          <button onClick={() => setSelectedTimesheet(null)}>Back to Timesheets</button>
        </div>
      )}
    </div>
  );
}
