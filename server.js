// importing all 
import mysql from "mysql2"
import inquirer from "inquirer"
import table from "console.table"
import "dotenv/config"
import express from "express"

// connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.MYSQL_PASSWORD,
  database: 'employee_mgmt_db'
});

connection.connect(err => {
  if (err) throw err;
  console.log('connected as id ' + connection.threadId);
  // once connection is established, questions for the users are displayed
  userQuestions();
});

// inquirer prompt for user questions 
const userQuestions = () => {
  inquirer.prompt ([
    {
      type: "list", 
      message: "select the task you want to perform", 
      name:"options",
      options: [
                "view all departments", 
                "view all roles",
                "view all employees",
                "add a department",
                "add a role",
                "add an employee",
                "update an employee role",
                'No Action'
            ]
    }
  ])
  // function is chosen based on the option selected by the user
    .then((responses) => {
      const { options } = responses; 

      if(options === "view all departments"){
            showDepartments();
      }   
      if(options === "view all roles"){
        showDepartments();
      }
      if(options === "view all employees"){
        showEmployees();
      }
      if(options === "add a department"){
        addDepartment();
      }
      if(options === "add a role"){
        addRole();
      }
      if(options === "add an employee"){
        addEmployee();
      }   
      if(options === "update an employee"){
        updateEmployee();
      }               
      if (options === "No Action") {
        connection.end()
    };
  });
};


//function for displaying all departments
function showDepartments(){
    console.log("Displaying all departments!\n")
    const sql = `SELECT department.id AS id, department.name AS department FROM department`; 
    connection.promise().query(sql, (err, rows) => {
        if (err) throw err;
        console.table(rows);
        userQuestions();
      });
};

// function to display all employees
function showEmployees(){
    console.log('Displaying all employees!\n'); 
    const sql = `SELECT employee.id, 
                        employee.first_name, 
                        employee.last_name, 
                        role.title, 
                        department.name AS department,
                        role.salary, 
                        CONCAT (manager.first_name, " ", manager.last_name) AS manager
                FROM employee
                        LEFT JOIN role ON employee.role_id = role.id
                        LEFT JOIN department ON role.department_id = department.id
                        LEFT JOIN employee manager ON employee.manager_id = manager.id`;

    connection.promise().query(sql, (err, rows) => {
        if (err) throw err; 
        console.table(rows);
        userQuestions();
    });
}

// function to display all roles
function showRoles(){
    console.log('Displaying all roles!\n');
    const sql = `SELECT role.id, role.title, department.name AS department
               FROM role
               INNER JOIN department ON role.department_id = department.id`;
    connection.promise().query(sql, (err, rows) => {
        if (err) throw err; 
        console.table(rows); 
        userQuestions();
})
};

// function for adding a department
addDepartment = () => {
    inquirer.prompt([
        {
          type: 'input', 
          name: 'addADept',
          message: "Which department do you want to add?",
          validate: addADept => {
            if (addADept) {
                return true;
            } else {
                console.log('Enter a department');
                return false;
            }
          }
        }
      ])
        .then(answer => {
          const sql = `INSERT INTO department (name)
                      VALUES (?)`;
          connection.query(sql, answer.addADept, (err, result) => {
            if (err) throw err;
            console.log('Department ' + answer.addADept + " added to departments!"); 
            showDepartments();
        });
      });
}



// function to add a role 
addRole = () => {
  inquirer.prompt([
    {
      type: 'input', 
      name: 'role',
      message: "Which role do you want to add?",
      validate: addARole => {
        if (addARole) {
            return true;
        } else {
            console.log('Enter a role');
            return false;
        }
      }
    },
    {
      type: 'input', 
      name: 'salary',
      message: "Enter the salary for this role?",
      validate: addASalary => {
        if (isNAN(addASalary)) {
            return true;
        } else {
            console.log('Enter a salary');
            return false;
        }
      }
    }
  ])
    .then(answer => {
      const params = [answer.role, answer.salary];

      // grab dept from department table
      const roleSql = `SELECT name, id FROM department`; 

      connection.promise().query(roleSql, (err, data) => {
        if (err) throw err; 
    
        const dept = data.map(({ name, id }) => ({ name: name, value: id }));

        inquirer.prompt([
        {
          type: 'list', 
          name: 'dept',
          message: "Which department is this role in?",
          options: dept
        }
        ])
          .then(deptChoice => {
            const dept = deptChoice.dept;
            params.push(dept);

            const sql = `INSERT INTO role (title, salary, department_id)
                        VALUES (?, ?, ?)`;

            connection.query(sql, params, (err, result) => {
              if (err) throw err;
              console.log('Role' + answer.role + " added to roles!"); 
              showRoles();
       });
     });
   });
 });
};

// function to add an employee 
addEmployee = () => {
  inquirer.prompt([
    {
      type: 'input',
      name: 'fistName',
      message: "Enter employee's first name?",
      validate: addFirstN => {
        if (addFirstN) {
            return true;
        } else {
            console.log('Enter a first name');
            return false;
        }
      }
    },
    {
      type: 'input',
      name: 'lastName',
      message: "Enter employee's last name?",
      validate: addLastN => {
        if (addLastN) {
            return true;
        } else {
            console.log('Enter a last name');
            return false;
        }
      }
    }
  ])
    .then(answer => {
    const params = [answer.fistName, answer.lastName]

    // grab roles from roles table
    const roleSql = `SELECT role.id, role.title FROM role`;
  
    connection.promise().query(roleSql, (err, data) => {
      if (err) throw err; 
      
      const roles = data.map(({ id, title }) => ({ name: title, value: id }));

      inquirer.prompt([
            {
              type: 'list',
              name: 'role',
              message: "What is the employee's role?",
              options: roles
            }
          ])
            .then(roleChoice => {
              const role = roleChoice.role;
              params.push(role);

              const managerSql = `SELECT * FROM employee`;

              connection.promise().query(managerSql, (err, data) => {
                if (err) throw err;

                const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));

                // console.log(managers);

                inquirer.prompt([
                  {
                    type: 'list',
                    name: 'manager',
                    message: "Select this employee's manager?",
                    options: managers
                  }
                ])
                  .then(managerChoice => {
                    const manager = managerChoice.manager;
                    params.push(manager);

                    const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                    VALUES (?, ?, ?, ?)`;

                    connection.query(sql, params, (err, result) => {
                    if (err) throw err;
                    console.log("Employee added!")

                    showEmployees();
              });
            });
          });
        });
     });
  });
};

// function to updating an employee 
updateEmployee = () => {
  // get employees from employee table 
  const employeeSql = `SELECT * FROM employee`;

  connection.promise().query(employeeSql, (err, data) => {
    if (err) throw err; 

  const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));

    inquirer.prompt([
      {
        type: 'list',
        name: 'name',
        message: "Select an employee to update?",
        options: employees
      }
    ])
      .then(empChoice => {
        const employee = empChoice.name;
        const params = []; 
        params.push(employee);

        const roleSql = `SELECT * FROM role`;

        connection.promise().query(roleSql, (err, data) => {
          if (err) throw err; 

          const roles = data.map(({ id, title }) => ({ name: title, value: id }));
          
            inquirer.prompt([
              {
                type: 'list',
                name: 'role',
                message: "Enter employee's new role?",
                options: roles
              }
            ])
                .then(roleChoice => {
                const role = roleChoice.role;
                params.push(role); 
                
                let employee = params[0]
                params[0] = role
                params[1] = employee 
                

                // console.log(params)

                const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;

                connection.query(sql, params, (err, result) => {
                  if (err) throw err;
                console.log("This employee has been updated successfully!");
              
                showEmployees();
          });
        });
      });
    });
  });
};
