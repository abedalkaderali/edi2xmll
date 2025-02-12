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
  const age = formData.get("age");
  const email = formData.get("email");
  const phone_number = formData.get("phone_number");
  const date_of_birth = formData.get("date_of_birth");

  const db = await getDB();
  await db.run(
    "UPDATE employees SET full_name = ?, age = ?, email = ?, phone_number = ?, date_of_birth = ? WHERE id = ?",
    [full_name, age, email, phone_number, date_of_birth, params.employeeId]
  );

  return null; 
}

export default function EmployeePage() {
  const { employee } = useLoaderData();
  const submit = useSubmit();
  const [isEditing, setIsEditing] = useState(false);
  const [updatedEmployee, setUpdatedEmployee] = useState({
    full_name: employee?.full_name,
    age: employee?.age,
    email: employee?.email,
    phone_number: employee?.phone_number,
    date_of_birth: employee?.date_of_birth
  });

  
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("full_name", updatedEmployee.full_name);
    formData.append("age", updatedEmployee.age);
    formData.append("email", updatedEmployee.email);
    formData.append("phone_number", updatedEmployee.phone_number);
    formData.append("date_of_birth", updatedEmployee.date_of_birth);

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
            Age:
            <input
              type="number"
              name="age"
              value={updatedEmployee.age}
              onChange={(e) => setUpdatedEmployee({ ...updatedEmployee, age: e.target.value })}
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
          <button type="submit">Save</button>
          <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
        </form>
      ) : (
        
        <ul>
          <li><strong>Full Name:</strong> {employee?.full_name}</li>
          <li><strong>Age:</strong> {employee?.age}</li>
          <li><strong>Email:</strong> {employee?.email}</li>
          <li><strong>Phone number:</strong> {employee?.phone_number}</li>
          <li><strong>Date of birth:</strong> {employee?.date_of_birth}</li>
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
