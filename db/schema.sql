CREATE DATABASE employee_managmentdb
USE employee_managmentdb
-- Table: department
CREATE TABLE department (
    d_id int,
  d_name varchar(30),
     PRIMARY KEY  (d_id)
);


-- Creating a table for Employee
CREATE TABLE employee (
    e_id int,
  f_name varchar(30),
  l_name varchar(30),
  r_id int,
  m_id int,
     PRIMARY KEY  (e_id)
);


-- Creating a table for the Role
CREATE TABLE roles (
    r_id int,
    t_name varchar(30),
    salary decimal, 
    d_id int, 
     PRIMARY KEY  (r_id)
);