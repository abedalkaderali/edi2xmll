import { useLoaderData, useSubmit } from "react-router";
import { getDB } from "~/db/getDB";
import { useState } from "react";
import { Link } from "react-router-dom";

export async function loader({ params }) {
  const db = await getDB();
  const employee = await db.get("SELECT * FROM employees WHERE id=?;", [params.employeeId]);

  if (!employee) {
    throw new Response("Employee Not Found", { status: 404 });
  }
  return { employee };
}


export async function action({ request, params }) {
  const formData = await request.formData();
  const full_name = formData.get("full_name");
  const email = formData.get("email");
  const phone_number = formData.get("phone_number");
  const date_of_birth = formData.get("date_of_birth");
  const job_title = formData.get("job_title");
  const department = formData.get("department");
  const salary = formData.get("salary");
  const start_date = formData.get("start_date");
  const end_date = formData.get("end_date");

  const db = await getDB();
await db.run(
  `UPDATE employees 
   SET full_name = ?, email = ?, phone_number = ?, date_of_birth = ?, 
       job_title = ?, department = ?, salary = ?, start_date = ?, end_date = ? 
   WHERE id = ?`,
  [full_name, email, phone_number, date_of_birth, 
   job_title, department, salary, start_date, end_date, params.employeeId]
);


  return null; 
}

export default function EmployeePage() {
  const { employee } = useLoaderData();
  const submit = useSubmit();
  const [isEditing, setIsEditing] = useState(false);
  const [updatedEmployee, setUpdatedEmployee] = useState({
    full_name: employee?.full_name,
    email: employee?.email,
    phone_number: employee?.phone_number,
    date_of_birth: employee?.date_of_birth,
    job_title: employee?.job_title,
    department: employee?.department,
    salary: employee?.salary,
    start_date: employee?.start_date,
    end_date: employee?.end_date
  });

  
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("full_name", updatedEmployee.full_name);
    formData.append("email", updatedEmployee.email);
    formData.append("phone_number", updatedEmployee.phone_number);
    formData.append("date_of_birth", updatedEmployee.date_of_birth);
    formData.append("job_title", updatedEmployee.job_title);
    formData.append("department", updatedEmployee.department);
    formData.append("salary", updatedEmployee.salary);
    formData.append("start_date", updatedEmployee.start_date);
    formData.append("end_date", updatedEmployee.end_date);

    submit(formData, { method: "post" });
    setIsEditing(false);
  };

  return (
    <div>
      <h2>Employee #{employee?.id}</h2>

      {isEditing ? (
        
        <form onSubmit={handleSubmit}>
          <label>
            Full Name:
            <input
              type="text"
              name="full_name"
              value={updatedEmployee.full_name}
              onChange={(e) => setUpdatedEmployee({ ...updatedEmployee, full_name: e.target.value })}
              required
            />
          </label>
          <br />
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={updatedEmployee.email}
              onChange={(e) => setUpdatedEmployee({ ...updatedEmployee, email: e.target.value })}
              required
            />
          </label>
          <br />
          <label>
            Phone Number:
            <input
              type="tel"
              name="phone_number"
              value={updatedEmployee.phone_number}
              onChange={(e) => setUpdatedEmployee({ ...updatedEmployee, phone_number: e.target.value })}
              required
            />
          </label>
          <br />
          <label>
            Date of Birth:
            <input
              type="date"
              name="date_of_birth"
              value={updatedEmployee.date_of_birth}
              onChange={(e) => setUpdatedEmployee({ ...updatedEmployee, date_of_birth: e.target.value })}
              required
            />
          </label>
          <br />
          <label>
          Job Title:
              <input
                type="text"
                name="job_title"
                value={updatedEmployee.job_title}
                onChange={(e) => setUpdatedEmployee({ ...updatedEmployee, job_title: e.target.value })}
                required
              />
          </label>
          <br />
          <label>
              Department:
              <input
                  type="text"
                  name="department"
                  value={updatedEmployee.department}
                  onChange={(e) => setUpdatedEmployee({ ...updatedEmployee, department: e.target.value })}
                  required
              />
          </label>
          <br />
          <label>
              Salary:
              <input
                  type="number"
                  name="salary"
                  value={updatedEmployee.salary}
                  onChange={(e) => setUpdatedEmployee({ ...updatedEmployee, salary: e.target.value })}
                  required
              />
          </label>
          <br />
          <label>
              Start Date:
              <input
                  type="date"
                  name="start_date"
                  value={updatedEmployee.start_date}
                  onChange={(e) => setUpdatedEmployee({ ...updatedEmployee, start_date: e.target.value })}
                  required
              />
          </label>
          <br />
          <label>
              End Date:
              <input
                  type="date"
                  name="end_date"
                  value={updatedEmployee.end_date}
                  onChange={(e) => setUpdatedEmployee({ ...updatedEmployee, end_date: e.target.value })}
              />
          </label>
          <br />
          <button type="submit">Save</button>
          <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
        </form>
      ) : (
        
        <ul>
          <li><strong>Full Name:</strong> {employee?.full_name}</li>
          <li><strong>Email:</strong> {employee?.email}</li>
          <li><strong>Phone number:</strong> {employee?.phone_number}</li>
          <li><strong>Date of birth:</strong> {employee?.date_of_birth}</li>
          <li><strong>Job Title:</strong> {employee?.job_title}</li>
          <li><strong>Department:</strong> {employee?.department}</li>
          <li><strong>Salary:</strong> {employee?.salary}</li>
          <li><strong>Start Date:</strong> {employee?.start_date}</li>
          <li><strong>End Date:</strong> {employee?.end_date || "N/A"}</li>
        </ul>
      )}

      {!isEditing && <button onClick={() => setIsEditing(true)}>Update</button>}

      <ul>
        <li><Link to='/employees'>Go to Employees</Link></li>
        <li><Link to='/timesheets'>Go to Timesheets</Link></li>
      </ul>
    </div>
  );
}
