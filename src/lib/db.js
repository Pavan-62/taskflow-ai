import { collection, query, where, getDocs, doc, getDoc, orderBy, limit, addDoc, updateDoc, deleteDoc, arrayUnion } from "firebase/firestore";
import { db } from "./firebase";

// Projects
export async function getProjects(userId, role) {
  const projectsRef = collection(db, "projects");
  let q;
  
  if (role === "Admin") {
    q = query(projectsRef, orderBy("createdAt", "desc"));
  } else {
    q = query(projectsRef, where("members", "array-contains", userId));
  }
  
  const snapshot = await getDocs(q);
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  if (role !== "Admin") {
    data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  return data;
}

export async function createProject(data) {
  const docRef = await addDoc(collection(db, "projects"), {
    ...data,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

// Tasks
export async function getTasks(userId, role) {
  const tasksRef = collection(db, "tasks");
  let q;
  
  if (role === "Admin") {
    q = query(tasksRef, orderBy("createdAt", "desc"));
  } else {
    q = query(tasksRef, where("assigneeId", "==", userId));
  }
  
  const snapshot = await getDocs(q);
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  if (role !== "Admin") {
    data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  return data;
}

export async function createTask(data) {
  const docRef = await addDoc(collection(db, "tasks"), {
    ...data,
    status: "To Do",
    createdAt: new Date().toISOString(),
  });
  
  if (data.projectId && data.assigneeId) {
    const projectRef = doc(db, "projects", data.projectId);
    await updateDoc(projectRef, {
      members: arrayUnion(data.assigneeId)
    });
  }
  
  return docRef.id;
}

export async function updateTaskStatus(taskId, status) {
  const taskRef = doc(db, "tasks", taskId);
  await updateDoc(taskRef, { status });
}

// Users
export async function getUsers() {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function seedSampleData(userId) {
  try {
    // 1. Create a sample project
    const projectId = await createProject({
      name: "Sample Project Alpha",
      description: "A demonstration project created automatically for you.",
      colorTag: "#4361ee",
      ownerId: userId,
      members: [userId]
    });

    // 2. Create sample tasks
    const now = new Date();
    
    // Overdue task
    const overdueDate = new Date();
    overdueDate.setDate(now.getDate() - 2);
    await createTask({
      title: "Review Design Mockups",
      description: "The UI team has uploaded new mockups. Please review them.",
      projectId,
      assigneeId: userId,
      priority: "High",
      dueDate: overdueDate.toISOString().split("T")[0],
    });

    // Upcoming task
    const upcomingDate = new Date();
    upcomingDate.setDate(now.getDate() + 3);
    await createTask({
      title: "Draft Q3 Marketing Plan",
      description: "Prepare the initial draft for the Q3 marketing strategy.",
      projectId,
      assigneeId: userId,
      priority: "Medium",
      dueDate: upcomingDate.toISOString().split("T")[0],
    });

    // In Progress task
    const inProgressRef = await addDoc(collection(db, "tasks"), {
      title: "Update Database Schema",
      description: "Add new fields for user preferences.",
      projectId,
      assigneeId: userId,
      priority: "Low",
      status: "In Progress",
      dueDate: upcomingDate.toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Error seeding sample data", error);
  }
}

export async function deleteProject(projectId) {
  await deleteDoc(doc(db, "projects", projectId));
}

export async function deleteTask(taskId) {
  await deleteDoc(doc(db, "tasks", taskId));
}
