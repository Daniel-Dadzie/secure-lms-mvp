export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  tourTarget?: string;
  href?: string;
  ctaLabel?: string;
}

export const STUDENT_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to Mech Spec",
    description:
      "This quick tour shows you where to browse courses, track progress, and earn certificates. You can skip anytime.",
  },
  {
    id: "browse",
    title: "Browse courses",
    description: "Explore the full catalogue, filter by category, and enroll in free or paid courses.",
    tourTarget: "browse-courses",
    href: "/student/courses",
    ctaLabel: "Open catalogue",
  },
  {
    id: "learning",
    title: "My Courses",
    description: "Everything you are enrolled in lives here — resume lessons and pick up where you left off.",
    tourTarget: "my-learning",
    href: "/student/my-learning",
    ctaLabel: "View my courses",
  },
  {
    id: "certificates",
    title: "Certificates",
    description: "When you complete a course, your certificate appears here for download and sharing.",
    tourTarget: "certificates",
    href: "/student/certificates",
    ctaLabel: "See certificates",
  },
  {
    id: "help",
    title: "Help & notifications",
    description: "Use Help Center for guides and the bell icon in the top bar for enrollment and progress alerts.",
    tourTarget: "help-center",
    href: "/student/help-center",
    ctaLabel: "Open help center",
  },
  {
    id: "done",
    title: "You're all set",
    description: "Start with Browse Courses or check your dashboard for recommended programmes. Happy learning!",
    href: "/student/courses",
    ctaLabel: "Browse courses",
  },
];

export const INSTRUCTOR_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome, Instructor",
    description:
      "This tour walks you through creating courses, managing students, and tracking performance. Skip anytime if you already know the layout.",
  },
  {
    id: "courses",
    title: "My Courses",
    description: "View and manage all your published and draft courses from one place.",
    tourTarget: "my-courses",
    href: "/instructor/courses",
    ctaLabel: "View courses",
  },
  {
    id: "create",
    title: "Create a course",
    description: "Build modules, upload lessons, set pricing, and publish when you are ready.",
    href: "/instructor/courses/create",
    ctaLabel: "Create course",
  },
  {
    id: "students",
    title: "Students",
    description: "See who enrolled in your courses and monitor their progress.",
    tourTarget: "students",
    href: "/instructor/students",
    ctaLabel: "View students",
  },
  {
    id: "analytics",
    title: "Analytics & earnings",
    description: "Track enrollments, completions, reviews, and revenue over time.",
    tourTarget: "analytics",
    href: "/instructor/analytics",
    ctaLabel: "Open analytics",
  },
  {
    id: "done",
    title: "Ready to teach",
    description: "Create your first course or explore the dashboard. We're excited to have you on the platform!",
    href: "/instructor/courses/create",
    ctaLabel: "Create first course",
  },
];
