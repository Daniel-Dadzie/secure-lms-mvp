import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

import InstructorDashboard from "@/app/(dashboard)/instructor/page";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

const mockApiGet = vi.mocked(api.get);

vi.mock("@/lib/api", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/ui/StatCard", () => ({
  StatCard: ({
    label,
    value,
    icon,
  }: {
    label: string;
    value: string;
    icon?: string;
  }) => (
    <div data-testid="stat-card">
      <span>{label}</span>
      <span>{value}</span>
      {icon && <span>{icon}</span>}
    </div>
  ),
}));

vi.mock("@/components/ui/LoadingSkeleton", () => ({
  LoadingSkeleton: ({
    className,
  }: {
    className?: string;
  }) => (
    <div
      data-testid="loading-skeleton"
      className={className}
    />
  ),
  StatCardSkeleton: () => <div data-testid="stat-card-skeleton" />,
  CourseCardSkeleton: () => <div data-testid="course-card-skeleton" />,
}));

vi.mock("@/components/ui/EmptyState", () => ({
  EmptyState: ({
    title,
    description,
    action,
  }: {
    title: string;
    description: string;
    action?: React.ReactNode;
  }) => (
    <div data-testid="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  ),
}));

vi.mock("@/lib/admin/formatters", () => ({
  formatCurrency: (cents: number) =>
    `$${(cents / 100).toFixed(2)}`,
}));

describe("Instructor Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useAuthStore.setState({
      user: {
        id: "instructor-1",
        email: "instructor@example.com",
        fullName: "John Instructor",
        role: "INSTRUCTOR",
        isActive: true,
        isEmailVerified: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      isLoading: false,
      isAuthenticated: true,
    });
  });

  it("renders the instructor welcome message", async () => {
    mockApiGet.mockResolvedValueOnce({
      data: {
        courses: [],
        totals: {
          totalEnrollments: 0,
          totalCompletions: 0,
          totalRevenueCents: 0,
        },
      },
    });

    render(<InstructorDashboard />);

    expect(
      screen.getByRole("heading", {
        name: /welcome back, john/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /here's how your courses are performing/i
      )
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledWith(
        "/instructor/analytics/overview"
      );
    });
  });

  it("loads and displays instructor overview statistics", async () => {
    mockApiGet.mockResolvedValueOnce({
      data: {
        courses: [],
        totals: {
          totalEnrollments: 125,
          totalCompletions: 80,
          totalRevenueCents: 125000,
        },
      },
    });

    render(<InstructorDashboard />);

    await waitFor(() => {
      expect(
        screen.getByText("Total Enrollments")
      ).toBeInTheDocument();
    });

    expect(screen.getByText("125")).toBeInTheDocument();
    expect(screen.getByText("Total Completions")).toBeInTheDocument();
    expect(screen.getByText("80")).toBeInTheDocument();
    expect(screen.getByText("Total Revenue")).toBeInTheDocument();
    expect(screen.getByText("$1250.00")).toBeInTheDocument();
  });

  it("displays instructor courses", async () => {
    mockApiGet.mockResolvedValueOnce({
      data: {
        totals: {
          totalEnrollments: 150,
          totalCompletions: 90,
          totalRevenueCents: 200000,
        },
        courses: [
          {
            courseId: "course-1",
            courseTitle: "Advanced Mechanical Engineering",
            enrollmentCount: 100,
            completionCount: 70,
            revenueCents: 150000,
            averageProgress: 75,
          },
          {
            courseId: "course-2",
            courseTitle: "Engineering Mathematics",
            enrollmentCount: 50,
            completionCount: 20,
            revenueCents: 50000,
            averageProgress: 55,
          },
        ],
      },
    });

    render(<InstructorDashboard />);

    await waitFor(() => {
      expect(
        screen.getByText("Advanced Mechanical Engineering")
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText("Engineering Mathematics")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Your Courses")
    ).toBeInTheDocument();

    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();

    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getByText("55%")).toBeInTheDocument();
  });

  it("creates correct course edit links", async () => {
    mockApiGet.mockResolvedValueOnce({
      data: {
        totals: {
          totalEnrollments: 10,
          totalCompletions: 5,
          totalRevenueCents: 10000,
        },
        courses: [
          {
            courseId: "course-123",
            courseTitle: "Machine Design",
            enrollmentCount: 10,
            completionCount: 5,
            revenueCents: 10000,
            averageProgress: 50,
          },
        ],
      },
    });

    render(<InstructorDashboard />);

    await waitFor(() => {
      expect(
        screen.getByText("Machine Design")
      ).toBeInTheDocument();
    });

    const courseLink = screen.getByRole("link", {
      name: "Machine Design",
    });

    expect(courseLink).toHaveAttribute(
      "href",
      "/instructor/courses/course-123/edit"
    );
  });

  it("contains the Create Course link", async () => {
    mockApiGet.mockResolvedValueOnce({
      data: {
        courses: [],
        totals: {
          totalEnrollments: 0,
          totalCompletions: 0,
          totalRevenueCents: 0,
        },
      },
    });

    render(<InstructorDashboard />);

    const createCourseLinks = screen.getAllByRole("link", {
      name: /create course/i,
    });

    expect(createCourseLinks.length).toBeGreaterThan(0);

    expect(createCourseLinks[0]).toHaveAttribute(
      "href",
      "/instructor/courses/create"
    );
  });

  it("contains navigation links for courses, analytics, and reviews", async () => {
    mockApiGet.mockResolvedValueOnce({
      data: {
        courses: [],
        totals: {
          totalEnrollments: 0,
          totalCompletions: 0,
          totalRevenueCents: 0,
        },
      },
    });

    render(<InstructorDashboard />);

    await waitFor(() => {
      expect(
        screen.getByRole("link", { name: /my courses/i })
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole("link", { name: /my courses/i })
    ).toHaveAttribute("href", "/instructor/courses");

    expect(
      screen.getByRole("link", { name: /analytics/i })
    ).toHaveAttribute("href", "/instructor/analytics");

    expect(
      screen.getByRole("link", { name: /reviews/i })
    ).toHaveAttribute("href", "/instructor/reviews");
  });

  it("shows courses needing attention when a course has no enrollments", async () => {
    mockApiGet.mockResolvedValueOnce({
      data: {
        totals: {
          totalEnrollments: 0,
          totalCompletions: 0,
          totalRevenueCents: 0,
        },
        courses: [
          {
            courseId: "course-1",
            courseTitle: "New Engineering Course",
            enrollmentCount: 0,
            completionCount: 0,
            revenueCents: 0,
            averageProgress: 0,
          },
        ],
      },
    });

    render(<InstructorDashboard />);

    await waitFor(() => {
      expect(
        screen.getByText("Courses needing attention")
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        /new engineering course.*no enrollments yet/i
      )
    ).toBeInTheDocument();
  });

  it("shows courses needing attention when average progress is below 30 percent", async () => {
    mockApiGet.mockResolvedValueOnce({
      data: {
        totals: {
          totalEnrollments: 10,
          totalCompletions: 0,
          totalRevenueCents: 5000,
        },
        courses: [
          {
            courseId: "course-1",
            courseTitle: "Low Progress Course",
            enrollmentCount: 10,
            completionCount: 0,
            revenueCents: 5000,
            averageProgress: 20,
          },
        ],
      },
    });

    render(<InstructorDashboard />);

    await waitFor(() => {
      expect(
        screen.getByText("Courses needing attention")
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        /low progress course.*20% avg progress/i
      )
    ).toBeInTheDocument();
  });

  it("shows an error message when loading analytics fails", async () => {
    mockApiGet.mockRejectedValueOnce(
      new Error("Network error")
    );

    render(<InstructorDashboard />);

    await waitFor(() => {
      expect(
        screen.getByText(
          /failed to load analytics\. please refresh the page/i
        )
      ).toBeInTheDocument();
    });
  });

  it("shows the empty state when the instructor has no courses", async () => {
    mockApiGet.mockResolvedValueOnce({
      data: {
        totals: {
          totalEnrollments: 0,
          totalCompletions: 0,
          totalRevenueCents: 0,
        },
        courses: [],
      },
    });

    render(<InstructorDashboard />);

    await waitFor(() => {
      expect(
        screen.getByText("No courses yet")
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        /start sharing your expertise with students today/i
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: /create your first course/i,
      })
    ).toHaveAttribute(
      "href",
      "/instructor/courses/create"
    );
  });
});