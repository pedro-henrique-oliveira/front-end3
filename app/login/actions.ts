"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

export async function loginAction(
  email: string,
  password: string
) {
  let tipo: "admin" | "funcionario" | null = null;
  let accessToken: string | null = null;
  let funcionario: any = null;

  try {
    // ==========================================
    // 1. TENTA LOGIN COMO FUNCIONÁRIO
    // ==========================================

    let response = await fetch(
      `${API_URL}/funcionarios/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          senha: password,
        }),
        cache: "no-store",
      }
    );

    if (response.ok) {
      const data = await response.json();

      console.log(
        "Resposta login funcionário:",
        data
      );

      accessToken =
        data.access_token ??
        data.accessToken ??
        data.token ??
        null;

      funcionario =
        data.funcionario ??
        data.usuario ??
        data.user ??
        null;

      if (accessToken) {
        tipo = "funcionario";
      }
    }

    // ==========================================
    // 2. SE NÃO FOR FUNCIONÁRIO, TENTA ADMIN
    // ==========================================

    if (!accessToken) {
      response = await fetch(
        `${API_URL}/admin/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            senha: password,
          }),
          cache: "no-store",
        }
      );

      if (response.ok) {
        const data = await response.json();

        console.log(
          "Resposta login admin:",
          data
        );

        accessToken =
          data.access_token ??
          data.accessToken ??
          data.token ??
          null;

        if (accessToken) {
          tipo = "admin";
        }
      }
    }
  } catch (error) {
    console.error(
      "Erro no login:",
      error
    );

    return {
      success: false,
      message:
        "Não foi possível conectar ao servidor.",
    };
  }

  // ==========================================
  // 3. VERIFICA LOGIN
  // ==========================================

  if (!tipo || !accessToken) {
    return {
      success: false,
      message:
        "E-mail ou senha inválidos.",
    };
  }

  // ==========================================
  // 4. SALVA TOKEN
  // ==========================================

  const cookieStore = await cookies();

  cookieStore.set(
    "access_token",
    accessToken,
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite: "lax",
      path: "/",
    }
  );

  // ==========================================
  // 5. SALVA TIPO DO USUÁRIO
  // ==========================================

  cookieStore.set(
    "user_type",
    tipo,
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite: "lax",
      path: "/",
    }
  );

  // ==========================================
  // 6. SE FOR FUNCIONÁRIO
  // ==========================================

  if (tipo === "funcionario") {
    if (funcionario) {
      cookieStore.set(
        "funcionario",
        JSON.stringify(funcionario),
        {
          httpOnly: true,
          secure:
            process.env.NODE_ENV ===
            "production",
          sameSite: "lax",
          path: "/",
        }
      );

      if (funcionario.id) {
        cookieStore.set(
          "funcionarioId",
          String(funcionario.id),
          {
            httpOnly: true,
            secure:
              process.env.NODE_ENV ===
              "production",
            sameSite: "lax",
            path: "/",
          }
        );
      }
    }

    redirect("/funcionario");
  }

  // ==========================================
  // 7. SE FOR ADMIN
  // ==========================================

  if (tipo === "admin") {
    redirect("/academia");
  }

  return {
    success: false,
    message:
      "Tipo de usuário inválido.",
  };
}