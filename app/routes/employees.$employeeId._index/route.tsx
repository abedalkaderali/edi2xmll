import { useLoaderData } from "react-router"
import { getDB } from "~/db/getDB"
import { Link } from "react-router-dom";

export async function loader({params}:{ params: { employeeId: string } } ) {
  const db = await getDB()
  const employee = await db.get("SELECT * FROM employees WHERE id=?;", [params.employeeId]);

  if (!employee) {
    throw new Response("Employee Not Found", { status: 404 });
  }
  return { employee }
}

export default function EmployeePage() {
  const { employee } = useLoaderData();

  return (
    <div>
      <div>
        <ul>
          <li>Employee #{employee?.id}</li>
          <ul>
          <li>Full Name: {employee?.full_name}</li>
          </ul>
          <ul>
            <li>Age: {employee?.age}</li>
          </ul>
        </ul>
      </div>
      <ul>
        <li>
          <Link to='/employees/new'>Go to Employees</Link>
        </li>
        <li>
          <Link to='/timesheets'>Go to timesheets</Link>
        </li>
        <li><a href="/employees">Employees</a></li>
        <li><a href="/employees/new">New Employee</a></li>
        <li><a href="/timesheets/">Timesheets</a></li>
      </ul>
    </div>
  )
}
