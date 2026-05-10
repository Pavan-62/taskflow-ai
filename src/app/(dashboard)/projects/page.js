"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getProjects, createProject, deleteProject } from "@/lib/db";
import { useToast } from "@/context/ToastContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader2, Plus, FolderKanban, Trash2, Calendar } from "lucide-react";
import styles from "./Projects.module.css";
import clsx from "clsx";

const projectSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters"),
  description: z.string().optional(),
  colorTag: z.string().default("#4361ee"),
});

export default function ProjectsPage() {
  const { user, userData } = useAuth();
  const { addToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: { colorTag: "#4361ee" }
  });

  useEffect(() => {
    if (user && userData) {
      fetchProjects();
    }
  }, [user, userData]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjects(user.uid, userData.role);
      setProjects(data);
    } catch (error) {
      console.error(error);
      addToast("Failed to load projects", "error");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      await createProject({
        ...data,
        ownerId: user.uid,
        members: [user.uid], // Creator is a member
      });
      addToast("Project created successfully", "success");
      setIsModalOpen(false);
      reset();
      fetchProjects();
    } catch (error) {
      addToast("Failed to create project", "error");
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteProject(projectId);
        addToast("Project deleted successfully", "success");
        fetchProjects();
      } catch (error) {
        addToast("Failed to delete project", "error");
      }
    }
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
          <h1>Projects</h1>
          <p>Manage and track all your team's projects.</p>
        </div>
        {userData?.role === "Admin" && (
          <Button onClick={() => setIsModalOpen(true)} className={styles.createBtn}>
            <Plus size={18} />
            New Project
          </Button>
        )}
      </header>

      {projects.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}><FolderKanban size={48} /></div>
          <h3>No projects yet</h3>
          <p>Get started by creating your first project.</p>
          {userData?.role === "Admin" && (
            <Button onClick={() => setIsModalOpen(true)} className={styles.emptyCreateBtn}>
              Create Project
            </Button>
          )}
        </div>
      ) : (
        <div className={styles.projectsGrid}>
          {projects.map((project) => (
            <div key={project.id} className={styles.projectCard}>
              <div className={styles.cardHeader}>
                <div className={styles.projectIcon} style={{ backgroundColor: project.colorTag }}>
                  <FolderKanban size={24} color="white" />
                </div>
                {userData?.role === "Admin" && (
                  <button 
                    className={styles.deleteBtn} 
                    onClick={() => handleDeleteProject(project.id)}
                    title="Delete Project"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              <div className={styles.cardBody}>
                <h3>{project.name}</h3>
                <p>{project.description || "No description provided."}</p>
              </div>
              <div className={styles.cardFooter}>
                <div className={styles.meta}>
                  <Calendar size={14} />
                  <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
                <div className={styles.avatars}>
                  {/* Mock avatars for team members */}
                  <div className={styles.avatarMini}>U</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Create New Project</h2>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
              <Input
                label="Project Name"
                placeholder="e.g. Website Redesign"
                {...register("name")}
                error={errors.name?.message}
              />
              <div className={styles.inputGroup}>
                <label className={styles.label}>Description</label>
                <textarea 
                  className={styles.textarea}
                  placeholder="What is this project about?"
                  {...register("description")}
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Color Tag</label>
                <input 
                  type="color" 
                  className={styles.colorPicker}
                  {...register("colorTag")}
                />
              </div>
              <div className={styles.modalActions}>
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  Create Project
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
