import type { TeachingCourse, TeachingSession } from './firestoreTypes';

export function getMockSessionsForCourse(moduleCode: string): TeachingSession[] {
  if (moduleCode === 'CS401') {
    // 26 Lectures for Software Engineering
    const lectures: TeachingSession[] = [
      { id: 'l1', order: 1, type: 'lecture', topic: 'Introduction to Software Engineering', date: '2026-02-05', duration: 2, status: 'completed', description: 'Overview of the software development lifecycle (SDLC).' },
      { id: 'l2', order: 2, type: 'lecture', topic: 'Agile vs Waterfall', date: '2026-02-08', duration: 2, status: 'completed', description: 'Comparing traditional and agile methodologies.' },
      { id: 'l3', order: 3, type: 'lecture', topic: 'Requirements Elicitation', date: '2026-02-12', duration: 2, status: 'completed', description: 'Techniques for gathering user requirements.' },
      { id: 'l4', order: 4, type: 'lecture', topic: 'Use Case Modeling', date: '2026-02-15', duration: 2, status: 'completed', description: 'Creating use case diagrams and specifications.' },
      { id: 'l5', order: 5, type: 'lecture', topic: 'System Architecture', date: '2026-02-19', duration: 2, status: 'completed', description: 'Client-server, microservices, and monolithic architectures.' },
      { id: 'l6', order: 6, type: 'lecture', topic: 'Design Patterns: Creational', date: '2026-02-22', duration: 2, status: 'completed', description: 'Singleton, Factory, and Builder patterns.' },
      { id: 'l7', order: 7, type: 'lecture', topic: 'Design Patterns: Structural', date: '2026-02-26', duration: 2, status: 'completed', description: 'Adapter, Decorator, and Facade patterns.' },
      { id: 'l8', order: 8, type: 'lecture', topic: 'Design Patterns: Behavioral', date: '2026-03-01', duration: 2, status: 'completed', description: 'Observer, Strategy, and Command patterns.' },
      { id: 'l9', order: 9, type: 'lecture', topic: 'UI/UX Principles', date: '2026-03-05', duration: 2, status: 'completed', description: 'Usability heuristics and user-centered design.' },
      { id: 'l10', order: 10, type: 'lecture', topic: 'Version Control (Git)', date: '2026-03-08', duration: 2, status: 'completed', description: 'Branching strategies and merge conflicts.' },
      { id: 'l11', order: 11, type: 'lecture', topic: 'Unit Testing & TDD', date: '2026-03-12', duration: 2, status: 'completed', description: 'Writing effective tests and Test-Driven Development.' },
      { id: 'l12', order: 12, type: 'lecture', topic: 'Integration & E2E Testing', date: '2026-03-15', duration: 2, status: 'completed', description: 'Testing the system as a whole.' },
      { id: 'l13', order: 13, type: 'lecture', topic: 'Midterm Review', date: '2026-03-19', duration: 2, status: 'completed', description: 'Recap of the first half of the semester.' },
      { id: 'l14', order: 14, type: 'lecture', topic: 'CI/CD Pipelines', date: '2026-03-26', duration: 2, status: 'completed', description: 'Automating builds and deployments.' },
      { id: 'l15', order: 15, type: 'lecture', topic: 'Code Quality & Refactoring', date: '2026-03-29', duration: 2, status: 'completed', description: 'Identifying code smells and improving design.' },
      { id: 'l16', order: 16, type: 'lecture', topic: 'Database Integration', date: '2026-04-02', duration: 2, status: 'completed', description: 'Connecting applications to databases via ORMs.' },
      { id: 'l17', order: 17, type: 'lecture', topic: 'API Design (REST & GraphQL)', date: '2026-04-05', duration: 2, status: 'completed', description: 'Best practices for designing web APIs.' },
      { id: 'l18', order: 18, type: 'lecture', topic: 'Security Fundamentals', date: '2026-04-09', duration: 2, status: 'completed', description: 'Authentication, Authorization, and OWASP Top 10.' },
      { id: 'l19', order: 19, type: 'lecture', topic: 'Performance Optimization', date: '2026-04-12', duration: 2, status: 'completed', description: 'Caching, indexing, and lazy loading.' },
      { id: 'l20', order: 20, type: 'lecture', topic: 'Cloud Deployment (AWS/Azure)', date: '2026-04-16', duration: 2, status: 'completed', description: 'Deploying applications to the cloud.' },
      { id: 'l21', order: 21, type: 'lecture', topic: 'Containers (Docker)', date: '2026-04-19', duration: 2, status: 'upcoming', description: 'Containerization and environment consistency.' },
      { id: 'l22', order: 22, type: 'lecture', topic: 'Orchestration (Kubernetes)', date: '2026-04-23', duration: 2, status: 'upcoming', description: 'Managing containerized workloads at scale.' },
      { id: 'l23', order: 23, type: 'lecture', topic: 'Software Maintenance', date: '2026-04-26', duration: 2, status: 'upcoming', description: 'Bug tracking and long-term support.' },
      { id: 'l24', order: 24, type: 'lecture', topic: 'Ethics in Software Engineering', date: '2026-04-30', duration: 2, status: 'upcoming', description: 'Professional responsibility and algorithmic bias.' },
      { id: 'l25', order: 25, type: 'lecture', topic: 'Emerging Trends (AI in SE)', date: '2026-05-03', duration: 2, status: 'upcoming', description: 'How AI tools like Copilot are changing development.' },
      { id: 'l26', order: 26, type: 'lecture', topic: 'Final Review & Wrap-up', date: '2026-05-07', duration: 2, status: 'upcoming', description: 'Preparing for the final exam.' },
    ];
    // 8 Tutorials
    const tutorials: TeachingSession[] = Array.from({ length: 8 }).map((_, i) => ({
      id: `t${i+1}`, order: i+1, type: 'tutorial', topic: `Tutorial ${i+1}: Practical Application`, date: `2026-02-${10 + (i * 7)}`, duration: 1, status: i < 5 ? 'completed' : 'upcoming'
    }));
    // 6 Practicals
    const practicals: TeachingSession[] = Array.from({ length: 6 }).map((_, i) => ({
      id: `p${i+1}`, order: i+1, type: 'practical', topic: `Lab Session ${i+1}`, date: `2026-02-${12 + (i * 14)}`, duration: 3, status: i < 4 ? 'completed' : 'upcoming', description: 'Hands-on coding session in the lab.'
    }));
    return [...lectures, ...tutorials, ...practicals];
  }

  if (moduleCode === 'CS201') {
    // We can generate 32 lectures dynamically to save space, but giving a few real names at the start
    const lectures: TeachingSession[] = Array.from({ length: 32 }).map((_, i) => {
      const names = ['Introduction to Algorithms', 'Big O Notation', 'Sorting: Bubble & Insertion', 'Sorting: Merge & Quick', 'Searching Algorithms', 'Linked Lists', 'Stacks and Queues', 'Trees and Binary Search Trees', 'Heaps and Priority Queues', 'Hash Tables'];
      return {
        id: `l${i+1}`, order: i+1, type: 'lecture', topic: names[i] || `Advanced Topic ${i-9}`, date: `2026-08-${(i%30)+1}`, duration: 1, status: i < 15 ? 'completed' : 'upcoming'
      };
    });
    const tutorials: TeachingSession[] = Array.from({ length: 10 }).map((_, i) => ({ id: `t${i+1}`, order: i+1, type: 'tutorial', topic: `Algorithm Practice ${i+1}`, date: '2026-08-10', duration: 1, status: 'completed' }));
    const practicals: TeachingSession[] = Array.from({ length: 6 }).map((_, i) => ({ id: `p${i+1}`, order: i+1, type: 'practical', topic: `Coding Lab ${i+1}`, date: '2026-08-12', duration: 2, status: 'completed' }));
    return [...lectures, ...tutorials, ...practicals];
  }

  if (moduleCode === 'CS305') {
    const lectures: TeachingSession[] = Array.from({ length: 28 }).map((_, i) => {
      const names = ['Database Concepts', 'Relational Model', 'SQL Basics', 'Advanced SQL', 'ER Modeling', 'Normalization (1NF-3NF)', 'Transaction Management', 'Concurrency Control'];
      return {
        id: `l${i+1}`, order: i+1, type: 'lecture', topic: names[i] || `Database Topic ${i-7}`, date: `2026-08-${(i%30)+1}`, duration: 1, status: i < 12 ? 'completed' : 'upcoming'
      };
    });
    const tutorials: TeachingSession[] = Array.from({ length: 8 }).map((_, i) => ({ id: `t${i+1}`, order: i+1, type: 'tutorial', topic: `Database Design Tutorial ${i+1}`, date: '2026-08-10', duration: 1, status: 'completed' }));
    const practicals: TeachingSession[] = Array.from({ length: 6 }).map((_, i) => ({ id: `p${i+1}`, order: i+1, type: 'practical', topic: `SQL Lab ${i+1}`, date: '2026-08-12', duration: 2, status: 'completed' }));
    return [...lectures, ...tutorials, ...practicals];
  }

  return [
    { id: 'l1', order: 1, type: 'lecture', topic: 'Course Introduction', date: '2026-08-01', duration: 2, status: 'completed' },
    { id: 't1', order: 1, type: 'tutorial', topic: 'Practice Questions', date: '2026-08-05', duration: 1, status: 'upcoming' },
  ];
}

export function getMockAssessmentsForCourse(moduleCode: string): TeachingCourse['assessments'] {
  if (moduleCode === 'CS401') {
    return [
      { type: 'assignment', name: 'Group Project', description: 'Design and build a full-stack application following Agile methodology. Graded on teamwork, architecture, and code quality.', weight: 30, score: '26/30', dueDate: '2026-05-20', status: 'graded' },
      { type: 'midterm', name: 'Midterm', description: 'Covers SDLC, Agile, Requirements, and Design Patterns.', weight: 20, score: '18/20', dueDate: '2026-04-10', status: 'graded' },
      { type: 'final_exam', name: 'Final Exam', description: 'Comprehensive exam covering all topics from the semester.', weight: 40, score: '34/40', dueDate: '2026-06-05', status: 'graded' },
      { type: 'osce_ospe', name: 'Practical Assessment', description: 'In-lab assessment where students must deploy a dockerized app.', weight: 10, score: '9/10', dueDate: '2026-05-25', status: 'graded' },
    ];
  }
  
  if (moduleCode === 'CS201') {
    return [
      { type: 'assignment', name: 'Assignment 1: Sorting', description: 'Implement Merge, Quick, and Heap sort and compare their execution times.', weight: 10, score: '9.5/10', dueDate: '2026-09-15', status: 'graded' },
      { type: 'quiz', name: 'Quiz 1: Complexity', description: 'Multiple choice quiz on Big O, Omega, and Theta notation.', weight: 5, score: '5/5', dueDate: '2026-09-22', status: 'graded' },
      { type: 'midterm', name: 'Midterm Exam', description: 'Covers all topics up to Trees.', weight: 25, score: '-', dueDate: '2026-10-10', status: 'upcoming' },
      { type: 'final_exam', name: 'Final Examination', description: 'Full syllabus.', weight: 40, score: '-', dueDate: '2026-11-28', status: 'upcoming' },
      { type: 'assignment', name: 'Assignment 2: Graphs', description: 'Implement Dijkstra and A* pathfinding.', weight: 20, score: '-', dueDate: '2026-10-30', status: 'upcoming' },
    ];
  }

  if (moduleCode === 'CS305') {
    return [
      { type: 'assignment', name: 'ER Modelling Project', description: 'Design a normalized database schema for a university system.', weight: 15, score: '14/15', dueDate: '2026-09-20', status: 'graded' },
      { type: 'quiz', name: 'SQL Quiz', description: 'Complex JOINs and aggregation queries.', weight: 10, score: '8/10', dueDate: '2026-10-05', status: 'graded' },
      { type: 'midterm', name: 'Midterm', description: 'Covers Relational Algebra, SQL, and ER modeling.', weight: 25, score: '-', dueDate: '2026-10-15', status: 'upcoming' },
      { type: 'viva', name: 'Project Viva', description: 'Oral defense of your final database project.', weight: 10, score: '-', dueDate: '2026-11-15', status: 'upcoming' },
      { type: 'final_exam', name: 'Final Exam', description: 'Comprehensive.', weight: 40, score: '-', dueDate: '2026-12-01', status: 'upcoming' },
    ];
  }

  return [];
}
