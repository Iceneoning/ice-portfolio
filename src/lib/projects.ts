import { getCollection, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;
export const projectHref = (project: Project) => `/projects/${project.id}/`;
export const projectNumber = (project: Project) => String(project.data.order).padStart(2, '0');

export async function getPublishedProjects() {
  return (await getCollection('projects', ({ data }) => !data.draft))
    .sort((a, b) => a.data.order - b.data.order || a.id.localeCompare(b.id));
}
