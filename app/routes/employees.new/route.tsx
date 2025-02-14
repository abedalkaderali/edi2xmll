import { Form, redirect, type ActionFunction } from "react-router";
import { getDB } from "~/db/getDB";
import { Link } from "react-router-dom";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const uploadDir = path.join(__dirname,"..", "..", "media");

if (!fs.existsSync(uploadDir)) {
  throw new Error("Media folder does not exist. Please create 'media' inside 'app' manually.");
}

const writeFile = promisify(fs.writeFile);
const MIN_SALARY = 30000;

export const action: ActionFunction = async ({ request }) => {
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
  const photo = formData.get("photo");
  const documents = formData.getAll("documents");
 
  const today = new Date();
  

  const salaryNumber = Number(salary);
  if (isNaN(salaryNumber) || salaryNumber < MIN_SALARY) {
    return new Response(`Error: Salary must be at least ${MIN_SALARY}.`, { status: 400 });
  }

  if (!documents || documents.length === 0) {
    return new Response("Error: At least one document (CV, ID, etc.) must be uploaded.", { status: 400 });
  }

  let photoFilename = null;
  if (photo && photo.name) {
    photoFilename = `${Date.now()}_${photo.name}`;
    const photoPath = path.join(uploadDir, photoFilename);
    const photoBuffer = Buffer.from(await photo.arrayBuffer());
    await writeFile(photoPath, photoBuffer);
  }

  const documentFilenames = [];
  for (const doc of documents) {
    if (doc && doc.name) {
      const docFilename = `${Date.now()}_${doc.name}`;
      const docPath = path.join(uploadDir, docFilename);
      const docBuffer = Buffer.from(await doc.arrayBuffer());
      await writeFile(docPath, docBuffer);
      documentFilenames.push(docFilename);
    }
  }
  

  const db = await getDB();
  await db.run(
    'INSERT INTO employees (full_name, email, phone_number, date_of_birth, job_title, department, salary, start_date, end_date) VALUES (?,?,?,?,?,?,?,?,?)',
    [full_name, email, phone_number, date_of_birth, job_title, department, salary, start_date, end_date]
  );

  return redirect("/employees");
};

export default function NewEmployeePage() {
  return (
    <div>
      <h1>Create New Employee</h1>
      <Form method="post" encType="multipart/form-data">
        <div>
          <label htmlFor="full_name">Full Name</label>
          <input type="text" name="full_name" id="full_name" required />
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
          <input
                type="date"
                name="date_of_birth"
                id="date_of_birth"
                required
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
              />

        </div>
        <div>
          <label htmlFor="job_title">Job Title:</label>
          <input type="text" id="job_title" name="job_title" required />
        </div>
        <div>
          <label htmlFor="department">Department:</label>
          <input type="text" id="department" name="department" required />
        </div>
        <div>
          <label htmlFor="salary">Salary:</label>
          <input type="number" id="salary" name="salary" min="30000" required />
        </div>
        <div>
          <label htmlFor="start_date">Start Date:</label>
          <input type="date" id="start_date" name="start_date" required />
        </div>
        <div>
          <label htmlFor="end_date">End Date:</label>
          <input type="date" id="end_date" name="end_date" />
        </div>
        <div>
          <label htmlFor="photo">Employee Photo:</label>
          <input type="file" id="photo" name="photo" accept="image/*" required />
        </div>
        <div>
          <label htmlFor="documents">Upload Documents (CV, ID, etc.):</label>
          <input type="file" id="documents" name="documents" multiple required />
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
