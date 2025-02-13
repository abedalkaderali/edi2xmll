import { useLoaderData } from "react-router";
import { getDB } from "~/db/getDB";
import { Link } from "react-router-dom";
import { useState } from "react";

export async function loader() {
  const db = await getDB();
  const employees = await db.all("SELECT * FROM employees;");

  return { employees };
}

export default function EmployeesPage() {
  const { employees } = useLoaderData();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredEmployees = employees
    .filter(employee => 
      employee.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortOrder === "asc" ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <h1>Employees</h1>
      <input
        type="text"
        placeholder="Search by Full Name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <select onChange={(e) => setSortField(e.target.value)}>
        <option value="id">ID</option>
        <option value="full_name">Full Name</option>
        <option value="age">Age</option>
      </select>
      <button onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
        Toggle Sort Order
      </button>
      <table border="1" width="100%">
        <thead>
          <tr>
            <th>ID</th>
            <th>Full Name</th>
            <th>Age</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Date of Birth</th>
          </tr>
        </thead>
        <tbody>
          {paginatedEmployees.map(employee => (
            <tr key={employee.id}>
              <td>{employee.id}</td>
              <td>
                <Link to={`/employees/${employee.id}`}>{employee.full_name}</Link>
              </td>
              <td>{employee.age}</td>
              <td>{employee.email}</td>
              <td>{employee.phone_number}</td>
              <td>{employee.date_of_birth}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </button>
        <span> Page {currentPage} </span>
        <button
          disabled={currentPage * itemsPerPage >= filteredEmployees.length}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>
      <hr />
      <ul>
        <li><a href="/employees/new">New Employee</a></li>
        <li><a href="/timesheets/">Timesheets</a></li>
      </ul>
    </div>
  );
}
