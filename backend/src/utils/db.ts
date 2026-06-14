import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null;
let usePrisma = false;

// Simple in-memory storage for database fallback
const memoryDb = {
  users: [] as any[],
  sessions: [] as any[],
  steps: [] as any[],
  findings: [] as any[],
  sources: [] as any[],
  images: [] as any[],
  savedReports: [] as any[],
};

// Check if database URL is valid and connect
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("your-db-url-here")) {
  try {
    prisma = new PrismaClient();
    prisma.$connect()
      .then(() => {
        console.log('Successfully connected to PostgreSQL database via Prisma.');
        usePrisma = true;
      })
      .catch((err: any) => {
        console.warn('PostgreSQL connection failed. Falling back to In-Memory storage. Error:', err.message);
        usePrisma = false;
        prisma = null;
      });
  } catch (e: any) {
    console.warn('Failed to initialize Prisma Client. Falling back to In-Memory storage. Error:', e.message);
    usePrisma = false;
    prisma = null;
  }
} else {
  console.log('DATABASE_URL is not set or placeholder. Using In-Memory database storage.');
}

export const dbService = {
  get isPostgres() {
    return usePrisma;
  },

  user: {
    async findUnique(args: { where: { email?: string; id?: string } }) {
      if (usePrisma && prisma) {
        return prisma.user.findUnique(args);
      }
      return memoryDb.users.find(u => 
        (args.where.email && u.email === args.where.email) || 
        (args.where.id && u.id === args.where.id)
      ) || null;
    },
    async create(args: { data: { email: string; passwordHash: string; subscriptionStatus?: string } }) {
      if (usePrisma && prisma) {
        return prisma.user.create(args);
      }
      const newUser = {
        id: Math.random().toString(36).substring(2, 11),
        email: args.data.email,
        passwordHash: args.data.passwordHash,
        subscriptionStatus: args.data.subscriptionStatus || 'FREE',
        createdAt: new Date(),
      };
      memoryDb.users.push(newUser);
      return newUser;
    },
    async update(args: { where: { id: string }; data: { subscriptionStatus?: string } }) {
      if (usePrisma && prisma) {
        return prisma.user.update(args);
      }
      const user = memoryDb.users.find(u => u.id === args.where.id);
      if (user) {
        if (args.data.subscriptionStatus) user.subscriptionStatus = args.data.subscriptionStatus;
      }
      return user;
    }
  },

  session: {
    async create(args: { data: { userId: string; query: string; status?: string } }) {
      if (usePrisma && prisma) {
        return prisma.researchSession.create(args);
      }
      const newSession = {
        id: Math.random().toString(36).substring(2, 11),
        userId: args.data.userId,
        query: args.data.query,
        status: args.data.status || 'STARTED',
        confidenceScore: 0,
        report: '',
        summary: '',
        answer: '',
        supportingEvidence: [],
        contradictoryEvidence: [],
        createdAt: new Date(),
      };
      memoryDb.sessions.push(newSession);
      return newSession;
    },
    async update(args: { 
      where: { id: string }; 
      data: { 
        status?: string; 
        confidenceScore?: number; 
        report?: string; 
        summary?: string; 
        answer?: string; 
        supportingEvidence?: any; 
        contradictoryEvidence?: any;
      } 
    }) {
      if (usePrisma && prisma) {
        return prisma.researchSession.update(args);
      }
      const session = memoryDb.sessions.find(s => s.id === args.where.id);
      if (session) {
        if (args.data.status !== undefined) session.status = args.data.status;
        if (args.data.confidenceScore !== undefined) session.confidenceScore = args.data.confidenceScore;
        if (args.data.report !== undefined) session.report = args.data.report;
        if (args.data.summary !== undefined) session.summary = args.data.summary;
        if (args.data.answer !== undefined) session.answer = args.data.answer;
        if (args.data.supportingEvidence !== undefined) session.supportingEvidence = args.data.supportingEvidence;
        if (args.data.contradictoryEvidence !== undefined) session.contradictoryEvidence = args.data.contradictoryEvidence;
      }
      return session;
    },
    async findUnique(args: { where: { id: string }, include?: any }) {
      if (usePrisma && prisma) {
        return prisma.researchSession.findUnique(args);
      }
      const session = memoryDb.sessions.find(s => s.id === args.where.id);
      if (!session) return null;

      // Simulate include relations
      const steps = memoryDb.steps.filter(st => st.sessionId === session.id);
      const findings = memoryDb.findings.filter(f => f.sessionId === session.id);
      const sources = memoryDb.sources.filter(so => so.sessionId === session.id);
      const images = memoryDb.images.filter(im => im.sessionId === session.id);

      return {
        ...session,
        steps,
        findings,
        sources,
        images,
      };
    },
    async findMany(args: { where: { userId: string }; orderBy?: any }) {
      if (usePrisma && prisma) {
        return prisma.researchSession.findMany(args);
      }
      const sessions = memoryDb.sessions.filter(s => s.userId === args.where.userId);
      // Sort by date desc
      return sessions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  },

  step: {
    async create(args: { data: { sessionId: string; agentName: string; title: string; message?: string; status?: string } }) {
      if (usePrisma && prisma) {
        return prisma.researchStep.create(args);
      }
      const newStep = {
        id: Math.random().toString(36).substring(2, 11),
        sessionId: args.data.sessionId,
        agentName: args.data.agentName,
        title: args.data.title,
        message: args.data.message || '',
        status: args.data.status || 'PENDING',
        createdAt: new Date(),
      };
      memoryDb.steps.push(newStep);
      return newStep;
    },
    async update(args: { where: { id: string }; data: { status?: string; message?: string } }) {
      if (usePrisma && prisma) {
        return prisma.researchStep.update({
          where: args.where,
          data: args.data,
        });
      }
      const step = memoryDb.steps.find(st => st.id === args.where.id);
      if (step) {
        if (args.data.status !== undefined) step.status = args.data.status;
        if (args.data.message !== undefined) step.message = args.data.message;
      }
      return step;
    },
    async findMany(args: { where: { sessionId: string } }) {
      if (usePrisma && prisma) {
        return prisma.researchStep.findMany(args);
      }
      return memoryDb.steps.filter(st => st.sessionId === args.where.sessionId);
    }
  },

  finding: {
    async create(args: { data: { sessionId: string; url: string; title?: string; description?: string; markdown?: string } }) {
      if (usePrisma && prisma) {
        return prisma.finding.create(args);
      }
      const newFinding = {
        id: Math.random().toString(36).substring(2, 11),
        sessionId: args.data.sessionId,
        url: args.data.url,
        title: args.data.title || '',
        description: args.data.description || '',
        markdown: args.data.markdown || '',
        createdAt: new Date(),
      };
      memoryDb.findings.push(newFinding);
      return newFinding;
    }
  },

  source: {
    async create(args: { data: { sessionId: string; url: string; title?: string; description?: string; relevance?: string; screenshotUrl?: string; faviconUrl?: string } }) {
      if (usePrisma && prisma) {
        return prisma.source.create(args);
      }
      const newSource = {
        id: Math.random().toString(36).substring(2, 11),
        sessionId: args.data.sessionId,
        url: args.data.url,
        title: args.data.title || '',
        description: args.data.description || '',
        relevance: args.data.relevance || 'medium',
        screenshotUrl: args.data.screenshotUrl || '',
        faviconUrl: args.data.faviconUrl || '',
        createdAt: new Date(),
      };
      memoryDb.sources.push(newSource);
      return newSource;
    }
  },

  image: {
    async create(args: { data: { sessionId: string; url?: string; src: string; type?: string; alt?: string; width?: number; height?: number; category?: string } }) {
      if (usePrisma && prisma) {
        return prisma.image.create(args);
      }
      const newImage = {
        id: Math.random().toString(36).substring(2, 11),
        sessionId: args.data.sessionId,
        url: args.data.url || '',
        src: args.data.src,
        type: args.data.type || 'url',
        alt: args.data.alt || '',
        width: args.data.width || null,
        height: args.data.height || null,
        category: args.data.category || 'other',
        createdAt: new Date(),
      };
      memoryDb.images.push(newImage);
      return newImage;
    }
  },

  savedReport: {
    async create(args: { data: { userId: string; sessionId: string; title: string; summary: string; report: string } }) {
      if (usePrisma && prisma) {
        return prisma.savedReport.create(args);
      }
      const newSaved = {
        id: Math.random().toString(36).substring(2, 11),
        userId: args.data.userId,
        sessionId: args.data.sessionId,
        title: args.data.title,
        summary: args.data.summary,
        report: args.data.report,
        createdAt: new Date(),
      };
      memoryDb.savedReports.push(newSaved);
      return newSaved;
    },
    async delete(args: { where: { id: string } }) {
      if (usePrisma && prisma) {
        return prisma.savedReport.delete(args);
      }
      const index = memoryDb.savedReports.findIndex(r => r.id === args.where.id);
      if (index !== -1) {
        const deleted = memoryDb.savedReports[index];
        memoryDb.savedReports.splice(index, 1);
        return deleted;
      }
      return null;
    },
    async findMany(args: { where: { userId: string } }) {
      if (usePrisma && prisma) {
        return prisma.savedReport.findMany(args);
      }
      return memoryDb.savedReports.filter(r => r.userId === args.where.userId);
    }
  }
};
export default prisma;
