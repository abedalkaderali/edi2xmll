import { useLoaderData, Form, redirect } from "react-router";
import { getDB } from "~/db/getDB";
import React, { useState } from "react";


export async function loader() {
  const db = await getDB();
  const employees = await db.all("SELECT id, full_name FROM employees"); 
  return { employees };
}


export const action = async ({ request }) => {
  const formData = await request.formData();
  const employee_id = formData.get("employee_id"); 
  const start_time = formData.get("start_time");
  const end_time = formData.get("end_time");
  const summary = formData.get("summary");


  if (new Date(start_time) >= new Date(end_time)) {
    return new Response("Start time must be before end time", { status: 400 });
  }

  const db = await getDB();
  await db.run(
    "INSERT INTO timesheets (employee_id, start_time, end_time, summary) VALUES (?, ?, ?, ?)",
    [employee_id, start_time, end_time, summary]
  );

  return redirect("/timesheets"); 
};


export default function NewTimesheetPage() {
  const { employees } = useLoaderData();
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState("");
  const [summary, setSummary] = useState("");

 
  const validateTimes = (event) => {
    if (new Date(startTime) >= new Date(endTime)) {
      event.preventDefault();
      setError("Start time must be before end time.");
    } else {
      setError("");
    }
  };

  return (
    <div>
      <h1>Create New Timesheet</h1>
      <Form method="post" onSubmit={validateTimes}>
        
      
        <div>
          <label className="block text-lg font-semibold mb-2">Select Employee:</label>
          <select
            name="employee_id"
            className="w-full p-2 border rounded-lg"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            required
          >
            <option value="">-- Choose an Employee --</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.full_name}
              </option>
            ))}
          </select>

          {selectedEmployee && (
            <p className="mt-4 text-gray-700">
              Selected Employee: <strong>{employees.find(emp => emp.id == selectedEmployee)?.full_name}</strong>
            </p>
          )}
        </div>

       
        <div>
          <label htmlFor="start_time">Start Time</label>
          <input
            type="datetime-local"
            name="start_time"
            id="start_time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>

       
        <div>
          <label htmlFor="end_time">End Time</label>
          <input
            type="datetime-local"
            name="end_time"
            id="end_time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>

       
        {error && <p style={{ color: "red" }}>{error}</p>}

        
        <div>
          <label htmlFor="summary">Summary of Work Done</label>
          <textarea
            name="summary"
            id="summary"
            rows="4"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            required
          ></textarea>
        </div>

       
        <button type="submit">Create Timesheet</button>
      </Form>

      <hr />
      
      
      <ul>
        <li><a href="/timesheets">Timesheets</a></li>
        <li><a href="/employees">Employees</a></li>
      </ul>
    </div>
  );
}
