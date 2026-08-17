import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useAuthStore } from "@/store/auth.store";
import LoginPage from "@/app/(auth)/login/page";

const mockPush = vi.fn();
const mockGet = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: mockGet,
  }),
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

vi.mock("@/components/auth/AuthBackground", () => ({
  AuthBackground: () => <div data-testid="auth-background" />,
}));

describe("Login Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGet.mockImplementation((key: string) => {
      if (key === "redirect") return null;
      if (key === "returnTo") return null;
      return null;
    });

    useAuthStore.setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
  });

  it("renders the login page correctly", () => {
    render(<LoginPage />);

    expect(
      screen.getByRole("heading", {
        name: /welcome back, engineer/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /sign in/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/email/i)
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/password/i)
    ).toBeInTheDocument();
  });

  it("allows the user to enter email and password", () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, {
      target: { value: "instructor@example.com" },
    });

    fireEvent.change(passwordInput, {
      target: { value: "Password123!" },
    });

    expect(emailInput).toHaveValue("instructor@example.com");
    expect(passwordInput).toHaveValue("Password123!");
  });

  it("calls login with the entered credentials", async () => {
    const loginMock = vi.fn().mockResolvedValue(undefined);

    useAuthStore.setState({
      user: {
        id: "user-1",
        email: "instructor@example.com",
        fullName: "John Instructor",
        role: "INSTRUCTOR",
        isActive: true,
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
      },
      isLoading: false,
      isAuthenticated: false,
      login: loginMock,
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "instructor@example.com" },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "Password123!" },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /sign in/i,
      })
    );

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        email: "instructor@example.com",
        password: "Password123!",
      });
    });
  });

  it("redirects an instructor to the instructor dashboard after login", async () => {
    const loginMock = vi.fn().mockImplementation(async () => {
      useAuthStore.setState({
        user: {
          id: "user-1",
          email: "instructor@example.com",
          fullName: "John Instructor",
          role: "INSTRUCTOR",
          isActive: true,
          isEmailVerified: true,
          createdAt: new Date().toISOString(),
        },
        isLoading: false,
        isAuthenticated: true,
      });
    });

    useAuthStore.setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: loginMock,
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "instructor@example.com" },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "Password123!" },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /sign in/i,
      })
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/instructor");
    });
  });

  it("redirects an admin to the admin dashboard after login", async () => {
    const loginMock = vi.fn().mockImplementation(async () => {
      useAuthStore.setState({
        user: {
          id: "admin-1",
          email: "admin@example.com",
          fullName: "Admin User",
          role: "ADMIN",
          isActive: true,
  isEmailVerified: true,
  createdAt: "2026-01-01T00:00:00.000Z",
        },
        isLoading: false,
        isAuthenticated: true,
      });
    });

    useAuthStore.setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: loginMock,
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "admin@example.com" },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "Password123!" },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /sign in/i,
      })
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin/dashboard");
    });
  });

  it("redirects a student to the student dashboard after login", async () => {
    const loginMock = vi.fn().mockImplementation(async () => {
      useAuthStore.setState({
        user: {
          id: "student-1",
          email: "student@example.com",
          fullName: "Student User",
          role: "STUDENT",
          isActive: true,
  isEmailVerified: true,
  createdAt: "2026-01-01T00:00:00.000Z",
        },
        isLoading: false,
        isAuthenticated: true,
      });
    });

    useAuthStore.setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: loginMock,
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "student@example.com" },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "Password123!" },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /sign in/i,
      })
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/student");
    });
  });

  it("shows an error when login fails", async () => {
    const loginMock = vi.fn().mockRejectedValue({
      response: {
        data: {
          message: "Invalid email or password. Please try again.",
        },
      },
    });

    useAuthStore.setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: loginMock,
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "wrong@example.com" },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "WrongPassword" },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /sign in/i,
      })
    );

    await waitFor(() => {
      expect(screen.getByText("Invalid email or password. Please try again.")).toBeInTheDocument();
    });
  });

  it("supports redirect query parameter after successful login", async () => {
    mockGet.mockImplementation((key: string) => {
      if (key === "redirect") return "/instructor/courses";
      return null;
    });

    const loginMock = vi.fn().mockImplementation(async () => {
      useAuthStore.setState({
        user: {
          id: "user-1",
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

    useAuthStore.setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: loginMock,
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "instructor@example.com" },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "Password123!" },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /sign in/i,
      })
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/instructor/courses");
    });
  });

  it("contains a link to the registration page", () => {
    render(<LoginPage />);

    const registerLink = screen.getByRole("link", {
      name: /create one free/i,
    });

    expect(registerLink).toHaveAttribute("href", "/register");
  });
});
