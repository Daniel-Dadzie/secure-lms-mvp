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
    where: { email: "admin@mechlms.com" },
    update: {},
    create: {
      email: "admin@mechlms.com",
      passwordHash,
      fullName: "Admin User",
      role: "ADMIN",
      isEmailVerified: true,
    },
  });
  
  const student = await prisma.user.upsert({
    where: { email: "student@mechlms.com" },
    update: {
      region: "NORTH_AMERICA",
      detectedTimezone: "America/New_York",
    },
    create: {
      email: "student@mechlms.com",
      passwordHash,
      fullName: "Student User",
      role: "STUDENT",
      isEmailVerified: true,
      region: "NORTH_AMERICA",
      detectedTimezone: "America/New_York",
    },
  });
  // 2. Expert Instructors
  const instructorData = [
    { 
      email: "james.walker@mechlms.com", 
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
      email: "sarah.chen@mechlms.com", 
      fullName: "Prof. Sarah Chen", 
      specialization: "CAD / CAM Specialist", 
      credentials: "Stanford ME | Ex-Lockheed", 
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop", 
      experienceYears: "12 yrs",
      shortBio: "Manufacturing engineer at Stanford University with deep expertise in CNC programming, precision machining, and CAM software.",
      bio: "Prof. Sarah Chen has 16 years of combined industry and academic experience in precision manufacturing. She has collaborated with Siemens, Fanuc, and Haas Automation on next-generation machine tool development, contributing to controller firmware optimisation and toolpath algorithms. At Stanford, she directs the Advanced Manufacturing Lab and teaches graduate courses in computational manufacturing.",
      expertise: ["CNC Milling & Turning", "G-Code Programming", "CAM Software (Fusion 360)", "Precision Metrology", "Cutting Tool Selection"]
    },
    { 
      email: "emily.torres@mechlms.com", 
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
      email: "kwame.osei@mechlms.com", 
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
      email: "marcus.hill@mechlms.com", 
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
      email: "liu.wei@mechlms.com", 
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
      email: "nina.patel@mechlms.com", 
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
      email: "mark.sullivan@mechlms.com", 
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
  
  const instructorRegions = [
    "NORTH_AMERICA",
    "ASIA_PACIFIC",
    "LATIN_AMERICA",
    "AFRICA",
    "NORTH_AMERICA",
    "ASIA_PACIFIC",
    "EUROPE",
    "ASIA_PACIFIC",
    "NORTH_AMERICA",
  ] as const;

  const instructorTimezones = [
    "America/New_York",
    "Asia/Shanghai",
    "America/Sao_Paulo",
    "Africa/Accra",
    "America/Los_Angeles",
    "Asia/Tokyo",
    "Europe/London",
    "Asia/Kolkata",
    "America/Chicago",
  ];

  const createdInstructors: Record<string, any> = {};
  for (let i = 0; i < instructorData.length; i++) {
    const inst = instructorData[i];
    const userRecord = await prisma.user.upsert({
      where: { email: inst.email },
      update: {
        specialization: inst.specialization,
        credentials: inst.credentials,
        avatarUrl: inst.avatarUrl,
        experienceYears: inst.experienceYears,
        shortBio: inst.shortBio,
        bio: inst.bio,
        expertise: inst.expertise,
        region: instructorRegions[i],
        detectedTimezone: instructorTimezones[i],
      },
      create: {
        ...inst,
        passwordHash,
        role: "INSTRUCTOR",
        isEmailVerified: true,
        region: instructorRegions[i],
        detectedTimezone: instructorTimezones[i],
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
  // 4. Catalogue Courses (12 Unique Courses with full data and pictures)
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
    {
      title: "Advanced SolidWorks Parametric Design",
      slug: "advanced-solidworks-parametric-design",
      description: "Master complex surface modeling, configurations, and large assembly assemblies.",
      longDescription: "Take your CAD skills beyond basics. Learn advanced surfacing, top-down assembly modeling, and automated design tables.",
      priceCents: 12900,
      averageRating: 4.9,
      reviewCount: 3410,
      duration: "8 Weeks",
      level: "Advanced",
      instructor: "Prof. Sarah Chen",
      categorySlug: "solidworks",
      thumbnailUrl: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?q=80&w=600&auto=format&fit=crop",
      highlights: ["Complex loft and boundary surfaces", "Top-down assembly management", "Design tables & configurations"],
      modules: [
        { title: "Advanced Surfacing & Patching", duration: "1 hr", order: 1 },
        { title: "Top-Down Assembly Modeling Techniques", duration: "1 hr 30 mins", order: 2 },
        { title: "Configurations & Design Tables", duration: "45 mins", order: 3 },
      ]
    },
    {
      title: "Aerospace Structural Engineering & Analysis",
      slug: "aerospace-structural-engineering-analysis",
      description: "Analyze aircraft frames, stress concentrations, and finite element verification.",
      longDescription: "Explore the rigorous engineering standards behind aircraft and spacecraft structural integrity, fatigue analysis, and load paths.",
      priceCents: 21900,
      averageRating: 4.9,
      reviewCount: 1120,
      duration: "14 Weeks",
      level: "Advanced",
      instructor: "Dr. James Walker",
      categorySlug: "mechanical-engineering",
      thumbnailUrl: "https://images.unsplash.com/photo-1517976487504-55447fb4e365?q=80&w=600&auto=format&fit=crop",
      highlights: ["Airframe load distribution analysis", "Fatigue and fracture mechanics", "FEA validation best practices"],
      modules: [
        { title: "Introduction to Airframe Loads & Criteria", duration: "1 hr 15 mins", order: 1 },
        { title: "Thin-Walled Structures & Shear Flow", duration: "1 hr 45 mins", order: 2 },
        { title: "Fatigue Life Prediction Models", duration: "1 hr 30 mins", order: 3 },
      ]
    },
    {
      title: "Computational Fluid Dynamics (CFD) Mastery",
      slug: "computational-fluid-dynamics-cfd-mastery",
      description: "Simulate fluid flow, turbulence, and thermal transfer using professional CFD software.",
      longDescription: "Learn boundary layer meshing, turbulence models (RANS, LES), and post-processing visualization for aerodynamic optimization.",
      priceCents: 18900,
      averageRating: 4.8,
      reviewCount: 1840,
      duration: "10 Weeks",
      level: "Intermediate",
      instructor: "Dr. Marcus Hill",
      categorySlug: "fluid-mechanics",
      thumbnailUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=600&auto=format&fit=crop",
      highlights: ["Mesh convergence verification", "Turbulence closure modeling", "External aerodynamics simulations"],
      modules: [
        { title: "Discretization & Navier-Stokes Solvers", duration: "1 hr", order: 1 },
        { title: "Boundary Layer Setup & Wall Y+ Tuning", duration: "1 hr 20 mins", order: 2 },
        { title: "Post-Processing & Flow Visualization", duration: "1 hr", order: 3 },
      ]
    },
    {
      title: "Industrial Welding Technology & Inspection",
      slug: "industrial-welding-technology-inspection",
      description: "Understand MIG, TIG, arc welding standards, and non-destructive testing (NDT).",
      longDescription: "A comprehensive guide to modern metal joining processes, metallurgy changes during welding, and structural weld inspection criteria.",
      priceCents: 10900,
      averageRating: 4.7,
      reviewCount: 950,
      duration: "6 Weeks",
      level: "Beginner to Intermediate",
      instructor: "Emily Torres",
      categorySlug: "welding-technology",
      thumbnailUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600&auto=format&fit=crop",
      highlights: ["AWS welding code standards", "Non-destructive evaluation (NDT/UT/RT)", "Metallurgical defect analysis"],
      modules: [
        { title: "Arc Physics & Shielding Gas Selection", duration: "45 mins", order: 1 },
        { title: "Welding Metallurgy & Heat-Affected Zones", duration: "1 hr", order: 2 },
        { title: "Weld Discontinuities & Inspection Methods", duration: "1 hr 15 mins", order: 3 },
      ]
    },
    {
      title: "Applied Thermodynamics & Power Cycles",
      slug: "applied-thermodynamics-power-cycles",
      description: "Analyze power plants, internal combustion engines, and thermal efficiency loops.",
      longDescription: "An in-depth study of energy conversion systems, Rankine/Brayton cycles, and thermodynamic loss reduction for sustainable power generation.",
      priceCents: 13900,
      averageRating: 4.7,
      reviewCount: 980,
      duration: "9 Weeks",
      level: "Intermediate",
      instructor: "Prof. Liu Wei",
      categorySlug: "thermodynamics",
      thumbnailUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=600&auto=format&fit=crop",
      highlights: ["Thermal efficiency optimization", "Cogeneration plant design", "Exergy analysis principles"],
      modules: [
        { title: "First & Second Law Analysis of Systems", duration: "50 mins", order: 1 },
        { title: "Vapor and Gas Power Cycles", duration: "1 hr 20 mins", order: 2 },
        { title: "Refrigeration & Heat Pump Systems", duration: "1 hr 10 mins", order: 3 },
      ]
    },
    {
      title: "Electrical Systems for Mechanical Engineers",
      slug: "electrical-systems-for-mechanical-engineers",
      description: "Bridge the gap between mechanics and electronics with circuit and power training.",
      longDescription: "Designed specifically for mechanical professionals, this course covers DC/AC circuits, electromechanical actuators, motor drives, and sensor interfacing.",
      priceCents: 11900,
      averageRating: 4.9,
      reviewCount: 3100,
      duration: "7 Weeks",
      level: "Beginner",
      instructor: "Dr. Nina Patel",
      categorySlug: "electrical-engineering",
      thumbnailUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop",
      highlights: ["Motor selection & drive integration", "Microcontroller & sensor wiring", "PCB layout fundamentals"],
      modules: [
        { title: "Circuit Fundamentals & Ohm's Law in Practice", duration: "45 mins", order: 1 },
        { title: "AC Motors, Drives & Inverters", duration: "1 hr 15 mins", order: 2 },
        { title: "Actuators & Industrial Sensor Interfacing", duration: "1 hr", order: 3 },
      ]
    },
    {
      title: "PLC Programming & SCADA Integration",
      slug: "plc-programming-scada-integration",
      description: "Program programmable logic controllers and build custom supervisory control screens.",
      longDescription: "Learn IEC 61131-3 languages (Ladder Logic, Structured Text), HMI panel creation, and SCADA communication protocols for modern manufacturing.",
      priceCents: 16900,
      averageRating: 4.8,
      reviewCount: 1540,
      duration: "10 Weeks",
      level: "Intermediate",
      instructor: "Dr. Kwame Osei",
      categorySlug: "industrial-automation",
      thumbnailUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop",
      highlights: ["Ladder logic & structured text coding", "Modbus & OPC UA protocol configuration", "HMI screen UI/UX design"],
      modules: [
        { title: "Introduction to PLC Architecture & Ladder Logic", duration: "1 hr", order: 1 },
        { title: "Timers, Counters & Advanced Instructions", duration: "1 hr 30 mins", order: 2 },
        { title: "SCADA Tag Database & Alarm Management", duration: "1 hr 15 mins", order: 3 },
      ]
    },
    {
      title: "AutoCAD 2D & 3D Engineering Drafting",
      slug: "autocad-2d-3d-engineering-drafting",
      description: "Master technical drawing standards, orthographic projections, and 3D modeling blocks.",
      longDescription: "A thorough introduction to professional CAD documentation, dimensioning rules, and efficient workspace workflows using AutoCAD.",
      priceCents: 7900,
      averageRating: 4.6,
      reviewCount: 4210,
      duration: "6 Weeks",
      level: "Beginner",
      instructor: "Prof. Sarah Chen",
      categorySlug: "autocad",
      thumbnailUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=600&auto=format&fit=crop",
      highlights: ["Orthographic projection standards", "Layer management & annotation styles", "Parametric blocks & attributes"],
      modules: [
        { title: "Basic Drawing Tools & Coordinate Systems", duration: "45 mins", order: 1 },
        { title: "Dimensioning & Geometric Tolerancing", duration: "1 hr", order: 2 },
        { title: "3D Wireframe & Solid Modeling Basics", duration: "1 hr 15 mins", order: 3 },
      ]
    },
    {
      title: "Lean Manufacturing & Plant Optimization",
      slug: "lean-manufacturing-plant-optimization",
      description: "Eliminate waste, reduce cycle times, and optimize plant floor layouts using 5S and Kanban.",
      longDescription: "Learn core operational excellence tools to streamline production flow, minimize inventory costs, and establish robust continuous improvement culture.",
      priceCents: 14900,
      averageRating: 4.8,
      reviewCount: 1320,
      duration: "8 Weeks",
      level: "Intermediate",
      instructor: "Mark Sullivan",
      categorySlug: "manufacturing",
      thumbnailUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600&auto=format&fit=crop",
      highlights: ["Value Stream Mapping (VSM)", "5S workplace organization implementation", "Pull systems & Kanban design"],
      modules: [
        { title: "The 8 Wastes of Lean Manufacturing", duration: "50 mins", order: 1 },
        { title: "Value Stream Mapping Current & Future States", duration: "1 hr 20 mins", order: 2 },
        { title: "SMED (Single-Minute Exchange of Die)", duration: "1 hr", order: 3 },
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
  // 6. Additional demo students across regions + enrollments
  console.log("Seeding demo students, enrollments, and progress...");

  const demoStudents = [
    { email: "anna.eu@mechlms.com", fullName: "Anna Becker", region: "EUROPE", tz: "Europe/Berlin" },
    { email: "carlos.la@mechlms.com", fullName: "Carlos Mendez", region: "LATIN_AMERICA", tz: "America/Mexico_City" },
    { email: "amara.af@mechlms.com", fullName: "Amara Okonkwo", region: "AFRICA", tz: "Africa/Lagos" },
    { email: "omar.me@mechlms.com", fullName: "Omar Hassan", region: "MIDDLE_EAST", tz: "Asia/Dubai" },
    { email: "yuki.ap@mechlms.com", fullName: "Yuki Tanaka", region: "ASIA_PACIFIC", tz: "Asia/Tokyo" },
  ] as const;

  const seededStudents = [student];
  for (const s of demoStudents) {
    const record = await prisma.user.upsert({
      where: { email: s.email },
      update: { region: s.region, detectedTimezone: s.tz },
      create: {
        email: s.email,
        passwordHash,
        fullName: s.fullName,
        role: "STUDENT",
        isEmailVerified: true,
        region: s.region,
        detectedTimezone: s.tz,
      },
    });
    seededStudents.push(record);
  }

  const buyerTimezoneByEmail: Record<string, string> = {
    [student.email]: "America/New_York",
    ...Object.fromEntries(demoStudents.map((s) => [s.email, s.tz])),
  };

  const allCoursesForEnroll = await prisma.course.findMany({
    include: { modules: { include: { lessons: true } } },
  });

  // Bulk enrollments for regional demo students only — keep student@mechlms.com isolated
  const bulkEnrollmentStudents = seededStudents.filter(
    (u) => u.email !== student.email
  );

  const monthsAgo = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
  let enrollIndex = 0;

  for (const course of allCoursesForEnroll.slice(0, 8)) {
    for (let m = 0; m < 3; m++) {
      const studentUser =
        bulkEnrollmentStudents[enrollIndex % bulkEnrollmentStudents.length];
      const monthsBack = monthsAgo[enrollIndex % monthsAgo.length];
      const enrolledAt = new Date();
      enrolledAt.setMonth(enrolledAt.getMonth() - monthsBack);
      enrolledAt.setDate(10 + (enrollIndex % 15));

      const isCompleted = enrollIndex % 3 === 0;
      const completedAt = isCompleted ? new Date(enrolledAt.getTime() + 7 * 86400000) : null;

      try {
        const enrollment = await prisma.enrollment.upsert({
          where: {
            userId_courseId: { userId: studentUser.id, courseId: course.id },
          },
          update: {
            status: isCompleted ? "COMPLETED" : "ACTIVE",
            enrolledAt,
            completedAt,
          },
          create: {
            userId: studentUser.id,
            courseId: course.id,
            status: isCompleted ? "COMPLETED" : "ACTIVE",
            enrolledAt,
            completedAt,
          },
        });

        const allLessons = course.modules.flatMap((mod) => mod.lessons);
        if (allLessons.length > 0) {
          const completedCount = isCompleted
            ? allLessons.length
            : Math.floor(allLessons.length * (0.2 + (enrollIndex % 5) * 0.15));

          for (let li = 0; li < allLessons.length; li++) {
            await prisma.lessonProgress.upsert({
              where: {
                userId_lessonId: { userId: studentUser.id, lessonId: allLessons[li].id },
              },
              update: {
                status: li < completedCount ? "COMPLETED" : "NOT_STARTED",
                completedAt: li < completedCount ? enrolledAt : null,
              },
              create: {
                userId: studentUser.id,
                lessonId: allLessons[li].id,
                enrollmentId: enrollment.id,
                status: li < completedCount ? "COMPLETED" : "NOT_STARTED",
                completedAt: li < completedCount ? enrolledAt : null,
                progressSeconds: li < completedCount ? 600 : 0,
              },
            });
          }
        }
      } catch {
        // skip duplicate conflicts
      }
      enrollIndex++;
    }
  }
  console.log("✅ Demo enrollments seeded across months and regions");

  // Primary demo student — runs last so bulk seed cannot overwrite demo state
  console.log("Seeding primary student (student@mechlms.com) learning data...");
  const primaryStudentCourses = [
    { slug: "cnc-programming-machining-fundamentals", mode: "in_progress" as const },
    { slug: "industrial-robotics-automation", mode: "completed" as const },
  ] as const;

  const resolvedPrimaryCourses = await Promise.all(
    primaryStudentCourses.map(({ slug }) =>
      prisma.course.findUnique({
        where: { slug },
        include: {
          modules: {
            include: { lessons: { orderBy: { order: "asc" } } },
          },
        },
      })
    )
  );

  const demoCourseIds = resolvedPrimaryCourses
    .filter((c): c is NonNullable<typeof c> => c !== null)
    .map((c) => c.id);

  const completedDemoCourseId = resolvedPrimaryCourses.find(
    (c, i) => c && primaryStudentCourses[i].mode === "completed"
  )?.id;

  if (demoCourseIds.length > 0) {
    await prisma.enrollment.deleteMany({
      where: {
        userId: student.id,
        courseId: { notIn: demoCourseIds },
      },
    });
  }

  await prisma.certificate.deleteMany({
    where: {
      userId: student.id,
      ...(completedDemoCourseId
        ? { courseId: { not: completedDemoCourseId } }
        : {}),
    },
  });

  for (let i = 0; i < primaryStudentCourses.length; i++) {
    const { mode } = primaryStudentCourses[i];
    const course = resolvedPrimaryCourses[i];
    if (!course) continue;

    const allLessons = course.modules.flatMap((mod) => mod.lessons);
    const isCompleted = mode === "completed";
    const enrolledAt = new Date();
    enrolledAt.setMonth(enrolledAt.getMonth() - (isCompleted ? 3 : 1));
    const completedAt = isCompleted
      ? new Date(enrolledAt.getTime() + 14 * 86400000)
      : null;

    const enrollment = await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: student.id, courseId: course.id } },
      update: {
        status: isCompleted ? "COMPLETED" : "ACTIVE",
        completedAt,
        enrolledAt,
      },
      create: {
        userId: student.id,
        courseId: course.id,
        status: isCompleted ? "COMPLETED" : "ACTIVE",
        enrolledAt,
        completedAt,
      },
    });

    const completedCount = isCompleted
      ? allLessons.length
      : Math.max(1, Math.floor(allLessons.length * 0.5));

    for (let li = 0; li < allLessons.length; li++) {
      const isDone = li < completedCount;
      const isCurrent = !isCompleted && li === completedCount;
      await prisma.lessonProgress.upsert({
        where: {
          userId_lessonId: { userId: student.id, lessonId: allLessons[li].id },
        },
        update: {
          enrollmentId: enrollment.id,
          status: isDone ? "COMPLETED" : isCurrent ? "IN_PROGRESS" : "NOT_STARTED",
          completedAt: isDone ? enrolledAt : null,
          progressSeconds: isDone ? 900 : isCurrent ? 420 : 0,
          updatedAt: new Date(),
        },
        create: {
          userId: student.id,
          lessonId: allLessons[li].id,
          enrollmentId: enrollment.id,
          status: isDone ? "COMPLETED" : isCurrent ? "IN_PROGRESS" : "NOT_STARTED",
          completedAt: isDone ? enrolledAt : null,
          progressSeconds: isDone ? 900 : isCurrent ? 420 : 0,
        },
      });
    }

    if (isCompleted) {
      await prisma.certificate.upsert({
        where: { userId_courseId: { userId: student.id, courseId: course.id } },
        update: {},
        create: { userId: student.id, courseId: course.id },
      });
    }
  }
  console.log("✅ Primary student: 1 in-progress (CNC) + 1 completed with certificate (Robotics)");

  // Sample activity feed for primary demo student dashboard
  await prisma.activity.deleteMany({ where: { userId: student.id } });
  const cncCourse = resolvedPrimaryCourses[0];
  const roboticsCourse = resolvedPrimaryCourses[1];
  const activityNow = new Date();
  const activityEntries = [
    roboticsCourse && {
      userId: student.id,
      title: `Completed course "${roboticsCourse.title}"`,
      description: "Certificate earned",
      iconType: "certificate",
      createdAt: new Date(activityNow.getTime() - 1 * 86400000),
    },
    roboticsCourse && {
      userId: student.id,
      title: `Enrolled in "${roboticsCourse.title}"`,
      description: "Course enrollment",
      iconType: "enrolled",
      createdAt: new Date(activityNow.getTime() - 90 * 86400000),
    },
    cncCourse && {
      userId: student.id,
      title: `Reached 50% in "${cncCourse.title}"`,
      description: "3 of 6 lessons complete",
      iconType: "badge",
      createdAt: new Date(activityNow.getTime() - 3 * 86400000),
    },
    cncCourse && {
      userId: student.id,
      title: `Completed "${cncCourse.modules[0]?.lessons[0]?.title ?? "Intro lesson"}"`,
      description: cncCourse.title,
      iconType: "completed",
      createdAt: new Date(activityNow.getTime() - 5 * 86400000),
    },
    cncCourse && {
      userId: student.id,
      title: `Enrolled in "${cncCourse.title}"`,
      description: "Course enrollment",
      iconType: "enrolled",
      createdAt: new Date(activityNow.getTime() - 30 * 86400000),
    },
  ].filter(Boolean) as Array<{
    userId: string;
    title: string;
    description: string;
    iconType: string;
    createdAt: Date;
  }>;

  if (activityEntries.length > 0) {
    await prisma.activity.createMany({ data: activityEntries });
    console.log("✅ Primary student activity feed seeded");
  }

  console.log("Database successfully seeded with 12 courses, modules, and video streams!");

  // 7. Sample purchases across months for admin analytics charts
  console.log("Seeding sample purchases...");
  const allCourses = await prisma.course.findMany({ take: 6 });

  const purchaseRegions = [
    "NORTH_AMERICA",
    "EUROPE",
    "AFRICA",
    "ASIA_PACIFIC",
    "LATIN_AMERICA",
    "MIDDLE_EAST",
  ] as const;

  if (allCourses.length > 0 && seededStudents.length > 0) {
    const monthsAgoPurchases = [5, 4, 3, 2, 1, 0];
    for (let i = 0; i < monthsAgoPurchases.length; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - monthsAgoPurchases[i]);
      d.setDate(15);
      const buyer = seededStudents[i % seededStudents.length];
      const course = allCourses[i % allCourses.length];
      await prisma.purchase.create({
        data: {
          userId: buyer.id,
          courseId: course.id,
          amountCents: course.priceCents,
          finalAmountCents: course.priceCents,
          discountCents: 0,
          currency: "GHS",
          status: "COMPLETED",
          provider: "PAYSTACK",
          providerReference: `seed-ref-${i}-${Date.now()}`,
          buyerRegion: purchaseRegions[i],
          buyerTimezone: buyerTimezoneByEmail[buyer.email] ?? null,
          createdAt: d,
          updatedAt: d,
        },
      });
    }
    console.log("✅ Sample purchases seeded");
  }

  // Sample reviews with instructor replies for instructor dashboard demos
  const reviewCourses = await prisma.course.findMany({ take: 4, select: { id: true, instructorId: true, title: true } });
  const reviewStudents = await prisma.user.findMany({ where: { role: "STUDENT" }, take: 3 });
  if (reviewCourses.length > 0 && reviewStudents.length > 0) {
    for (let i = 0; i < reviewCourses.length; i++) {
      const course = reviewCourses[i];
      const reviewer = reviewStudents[i % reviewStudents.length];
      await prisma.review.upsert({
        where: { userId_courseId: { userId: reviewer.id, courseId: course.id } },
        update: {},
        create: {
          userId: reviewer.id,
          courseId: course.id,
          rating: 4 + (i % 2),
          comment: `Excellent content in ${course.title}. Very practical and well structured.`,
          instructorReply: i % 2 === 0 ? "Thank you for the thoughtful feedback! Glad you found it useful." : null,
          instructorReplyAt: i % 2 === 0 ? new Date() : null,
        },
      });
    }
    console.log("✅ Sample reviews seeded");

    for (const course of reviewCourses) {
      const visibleReviews = await prisma.review.findMany({
        where: { courseId: course.id, isVisible: true },
        select: { rating: true },
      });
      const total = visibleReviews.length;
      const sum = visibleReviews.reduce((acc, r) => acc + r.rating, 0);
      const average = total > 0 ? Math.round((sum / total) * 10) / 10 : 0;
      const distribution = { oneStar: 0, twoStar: 0, threeStar: 0, fourStar: 0, fiveStar: 0 };
      visibleReviews.forEach(({ rating }) => {
        if (rating === 1) distribution.oneStar++;
        else if (rating === 2) distribution.twoStar++;
        else if (rating === 3) distribution.threeStar++;
        else if (rating === 4) distribution.fourStar++;
        else if (rating === 5) distribution.fiveStar++;
      });
      await prisma.course.update({
        where: { id: course.id },
        data: { averageRating: average, reviewCount: total },
      });
      await prisma.ratingAggregate.upsert({
        where: { courseId: course.id },
        update: distribution,
        create: { courseId: course.id, ...distribution },
      });
    }
  }

  // 8. Sample support audit events
  await prisma.auditEvent.createMany({
    data: [
      {
        userId: student.id,
        action: "support.question_asked",
        metadata: {
          question: "How do I reset my password?",
          confidence: 0,
          answered: false,
        },
      },
      {
        userId: student.id,
        action: "support.question_asked",
        metadata: {
          question: "How do I enroll in a course?",
          confidence: 0.5,
          answered: true,
        },
      },
    ],
    skipDuplicates: true,
  });

  // 9. Help articlesb
  await prisma.helpArticle.upsert({
    where: { slug: "how-to-register" },
    update: {},
    create: {
      title: "How to Register",
      slug: "how-to-register",
      content:
        "Click Create Account on the login page, fill in your details, and verify your email.",
      category: "getting-started",
      isPublished: true,
      order: 1,
    },
  });

  await prisma.helpArticle.upsert({
    where: { slug: "how-to-enroll" },
    update: {},
    create: {
      title: "How to Enroll in a Course",
      slug: "how-to-enroll",
      content: "Browse courses, add to cart, and complete checkout to enroll.",
      category: "courses",
      isPublished: true,
      order: 2,
    },
  });
}
main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });