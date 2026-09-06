import { db } from '@/config/firebase';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { UserProfile, ResearchProject, Publication } from './firestoreTypes';

const MOCK_FACULTY: Partial<UserProfile>[] = [
  {
    uid: 'dr-alan-turing',
    name: 'Dr. Alan Turing',
    email: 'aturing@university.edu',
    role: 'professor',
    department: 'Computer Science',
    institution: 'CampusMind AI University',
    phone: '+1 555-0101',
    officeLocation: 'Computing Block, Room 402',
    bio: 'Pioneering researcher in theoretical computer science and artificial intelligence.',
    expertise: ['Artificial Intelligence', 'Cryptography', 'Theoretical CS'],
    qualifications: [
      { degree: 'Ph.D. in Mathematics', institution: 'Princeton University', year: 1938 },
      { degree: 'B.A. in Mathematics', institution: 'University of Cambridge', year: 1934 }
    ],
    teachingModules: [
      { courseCode: 'CS401', courseName: 'Advanced Machine Learning', semester: 'Fall 2026' },
      { courseCode: 'CS502', courseName: 'Cryptography & Security', semester: 'Spring 2027' }
    ],
    evidenceFiles: [
      { name: 'Curriculum_Vitae_Turing.pdf', url: 'https://example.com/cv_turing' },
      { name: 'Teaching_Awards_2025.pdf', url: 'https://example.com/awards' }
    ],
  },
  {
    uid: 'dr-ada-lovelace',
    name: 'Dr. Ada Lovelace',
    email: 'alovelace@university.edu',
    role: 'senior_lecturer',
    department: 'Computer Science',
    institution: 'CampusMind AI University',
    phone: '+1 555-0102',
    officeLocation: 'Computing Block, Room 405',
    bio: 'Visionary mathematician known for work on the Analytical Engine.',
    expertise: ['Algorithm Design', 'Computational Mathematics', 'Software Engineering'],
    qualifications: [
      { degree: 'Ph.D. in Computer Science', institution: 'University of London', year: 2010 },
      { degree: 'M.Sc. in Mathematics', institution: 'Oxford University', year: 2006 }
    ],
    teachingModules: [
      { courseCode: 'CS101', courseName: 'Introduction to Algorithms', semester: 'Fall 2026' },
      { courseCode: 'CS305', courseName: 'Software Engineering Principles', semester: 'Spring 2027' }
    ],
    evidenceFiles: [
      { name: 'Lovelace_CV.pdf', url: 'https://example.com/cv_lovelace' },
      { name: 'Syllabus_CS101.pdf', url: 'https://example.com/syllabus_cs101' }
    ],
  },
  {
    uid: 'prof-grace-hopper',
    name: 'Prof. Grace Hopper',
    email: 'ghopper@university.edu',
    role: 'senior_professor',
    department: 'Computer Science',
    institution: 'CampusMind AI University',
    phone: '+1 555-0103',
    officeLocation: 'Computing Block, Room 501',
    bio: 'A trailblazer in computer programming languages and compiler design.',
    expertise: ['Compiler Design', 'Programming Languages', 'Systems Architecture'],
    qualifications: [
      { degree: 'Ph.D. in Mathematics', institution: 'Yale University', year: 1934 },
      { degree: 'M.A. in Mathematics', institution: 'Yale University', year: 1930 }
    ],
    teachingModules: [
      { courseCode: 'CS412', courseName: 'Compiler Construction', semester: 'Fall 2026' },
      { courseCode: 'CS600', courseName: 'Advanced Systems Architecture', semester: 'Spring 2027' }
    ],
    evidenceFiles: [
      { name: 'Hopper_Full_CV.pdf', url: 'https://example.com/cv_hopper' },
      { name: 'Naval_Research_Grant.pdf', url: 'https://example.com/grant_hopper' }
    ],
  }
];

const MOCK_PROJECTS: Partial<ResearchProject>[] = [
  {
    id: 'proj-turing-1',
    userId: 'dr-alan-turing',
    title: 'Next-Generation Neural Cryptography',
    status: 'active',
    publications: 3,
    conferences: 2,
    progress: 75,
    ethics: 'approved'
  },
  {
    id: 'proj-hopper-1',
    userId: 'prof-grace-hopper',
    title: 'Autonomous Compiler Optimizations',
    status: 'proposed',
    publications: 0,
    conferences: 1,
    progress: 15,
    ethics: 'submitted'
  }
];

const MOCK_PUBLICATIONS: Partial<Publication>[] = [
  {
    id: 'pub-turing-1',
    userId: 'dr-alan-turing',
    title: 'On Computable Numbers, with an Application to the Entscheidungsproblem',
    journal: 'Proceedings of the London Mathematical Society',
    year: 1936,
    status: 'published',
    doi: '10.1112/plms/s2-42.1.230',
    abstract: 'This foundational paper introduces the concept of a theoretical computing machine, now widely known as the Turing machine. It demonstrates that there exists a universal computing machine capable of simulating any other computing machine, thereby formalizing the concepts of algorithm and computation.',
    isbn: '978-0198250785',
    url: 'researchgate.net/publication/220421272_On_Computable_Numbers'
  },
  {
    id: 'pub-turing-2',
    userId: 'dr-alan-turing',
    title: 'Computing Machinery and Intelligence',
    journal: 'Mind',
    year: 1950,
    status: 'published',
    doi: '10.1093/mind/LIX.236.433',
    abstract: 'In this seminal work, the question "Can machines think?" is proposed, leading to the introduction of the Turing Test. The paper discusses various objections to machine intelligence and establishes early philosophical foundations for Artificial Intelligence.',
    url: 'orcid.org/0000-0002-1825-0097'
  },
  {
    id: 'pub-lovelace-1',
    userId: 'dr-ada-lovelace',
    title: 'Notes on the Analytical Engine',
    journal: 'Taylor\'s Scientific Memoirs',
    year: 1843,
    status: 'published',
    doi: '10.1098/rstl.1843.001',
    abstract: 'A comprehensive translation and annotation of Luigi Menabrea\'s article on Charles Babbage\'s Analytical Engine. Notably, Note G contains what is recognized as the first published computer algorithm, designed to compute Bernoulli numbers.',
    isbn: '978-0521634691',
    url: 'researchgate.net/publication/220421111_Notes_on_Analytical_Engine'
  },
  {
    id: 'pub-hopper-1',
    userId: 'prof-grace-hopper',
    title: 'The Education of a Computer',
    journal: 'Proceedings of the ACM National Meeting',
    year: 1952,
    status: 'published',
    doi: '10.1145/800259.80898',
    abstract: 'This paper outlines early concepts of the compiler, detailing how a program could translate mathematical notation into machine code, dramatically reducing programming errors and time.',
    url: 'researchgate.net/publication/220421333_Education_of_Computer'
  }
];

export async function seedDirectoryDatabase() {
  try {
    console.log('[Seed] Starting directory seeding...');
    
    // Check if seeded
    const usersRef = collection(db, 'users');
    const userDocs = await getDocs(usersRef);
    const existingFaculty = userDocs.docs.filter(d => d.id === 'dr-alan-turing');
    
    if (existingFaculty.length > 0) {
      console.log('[Seed] Directory already seeded.');
      return;
    }

    const now = new Date().toISOString();

    for (const faculty of MOCK_FACULTY) {
      const fullProfile = {
        ...faculty,
        isSeeded: true,
        createdAt: now,
        updatedAt: now
      };
      await setDoc(doc(db, 'users', faculty.uid!), fullProfile);
    }
    
    for (const proj of MOCK_PROJECTS) {
      await setDoc(doc(db, 'research_projects', proj.id!), proj);
    }
    
    for (const pub of MOCK_PUBLICATIONS) {
      await setDoc(doc(db, 'publications', pub.id!), {
        ...pub,
        createdAt: now,
        updatedAt: now
      });
    }

    console.log('[Seed] Directory seeding completed successfully.');
  } catch (error) {
    console.error('[Seed] Directory seeding failed:', error);
  }
}
