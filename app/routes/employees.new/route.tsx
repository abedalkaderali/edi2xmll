import { Form, redirect, type ActionFunction } from "react-router";
import { getDB } from "~/db/getDB";
import { Link } from "react-router-dom";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const full_name = formData.get("full_name");
  const age = formData.get("age");
  const email = formData.get("email");
  const phone_number = formData.get("phone_number");
  const date_of_birth = formData.get("date_of_birth");

  const ageNumber = Number(age);
  if (isNaN(ageNumber) || ageNumber <= 14) {
    return new Response("Error: Age must be a number greater than 14.", { status: 400 });
  }
  const db = await getDB();
  await db.run(
    'INSERT INTO employees (full_name, age,email,phone_number,date_of_birth) VALUES (?,?,?,?,?)',
    [full_name, age,email,phone_number,date_of_birth]
  );

  return redirect("/employees");
}

export default function NewEmployeePage() {
  return (
    <div>
      <h1>Create New Employee</h1>
      <Form method="post">
        <div>
          <label htmlFor="full_name">Full Name</label>
          <input type="text" name="full_name" id="full_name" required />
        </div>
        <div>
          <label htmlFor="age">Age</label>
          <input type="number" name="age" id="age" min="18" required />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input type="email" name="email" id="email" required />
        </div>
        <div>
          <label htmlFor="phone_number">Phone number</label>
          <input type="tel" name="phone_number" id="phone_number" required />
        </div>
        <div>
          <label htmlFor="date_of_birth">Date of birth</label>
          <input type="date" name="date_of_birth" id="date_of_birth" required />
        </div>

        <button type="submit">Create Employee</button>
      </Form>
      <div style={{ marginTop: "20px" }}>
        <Link to="/employees">View Employees</Link>
      </div>
      <hr />
      <ul>
        <li><a href="/employees">Employees</a></li>
        <li><a href="/timesheets">Timesheets</a></li>
      </ul>
    </div>
  );
}
