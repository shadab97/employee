interface Employee {
  uniqueId: number;
  name: string;
  subordinates: Employee[];
}

interface IEmployeeOrgApp {
  ceo: Employee;
  move(employeeID: number, supervisorID: number): void;
  undo(): void;
  redo(): void;
}

class EmployeeOrgApp implements IEmployeeOrgApp {
  private readonly moveCommands: { employeeID: number; supervisorID: number|undefined }[] = [];
  private readonly undoStack: { employeeID: number; originalSupervisorID: number|undefined }[] = [];
  private readonly redoStack: { employeeID: number; supervisorID: number|undefined }[] = [];

  constructor(public ceo: Employee) {}

  move(employeeID: number, supervisorID: number): void {
    const employee = this.findEmployeeById(this.ceo, employeeID);
    if (!employee) return; // Employee not found

    const originalSupervisorID = employee.subordinates.length > 0 ? employee.subordinates[0].uniqueId :undefined;
    this.moveCommands.push({ employeeID, supervisorID });
    this.undoStack.push({ employeeID, originalSupervisorID });

    this.updateSupervisor(employeeID, supervisorID);
  }

   undo(): void {
    const lastMove = this.moveCommands.pop();
    if (!lastMove) return;

    const { employeeID, supervisorID } = lastMove;
    this.redoStack.push({ employeeID, supervisorID: this.findSupervisorId(employeeID) });

    this.updateSupervisor(employeeID, lastMove.supervisorID);
  }

  redo(): void {
    const lastUndo = this.undoStack.pop();
    if (!lastUndo) return;

    const { employeeID, originalSupervisorID } = lastUndo;
    this.moveCommands.push({ employeeID, supervisorID: this.findSupervisorId(employeeID) });

    // Move the employee back to the last supervisor
    this.updateSupervisor(employeeID, originalSupervisorID);
  }



  private findEmployeeById(employee: Employee, id: number): Employee | undefined {
    if (employee.uniqueId === id) {
      return employee;
    }

    for (const subordinate of employee.subordinates) {
      const foundEmployee = this.findEmployeeById(subordinate, id);
      if (foundEmployee) {
        return foundEmployee;
      }
    }

    return undefined;
  }

  private findSupervisorId(employeeID: number): number | undefined {
    const command = this.moveCommands.find((cmd) => cmd.employeeID === employeeID);
    return command ? command.supervisorID : undefined;
  }

private updateSupervisor(employeeID: number, supervisorID: number | undefined): void {
  const employee = this.findEmployeeById(this.ceo, employeeID);
  if (!employee) return;

  const supervisor = supervisorID !== undefined ? this.findEmployeeById(this.ceo, supervisorID) : undefined;

  if (supervisor) {
    supervisor.subordinates.push(employee);
  } else {
    this.ceo.subordinates.push(employee);
  }

  const prevSupervisorID = employee.subordinates.length > 0 ? employee.subordinates[0].uniqueId : undefined;

  if (prevSupervisorID !== undefined) {
    const prevSupervisor = this.findEmployeeById(this.ceo, prevSupervisorID);
    if (prevSupervisor) {
      const index = prevSupervisor.subordinates.findIndex((sub) => sub.uniqueId === employeeID);
      if (index !== -1) {
        prevSupervisor.subordinates.splice(index, 1);
      }
    }
  } else {
    // If the employee didn't have a previous supervisor, remove them from the CEO's subordinates
    const index = this.ceo.subordinates.findIndex((sub) => sub.uniqueId === employeeID);
    if (index !== -1) {
      this.ceo.subordinates.splice(index, 1);
    }
  }

  // Also remove the employee from other supervisors
  const otherSupervisors = this.findOtherSupervisors(this.ceo, employeeID, supervisorID);
  for (const supervisor of otherSupervisors) {
    const index = supervisor.subordinates.findIndex((sub) => sub.uniqueId === employeeID);
    if (index !== -1) {
      supervisor.subordinates.splice(index, 1);
    }
  }
}

private findOtherSupervisors(root: Employee, employeeID: number, currentSupervisorID: number | undefined): Employee[] {
  const supervisors: Employee[] = [];
  this.findOtherSupervisorsRecursive(root, employeeID, currentSupervisorID, supervisors);
  return supervisors;
}

private findOtherSupervisorsRecursive(
  current: Employee,
  employeeID: number,
  currentSupervisorID: number | undefined,
  supervisors: Employee[]
): void {
  if (current.uniqueId !== employeeID && current.uniqueId !== currentSupervisorID) {
    supervisors.push(current);
  }

  for (const subordinate of current.subordinates) {
    this.findOtherSupervisorsRecursive(subordinate, employeeID, currentSupervisorID, supervisors);
  }
}



}
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

const app = new EmployeeOrgApp(ceo);

// // Move an employee
app.move(5 /* employeeID */, 3 /* supervisorID */);
console.log("move",app)

// // Undo the last move
app.undo();
console.log("undo",app)

// // Redo the undone move
// app.redo();
