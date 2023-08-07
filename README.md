# employee

```javascript
const ceo: Employee = {
  uniqueId: 1,
  name: "Shadab Ali",
  subordinates: [
    // ... Add employees here as per your initial organization chart
    {
        name: "2",
        uniqueId: 2,
        subordinates: [
        {
            name: "5",
            uniqueId: 5,
            subordinates: [],
         },
        ]

    },
    {
        name: "3",
        uniqueId: 3,
        subordinates: []

    },
    {
        name: "4",
        uniqueId: 4,
        subordinates: []

    }
  ],
};
```

```javascript
const app = new EmployeeOrgApp(ceo);

// // Move an employee
app.move(5 /* employeeID */, 3 /* supervisorID */);
console.log("move",app)

// // Undo the last move
app.undo();
console.log("undo",app)

// // Redo the undone move
// app.redo();
```
