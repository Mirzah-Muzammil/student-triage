"use server";

import { cookies } from "next/headers";

export async function login(username: string, password: string) {
  const adminUser = process.env.DASHBOARD_USER || "admin";
  const adminPassword = process.env.DASHBOARD_PASSWORD || "changeme";

  if (username === adminUser && password === adminPassword) {
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });
    return { success: true };
  }
  return { success: false, error: "Invalid username or password" };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
}

export async function getAdminUser() {
  const adminUser = process.env.DASHBOARD_USER || "admin";
  return adminUser;
}
