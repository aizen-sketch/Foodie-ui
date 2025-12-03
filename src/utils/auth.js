export async function getUserFromToken() {
    const token = localStorage.getItem("token");
    if (!token) return null;
  
    const res = await fetch("http://localhost:8000/auth/validate", {
      headers: { Authorization: `Bearer ${token}` },
    });
  
    return res.json();
  }
  