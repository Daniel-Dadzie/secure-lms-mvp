import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database with full catalogue and course modules...");
  
  const passwordHash = await bcrypt.hash("Password123!", 10);
  
  // 1. Core Users (Admin & Student)
  const admin = await prisma.user.upsert({
    where: { email: "admin@mechlms.test" },
    update: {},
    create: {
      email: "admin@mechlms.test",
      passwordHash,
      fullName: "Admin User",
      role: "ADMIN",
      isEmailVerified: true,
    },
  });
  
  const student = await prisma.user.upsert({
    where: { email: "student@mechlms.test" },
    update: {},
    create: {
      email: "student@mechlms.test",
      passwordHash,
      fullName: "Student User",
      role: "STUDENT",
      isEmailVerified: true,
    },
  });

  // 2. Expert Instructors
  const instructorData = [
    { 
      email: "james.walker@mechlms.test", 
      fullName: "Dr. James Walker", 
      specialization: "Mechanical Systems Expert", 
      credentials: "MIT-trained | Ex-Boeing", 
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop", 
      experienceYears: "15 yrs",
      shortBio: "Former lead mechanical engineer at Boeing with a PhD from MIT.",
      bio: "Dr. James Walker spent 15 years as a lead mechanical engineer at Boeing, specializing in aerospace structural integrity. He holds a Ph.D. from MIT and is passionate about bridging the gap between theoretical physics and practical engineering design.",
      expertise: ["Aerospace Structures", "Mechanical Design", "Systems Engineering"]
    },
    { 
      email: "sarah.chen@mechlms.test", 
      fullName: "Prof. Sarah Chen", 
      specialization: "CAD / CAM Specialist", 
      credentials: "Stanford ME | Ex-Lockheed", 
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop", 
      experienceYears: "12 yrs",
      shortBio: "Manufacturing engineer at Stanford University with deep expertise in CNC programming, precision machining, and CAM software.",
      bio: "Prof. Sarah Chen has 16 years of combined industry and academic experience in precision manufacturing. She has collaborated with Siemens, Fanuc, and Haas Automation on next-generation machine tool development, contributing to controller firmware optimisation and toolpath algorithms. At Stanford, she directs the Advanced Manufacturing Lab and teaches graduate courses in computational manufacturing. She has trained over 18,000 students globally in CNC programming, helping machinists, engineers, and product designers bridge the gap between design intent and workshop reality.",
      expertise: ["CNC Milling & Turning", "G-Code Programming", "CAM Software (Fusion 360)", "Precision Metrology", "Cutting Tool Selection"]
    },
    { 
      email: "emily.torres@mechlms.test", 
      fullName: "Emily Torres", 
      specialization: "CNC & Robotics Engineer", 
      credentials: "Georgia Tech | Fanuc Certified", 
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop", 
      experienceYears: "10 yrs",
      shortBio: "Certified robotics engineer specializing in automated assembly lines and robotic kinematics.",
      bio: "Emily Torres is an industry-leading robotics engineer who has spent the last decade designing automated work cells for automotive manufacturers. Certified by Fanuc, she bridges the gap between mechanical design and robotic programming.",
      expertise: ["Fanuc Robotics", "Assembly Automation", "PLC Integration", "Kinematics"]
    },
    { 
      email: "kwame.osei@mechlms.test", 
      fullName: "Dr. Kwame Osei", 
      specialization: "Industrial Automation Lead", 
      credentials: "Delft | Ex-ABB & Siemens", 
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop", 
      experienceYears: "18 yrs",
      shortBio: "Expert in DCS and PLC systems, formerly leading automation projects at ABB.",
      bio: "Dr. Kwame Osei brings 18 years of global experience in industrial automation. Having led massive SCADA implementations for smart factories across Europe and Africa, he focuses on making complex control systems accessible to aspiring engineers.",
      expertise: ["SCADA Systems", "PLC Programming", "Industrial IoT", "Process Automation"]
    },
    { 
      email: "marcus.hill@mechlms.test", 
      fullName: "Dr. Marcus Hill", 
      specialization: "Fluid Dynamics Researcher", 
      credentials: "Caltech | Ex-NASA JPL", 
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop", 
      experienceYears: "14 yrs",
      shortBio: "Former NASA JPL researcher specializing in computational fluid dynamics (CFD).",
      bio: "Dr. Marcus Hill spent over a decade at NASA's Jet Propulsion Laboratory working on propulsion systems. He is an expert in applied fluid mechanics and teaches advanced CFD simulation techniques.",
      expertise: ["CFD Analysis", "Propulsion Systems", "Hydraulics", "Aerodynamics"]
    },
    { 
      email: "liu.wei@mechlms.test", 
      fullName: "Prof. Liu Wei", 
      specialization: "Thermodynamics & Energy", 
      credentials: "Tsinghua | Ex-GE Energy", 
      avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop", 
      experienceYears: "16 yrs",
      shortBio: "Energy systems specialist with a focus on advanced thermal cycles.",
      bio: "Prof. Liu Wei brings extensive experience from GE Energy, where he optimized steam turbine efficiency. He currently researches sustainable energy transitions and teaches thermodynamics.",
      expertise: ["Heat Transfer", "Thermal Cycles", "Energy Systems", "Turbomachinery"]
    },
    { 
      email: "nina.patel@mechlms.test", 
      fullName: "Dr. Nina Patel", 
      specialization: "Electrical Systems Engineer", 
      credentials: "IIT Delhi | Ex-Honeywell", 
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop", 
      experienceYears: "11 yrs",
      shortBio: "Cross-disciplinary engineer teaching electrical systems for mechanical engineers.",
      bio: "Dr. Nina Patel specializes in electromechanical systems. After a successful career at Honeywell designing avionics, she now focuses on educating mechanical engineers on critical electrical integrations.",
      expertise: ["Circuit Design", "Power Systems", "Avionics", "Electromechanics"]
    },
    { 
      email: "mark.sullivan@mechlms.test", 
      fullName: "Mark Sullivan", 
      specialization: "Quality & Six Sigma Master", 
      credentials: "Black Belt | Ex-Caterpillar", 
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop", 
      experienceYears: "20 yrs",
      shortBio: "Six Sigma Master Black Belt with 20 years of manufacturing quality experience.",
      bio: "Mark Sullivan has saved millions in production waste at Caterpillar using Lean Six Sigma methodologies. He provides practical, hands-on training for quality control and process optimization.",
      expertise: ["Six Sigma Black Belt", "GD&T", "Lean Manufacturing", "Quality Management Systems"]
    },
  ];
  
  const createdInstructors: Record<string, any> = {};
  for (const inst of instructorData) {
    const userRecord = await prisma.user.upsert({
      where: { email: inst.email },
      update: { 
        specialization: inst.specialization, 
        credentials: inst.credentials, 
        avatarUrl: inst.avatarUrl, 
        experienceYears: inst.experienceYears,
        shortBio: inst.shortBio,
        bio: inst.bio,
        expertise: inst.expertise
      },
      create: { 
        ...inst, 
        passwordHash, 
        role: "INSTRUCTOR", 
        isEmailVerified: true 
      },
    });
    createdInstructors[inst.fullName] = userRecord;
  }

  // 3. Engineering Categories
  const categoriesData = [
    { name: "Mechanical Engineering", slug: "mechanical-engineering", description: "Core systems, statics, dynamics & machine design" },
    { name: "AutoCAD", slug: "autocad", description: "2D & 3D computer-aided design fundamentals" },
    { name: "SolidWorks", slug: "solidworks", description: "Parametric 3D modelling & assembly design" },
    { name: "CNC Programming", slug: "cnc-programming", description: "G-code, tooling & machining fundamentals" },
    { name: "Robotics", slug: "robotics", description: "Industrial robots, kinematics & control systems" },
    { name: "Fluid Mechanics", slug: "fluid-mechanics", description: "Hydraulics, pneumatics & CFD analysis" },
    { name: "Thermodynamics", slug: "thermodynamics", description: "Heat transfer, energy systems & cycles" },
    { name: "Manufacturing", slug: "manufacturing", description: "Lean, Six Sigma, production & process" },
    { name: "Industrial Automation", slug: "industrial-automation", description: "PLCs, SCADA, DCS & control systems" },
    { name: "Quality Control", slug: "quality-control", description: "GD&T, QMS, ISO standards & inspection" },
    { name: "Electrical Engineering", slug: "electrical-engineering", description: "Circuits, power systems & electronics for MEs" },
    { name: "Welding Technology", slug: "welding-technology", description: "MIG, TIG, arc welding & weld inspection" },
  ];
  
  const createdCategories: Record<string, any> = {};
  for (const cat of categoriesData) {
    const catRecord = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { description: cat.description },
      create: cat,
    });
    createdCategories[cat.slug] = catRecord;
  }

  // 4. Catalogue Courses with Rich Curriculum Data & Seeded Videos
  const coursesData = [
    {
      title: "Quality Control & Six Sigma Green Belt",
      slug: "quality-control-six-sigma-green-belt",
      description: "Master GD&T, QMS, ISO standards, and quality inspection techniques.",
      longDescription: "Gain mastery over statistical process control, Six Sigma methodologies, and quality management systems used globally in manufacturing plants.",
      priceCents: 15900,
      averageRating: 4.8,
      reviewCount: 2240,
      duration: "10 Weeks",
      level: "Intermediate",
      instructor: "Mark Sullivan",
      categorySlug: "quality-control",
      thumbnailUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600&auto=format&fit=crop",
      highlights: ["Six Sigma Green Belt Certification Prep", "Real-world DMAIC case studies", "Statistical software toolkits"],
      modules: [
        { title: "Introduction to Six Sigma & DMAIC Framework", duration: "50 mins", order: 1 },
        { title: "Process Mapping & Baseline Metrics", duration: "1 hr 15 mins", order: 2 },
        { title: "Statistical Process Control (SPC) Charts", duration: "1 hr 30 mins", order: 3 },
      ]
    },
    {
      title: "Industrial Robotics & Automation",
      slug: "industrial-robotics-automation",
      description: "Learn industrial robots, kinematics, control systems, and automation fundamentals.",
      longDescription: "Dive deep into industrial robot programming, end-effector design, safety protocols, and PLC integration for automated assembly lines.",
      priceCents: 19900,
      averageRating: 4.8,
      reviewCount: 1960,
      duration: "12 Weeks",
      level: "Advanced",
      instructor: "Dr. Kwame Osei",
      categorySlug: "robotics",
      thumbnailUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=600&auto=format&fit=crop",
      highlights: ["Fanuc & ABB simulation exercises", "Safety standards & robot cell design", "Kinematics and trajectory planning"],
      modules: [
        { title: "Robot Kinematics & Coordinate Systems", duration: "1 hr", order: 1 },
        { title: "Pendant Programming & Safety Interlocks", duration: "1 hr 20 mins", order: 2 },
        { title: "Vision Systems & Automated Sorting", duration: "1 hr 45 mins", order: 3 },
      ]
    },
    {
      title: "CNC Programming & Machining Fundamentals",
      slug: "cnc-programming-machining-fundamentals",
      description: "Master G-code, tooling, cutting parameters, and CNC machine operations.",
      longDescription: "A complete hands-on course covering manual G-code programming, tool path optimization, speeds, feeds, and modern CNC milling setups.",
      priceCents: 9900,
      averageRating: 4.8,
      reviewCount: 5180,
      duration: "8 Weeks",
      level: "Beginner to Intermediate",
      instructor: "Prof. Sarah Chen",
      categorySlug: "cnc-programming",
      thumbnailUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=600&auto=format&fit=crop",
      highlights: ["G-code syntax & M-code command tables", "Cutting tool selection principles", "Shop-floor simulation practice"],
      modules: [
        { title: "Fundamentals of G-Code & Coordinate Systems", duration: "45 mins", order: 1 },
        { title: "Speeds, Feeds & Material Removal Rates", duration: "1 hr", order: 2 },
        { title: "Cutter Compensation & Subroutines", duration: "1 hr 15 mins", order: 3 },
      ]
    },
  ];
  
  for (const c of coursesData) {
    const instRecord = createdInstructors[c.instructor];
    const catRecord = createdCategories[c.categorySlug];
    
    await prisma.course.upsert({
      where: { slug: c.slug },
      update: {
        priceCents: c.priceCents,
        averageRating: c.averageRating,
        reviewCount: c.reviewCount,
        thumbnailUrl: c.thumbnailUrl,
        duration: c.duration,
        level: c.level,
        longDescription: c.longDescription,
      },
      create: {
        title: c.title,
        slug: c.slug,
        description: c.description,
        longDescription: c.longDescription,
        priceCents: c.priceCents,
        status: "PUBLISHED",
        averageRating: c.averageRating,
        reviewCount: c.reviewCount,
        duration: c.duration,
        level: c.level,
        instructorId: instRecord.id,
        categoryId: catRecord?.id,
        thumbnailUrl: c.thumbnailUrl,
        highlights: c.highlights,
        modules: {
          create: c.modules.map(m => ({
            title: m.title,
            duration: m.duration,
            order: m.order,
            lessons: {
              create: [
                { 
                  title: m.title + " - Part 1", 
                  order: 1, 
                  durationSeconds: 1200, 
                  contentUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" 
                },
                { 
                  title: m.title + " - Part 2", 
                  order: 2, 
                  durationSeconds: 1500, 
                  contentUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" 
                }
              ]
            }
          }))
        }
      },
    });
  }

  // 5. Test Coupon
  await prisma.coupon.upsert({
    where: { code: "TEST20" },
    update: {},
    create: {
      code: "TEST20",
      discountType: "PERCENTAGE",
      discountValue: 20,
      maxUses: 100,
      isActive: true,
    },
  });

  // 6. Student Enrollments & Progress Data
  console.log('Seeding student enrollments and progress...');
  
  const testStudent = await prisma.user.findUnique({
    where: { email: 'student@mechlms.test' }
  });
  
  const availableCourses = await prisma.course.findMany({
    take: 3,
    include: {
      modules: {
        include: { lessons: true }
      }
    }
  });

  if (testStudent && availableCourses.length >= 3) {
    const completionRates = [1.0, 0.91, 0.34]; 
    const statuses: any[] = ['COMPLETED', 'ACTIVE', 'ACTIVE'];

    for (let i = 0; i < 3; i++) {
      const course = availableCourses[i];
      const allLessons = course.modules.flatMap(m => m.lessons);
      const targetCompletedCount = Math.floor(allLessons.length * completionRates[i]);

      await prisma.enrollment.upsert({
        where: {
          userId_courseId: {
            userId: testStudent.id,
            courseId: course.id
          }
        },
        update: {},
        create: {
          userId: testStudent.id,
          courseId: course.id,
          status: statuses[i],
          progress: {
            create: allLessons.map((lesson, index) => ({
              user: { connect: { id: testStudent.id } },
              lesson: { connect: { id: lesson.id } },
              status: (index < targetCompletedCount ? 'COMPLETED' : 'NOT_STARTED') as any,
              completedAt: index < targetCompletedCount ? new Date() : null
            }))
          }
        }
      });
    }
    console.log('✅ Student enrollments and progress successfully seeded!');
  } else {
    console.log('⚠️ Could not seed enrollments: Missing student or insufficient courses.');
  }
  
  console.log("Database successfully seeded with full course catalogue, modules, and video streams!"); 
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });