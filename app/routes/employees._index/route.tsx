import { useLoaderData } from "react-router"
import { getDB } from "~/db/getDB"
import { Link } from "react-router-dom";

export async function loader() {
  const db = await getDB()
  const employees = await db.all("SELECT * FROM employees;")

  return { employees }
}

export default function EmployeesPage() {
  const { employees } = useLoaderData()
  return (
    <div>
      <div>
        {employees.map((employee: any) => (
          <div>
            <ul>
              <li>Employee #{employee.id}</li>
              <ul>
              <Link to={`/employees/${employee.id}`}><li>Full Name: {employee.full_name}</li></Link>

              </ul>
              <ul>
                <li>Age: {employee.age}</li>
                <li>Email :{employee.email}</li>
                <li>Phone number: {employee.phone_number}</li>
                <li>Date of birth: {employee.date_of_birth}</li>
                
                
              </ul>
            </ul>
          </div>
        ))}
      </div>
      <hr />
      <ul>
        <li><a href="/employees/new">New Employee</a></li>
        <li><a href="/timesheets/">Timesheets</a></li>
      </ul>
    </div>
  )
}
