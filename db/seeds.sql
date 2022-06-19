INSERT INTO department (name)
VALUES 
('IT'),
('Finance'),
('Marketing');

INSERT INTO role (title, salary, department_id)
VALUES
('Developer', 40000, 1),
('Engineer', 50000, 1),
('Accountant', 20000, 2);


INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 
('John', 'Doe', 2, null),
('Kevin', 'James', 1, 1),
('Jessica', 'Doe', 4, null),
