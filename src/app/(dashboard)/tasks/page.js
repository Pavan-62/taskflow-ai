"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getTasks, createTask, updateTaskStatus, getProjects, getUsers, deleteTask } from "@/lib/db";
import { useToast } from "@/context/ToastContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader2, Plus, GripVertical, Calendar, Clock, AlertCircle, Trash2 } from "lucide-react";
import styles from "./Tasks.module.css";
import clsx from "clsx";

const taskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  projectId: z.string().min(1, "Project is required"),
  assigneeId: z.string().min(1, "Assignee is required"),
  priority: z.enum(["Low", "Medium", "High"]),
  dueDate: z.string().min(1, "Due date is required"),
});

const COLUMNS = ["To Do", "In Progress", "Completed"];

export default function TasksPage() {
  const { user, userData } = useAuth();
  const { addToast } = useToast();
  
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: { priority: "Medium" }
  });

  useEffect(() => {
    if (user && userData) {
      fetchData();
    }
  }, [user, userData]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fetchedTasks, fetchedProjects, fetchedUsers] = await Promise.all([
        getTasks(user.uid, userData.role),
        getProjects(user.uid, userData.role),
        getUsers()
      ]);
      setTasks(fetchedTasks);
      setProjects(fetchedProjects);
      setTeam(fetchedUsers);
    } catch (error) {
      console.error(error);
      addToast("Failed to load tasks data", "error");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      await createTask({ ...data });
      addToast("Task created successfully", "success");
      setIsModalOpen(false);
      reset();
      fetchData();
    } catch (error) {
      addToast("Failed to create task", "error");
    }
  };

  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    // Needed for Firefox
    e.dataTransfer.setData("text/plain", taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, status) => {
    e.preventDefault();
    if (!draggedTaskId) return;

    const task = tasks.find(t => t.id === draggedTaskId);
    if (task && task.status !== status) {
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === draggedTaskId ? { ...t, status } : t));
      
      try {
        await updateTaskStatus(draggedTaskId, status);
        addToast(`Moved to ${status}`, "success");
      } catch (error) {
        // Revert on failure
        addToast("Failed to move task", "error");
        fetchData();
      }
    }
    setDraggedTaskId(null);
  };

  const handleDeleteTask = async (taskId) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(taskId);
        addToast("Task deleted successfully", "success");
        fetchData();
      } catch (error) {
        addToast("Failed to delete task", "error");
      }
    }
  };

  const isOverdue = (dueDateStr, status) => {
    if (status === "Completed") return false;
    return new Date(dueDateStr) < new Date();
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className="animate-spin" size={32} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>My Tasks</h1>
          <p>Manage your workload and track progress.</p>
        </div>
        {userData?.role === "Admin" && (
          <Button onClick={() => setIsModalOpen(true)} className={styles.createBtn}>
            <Plus size={18} />
            New Task
          </Button>
        )}
      </header>

      <div className={styles.kanbanBoard}>
        {COLUMNS.map(column => (
          <div 
            key={column} 
            className={styles.kanbanColumn}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column)}
          >
            <div className={styles.columnHeader}>
              <div className={styles.columnTitle}>
                <span className={clsx(styles.statusDot, styles[column.replace(/\s+/g, '')])} />
                {column}
              </div>
              <span className={styles.taskCount}>
                {tasks.filter(t => t.status === column).length}
              </span>
            </div>

            <div className={styles.columnBody}>
              {tasks.filter(t => t.status === column).map(task => {
                const overdue = isOverdue(task.dueDate, task.status);
                const project = projects.find(p => p.id === task.projectId);
                const assignee = team.find(u => u.uid === task.assigneeId);

                return (
                  <div 
                    key={task.id} 
                    className={styles.taskCard}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                  >
                    <div className={styles.taskCardHeader}>
                      <span className={clsx(styles.badge, styles[task.priority])}>
                        {task.priority}
                      </span>
                      {overdue && (
                        <div className={styles.overdueBadge} title="Overdue">
                          <AlertCircle size={14} />
                          Overdue
                        </div>
                      )}
                      {userData?.role === "Admin" && (
                        <button 
                          className={styles.deleteBtn}
                          onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                          title="Delete Task"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    
                    <h4 className={styles.taskTitle}>{task.title}</h4>
                    {task.description && <p className={styles.taskDesc}>{task.description}</p>}
                    
                    {project && (
                      <div className={styles.projectTag} style={{ borderColor: project.colorTag }}>
                        <span className={styles.projectTagColor} style={{ backgroundColor: project.colorTag }} />
                        {project.name}
                      </div>
                    )}
                    
                    <div className={styles.taskCardFooter}>
                      <div className={clsx(styles.dueDate, overdue && styles.dueDateOverdue)}>
                        <Calendar size={14} />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                      <div className={styles.assigneeInfo} title={assignee?.name}>
                        <div className={styles.assigneeAvatar}>
                          {assignee?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className={styles.assigneeName}>{assignee?.name || 'Unassigned'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Create New Task</h2>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
              <Input
                label="Task Title"
                placeholder="What needs to be done?"
                {...register("title")}
                error={errors.title?.message}
              />
              
              <div className={styles.inputGroup}>
                <label className={styles.label}>Description</label>
                <textarea 
                  className={styles.textarea}
                  placeholder="Additional details..."
                  {...register("description")}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Project</label>
                  <select className={styles.select} {...register("projectId")}>
                    <option value="">Select Project</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {errors.projectId && <span className={styles.errorText}>{errors.projectId.message}</span>}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Assignee</label>
                  <select className={styles.select} {...register("assigneeId")}>
                    <option value="">Select Assignee</option>
                    {team.map(u => (
                      <option key={u.uid} value={u.uid}>{u.name}</option>
                    ))}
                  </select>
                  {errors.assigneeId && <span className={styles.errorText}>{errors.assigneeId.message}</span>}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Priority</label>
                  <select className={styles.select} {...register("priority")}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                  {errors.priority && <span className={styles.errorText}>{errors.priority.message}</span>}
                </div>

                <Input
                  label="Due Date"
                  type="date"
                  {...register("dueDate")}
                  error={errors.dueDate?.message}
                />
              </div>

              <div className={styles.modalActions}>
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  Create Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
