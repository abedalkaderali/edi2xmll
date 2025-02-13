import { useLoaderData, useSubmit } from "react-router";
import { useState } from "react";
import { getDB } from "~/db/getDB";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

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
  const [viewMode, setViewMode] = useState("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const filteredTimesheets = timesheetsAndEmployees.filter(ts => 
    ts.full_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedEmployee === "" || ts.employee_id.toString() === selectedEmployee)
  );

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
          <button onClick={() => setViewMode(viewMode === "table" ? "calendar" : "table")}>Toggle View</button>
          <input 
            type="text" 
            placeholder="Search by Employee Name" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select onChange={(e) => setSelectedEmployee(e.target.value)} value={selectedEmployee}>
            <option value="">All Employees</option>
            {Array.from(new Set(timesheetsAndEmployees.map(ts => ts.employee_id))).map(id => (
              <option key={id} value={id}>{timesheetsAndEmployees.find(ts => ts.employee_id === id).full_name}</option>
            ))}
          </select>
          {viewMode === "calendar" ? (
            <FullCalendar
              plugins={[dayGridPlugin]}
              initialView="dayGridMonth"
              events={filteredTimesheets.map(ts => ({
                title: ts.full_name,
                start: ts.start_time,
                end: ts.end_time
              }))}
            />
          ) : (
            <table border="1" width="100%">
              <thead>
                <tr>
                  <th>Timesheet ID</th>
                  <th>Employee</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTimesheets.map((timesheet) => (
                  <tr key={timesheet.id}>
                    <td>{timesheet.id}</td>
                    <td>{timesheet.full_name} (ID: {timesheet.employee_id})</td>
                    <td>{timesheet.start_time}</td>
                    <td>{timesheet.end_time}</td>
                    <td><a href={`/timesheets/${timesheet.id}`}>View</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
