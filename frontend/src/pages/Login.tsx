import { useState } from "react"
import type { Role } from "../App"
import { useToast } from "../components/Toast"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@config/firebase"

const DEMO_ACCOUNTS = [
  {
    role: "student",
    label: "Sinh viên",
    name: "Nguyễn Văn A",
    email: "student@demo.edu.vn",
    password: "Student123!",
    color: "#4f46e5",
    bg: "#eef2ff",
    desc: "Khám phá và đăng ký sự kiện",
  },
  {
    role: "organizer",
    label: "Ban tổ chức",
    name: "Ban Tổ Chức",
    email: "organizer@demo.edu.vn",
    password: "Organizer123!",
    color: "#0891b2",
    bg: "#ecfeff",
    desc: "Quản lý sự kiện và báo cáo",
  },
  {
    role: "student",
    label: "Sinh viên (CTV điểm danh)",
    name: "Cao Duy Anh",
    email: "checkin@demo.edu.vn",
    password: "Checkin123!",
    color: "#059669",
    bg: "#ecfdf5",
    desc: 'Đã được cấp quyền điểm danh — thấy tab "Điểm danh" trong menu',
    badge: "Có quyền điểm danh",
  },
]

interface Props {
  onLogin: (role: Role) => void
}

export default function Login({ onLogin }: Props) {
  const [tab, setTab] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [registerName, setRegisterName] = useState("")
  const [registerStudentId, setRegisterStudentId] = useState("")
  const [phone, setPhone] = useState("")
  const [faculty, setFaculty] = useState("Công nghệ Thông tin")
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { showToast } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (loading) return
    
    if (tab === "register") {
      if (password !== confirmPassword) {
        showToast("Mật khẩu xác nhận không khớp", "error")
        return
      }
      if (!registerName || !registerStudentId || !email) {
        showToast("Vui lòng điền đầy đủ thông tin", "error")
        return
      }
      
      setLoading(true)
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user
        
        // Save additional user info to Firestore
        await setDoc(doc(db, 'users', user.uid), {
          name: registerName,
          studentId: registerStudentId,
          email: email,
          phone: phone,
          faculty: faculty,
          role: "student", // default role for new registrations
          createdAt: new Date().toISOString()
        })
        
        showToast("Đăng ký thành công! Đang đăng nhập...")
        onLogin("student")
      } catch (error: any) {
        console.error("Register error:", error)
        if (error.code === 'auth/email-already-in-use') {
          showToast("Email này đã được sử dụng", "error")
        } else if (error.code === 'auth/weak-password') {
          showToast("Mật khẩu quá yếu (cần ít nhất 6 ký tự)", "error")
        } else {
          showToast("Đăng ký thất bại: " + error.message, "error")
        }
      } finally {
        setLoading(false)
      }
      return
    }

    // Login logic
    if (!email || !password) {
      showToast("Vui lòng nhập email và mật khẩu", "error")
      return
    }
    
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      // Note: onAuthStateChanged in UserContext will handle state updates,
      // but we still call onLogin here so AppInner can navigate appropriately.
      // AppInner will know the true role once UserContext resolves it,
      // but we can temporarily pass 'student' (or guess based on email)
      const guessedRole = (email.includes("organizer") || email.includes("org")) ? "organizer" : "student"
      onLogin(guessedRole as Role)
    } catch (error: any) {
      console.error("Login error:", error)
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        showToast("Email hoặc mật khẩu không đúng", "error")
      } else {
        showToast("Đăng nhập thất bại: " + error.message, "error")
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleDemoLogin(acc: typeof DEMO_ACCOUNTS[0]) {
    if (loading) return
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, acc.email, acc.password)
      onLogin(acc.role as Role)
    } catch (error: any) {
      console.error("Demo login error:", error)
      if (error.code === 'auth/configuration-not-found') {
        showToast("Bạn chưa bật tính năng Email/Password trong Firebase Console!", "error")
      } else if (error.code === 'auth/invalid-credential') {
        showToast("Tài khoản Demo chưa được tạo trên Firebase (Liên hệ kỹ thuật).", "error")
      } else {
        showToast("Đăng nhập Demo thất bại: " + error.message, "error")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#f8fafc" }}>
      {/* Left branding panel — desktop only */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 xl:p-16 relative overflow-hidden"
        style={{ width: "52%", background: "#1a1a2e" }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10"
            style={{ background: "#4f46e5", filter: "blur(80px)" }}
          />
          <div
            className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full opacity-10"
            style={{ background: "#0891b2", filter: "blur(80px)" }}
          />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-white text-sm tracking-tight"
            style={{ background: "#4f46e5" }}
          >
            CEH
          </div>
          <div>
            <div className="text-white font-display font-bold text-lg leading-none">
              Campus Event Hub
            </div>
            <div className="text-slate-400 text-xs mt-0.5">
              Nền tảng sự kiện sinh viên
            </div>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative space-y-6">
          {/* Illustration placeholder — university/campus feel */}
          <div
            className="rounded-2xl overflow-hidden mb-8"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <img
              src="https://picsum.photos/seed/login/600/300"
              alt="Sinh viên tham gia sự kiện"
              className="w-full h-48 object-cover opacity-70"
            />
            <div className="px-4 py-3 text-xs" style={{ color: "#94a3b8" }}>
              Sinh viên Đại học Công nghệ Thông tin
            </div>
          </div>

          <div>
            <h1
              className="text-white font-display font-bold leading-tight mb-4"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)" }}
            >
              Kết nối sinh viên
              <br />
              <span style={{ color: "#818cf8" }}>Khám phá sự kiện</span>
              <br />
              Tạo dấu ấn
            </h1>
            <p
              className="text-slate-400 leading-relaxed"
              style={{ fontSize: "0.9rem" }}
            >
              Đăng ký sự kiện, nhận vé QR và điểm danh — tất cả trên một nền
              tảng duy nhất dành cho sinh viên.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              ["1.284", "Lượt đăng ký"],
              ["12", "Sự kiện đang mở"],
              ["73,4%", "Tỷ lệ điểm danh"],
            ].map(([v, l]) => (
              <div
                key={l}
                className="rounded-xl p-3"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="text-white font-display font-bold text-xl">
                  {v}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs" style={{ color: "#334155" }}>
          © 2026 Campus Event Hub · Đại học Công nghệ Thông tin
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto"
        style={{ paddingTop: 'max(88px, env(safe-area-inset-top, 88px))' }}>
        <div className="w-full" style={{ maxWidth: 440 }}>
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-display font-bold text-xs"
              style={{ background: "#4f46e5" }}
            >
              CEH
            </div>
            <div>
              <div
                className="font-display font-bold"
                style={{ color: "#1a1a2e" }}
              >
                Campus Event Hub
              </div>
              <div className="text-xs" style={{ color: "#94a3b8" }}>
                Nền tảng sự kiện sinh viên
              </div>
            </div>
          </div>

          {/* Auth card */}
          <div
            className="bg-white rounded-2xl shadow-sm border p-8"
            style={{ borderColor: "#e2e8f0" }}
          >
            {/* Tabs */}
            <div
              className="flex gap-1 p-1 rounded-xl mb-6"
              style={{ background: "#f8fafc" }}
            >
              {(["login", "register"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    background: tab === t ? "white" : "transparent",
                    color: tab === t ? "#1a1a2e" : "#94a3b8",
                    boxShadow:
                      tab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  }}
                >
                  {t === "login" ? "Đăng nhập" : "Đăng ký"}
                </button>
              ))}
            </div>

            {tab === "login" ? (
              <>
                <h2
                  className="font-display font-bold text-xl mb-1"
                  style={{ color: "#1a1a2e" }}
                >
                  Chào mừng trở lại
                </h2>
                <p className="text-sm mb-6" style={{ color: "#94a3b8" }}>
                  Đăng nhập để tiếp tục
                </p>

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  <FormField
                    label="Email"
                    type="email"
                    placeholder="email@uit.edu.vn"
                    value={email}
                    onChange={setEmail}
                  />
                  <FormField
                    label="Mật khẩu"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={setPassword}
                  />

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: "#4f46e5" }}
                      />
                      <span className="text-sm" style={{ color: "#475569" }}>
                        Ghi nhớ đăng nhập
                      </span>
                    </label>
                    <button
                      type="button"
                      className="text-sm font-medium"
                      style={{ color: "#4f46e5" }}
                    >
                      Quên mật khẩu?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 flex items-center justify-center rounded-xl font-display font-semibold text-white transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{ background: "#4f46e5" }}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      "Đăng nhập"
                    )}
                  </button>
                </form>

                <p
                  className="text-sm text-center mt-4"
                  style={{ color: "#94a3b8" }}
                >
                  Chưa có tài khoản?{" "}
                  <button
                    type="button"
                    onClick={() => setTab("register")}
                    className="font-semibold"
                    style={{ color: "#4f46e5" }}
                  >
                    Đăng ký ngay
                  </button>
                </p>
              </>
            ) : (
              <>
                <h2
                  className="font-display font-bold text-xl mb-1"
                  style={{ color: "#1a1a2e" }}
                >
                  Tạo tài khoản mới
                </h2>
                <p className="text-sm mb-5" style={{ color: "#94a3b8" }}>
                  Điền thông tin sinh viên của bạn
                </p>

                <form onSubmit={handleSubmit} noValidate className="space-y-3">
                  <FormField label="Họ và tên" placeholder="Nguyễn Văn A" value={registerName} onChange={setRegisterName} />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="MSSV" placeholder="2252xxxx" value={registerStudentId} onChange={setRegisterStudentId} />
                    <FormField
                      label="Số điện thoại"
                      placeholder="09xx xxx xxx"
                      value={phone}
                      onChange={setPhone}
                    />
                  </div>
                  <FormField
                    label="Email sinh viên"
                    type="email"
                    placeholder="mssv@gm.uit.edu.vn"
                    value={email}
                    onChange={setEmail}
                  />
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "#475569" }}
                    >
                      Khoa / Viện
                    </label>
                    <select
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                      style={{ borderColor: "#e2e8f0", color: "#1a1a2e" }}
                    >
                      <option>Công nghệ Thông tin</option>
                      <option>Khoa học Máy tính</option>
                      <option>Hệ thống Thông tin</option>
                      <option>An toàn Thông tin</option>
                      <option>Mạng máy tính & TT</option>
                    </select>
                  </div>
                  <FormField
                    label="Mật khẩu"
                    type="password"
                    placeholder="Tối thiểu 6 ký tự"
                    value={password}
                    onChange={setPassword}
                  />
                  <FormField
                    label="Xác nhận mật khẩu"
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-5 py-3 flex items-center justify-center rounded-xl font-display font-semibold text-white transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{ background: "#4f46e5" }}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      "Đăng ký tài khoản"
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Demo accounts */}
          <div className="mt-5">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="flex-1 border-t"
                style={{ borderColor: "#e2e8f0" }}
              />
              <span
                className="text-xs font-medium"
                style={{ color: "#94a3b8" }}
              >
                Đăng nhập bằng tài khoản demo
              </span>
              <div
                className="flex-1 border-t"
                style={{ borderColor: "#e2e8f0" }}
              />
            </div>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((acc, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDemoLogin(acc)}
                  disabled={loading}
                  className="w-full flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition-all hover:shadow-sm group disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "white", borderColor: "#e2e8f0" }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: acc.bg }}
                  >
                    <span
                      className="text-xs font-bold"
                      style={{ color: acc.color }}
                    >
                      {acc.role === "organizer" ? "BTC" : "SV"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: "#1a1a2e" }}
                      >
                        {acc.label}
                      </span>
                      {"badge" in acc && acc.badge && (
                        <span
                          className="px-1.5 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: acc.bg, color: acc.color }}
                        >
                          {acc.badge}
                        </span>
                      )}
                    </div>
                    <div
                      className="text-xs mt-0.5 leading-snug"
                      style={{ color: "#94a3b8" }}
                    >
                      {acc.desc}
                    </div>
                  </div>
                  <svg
                    className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                    style={{ color: acc.color }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m8.25 4.5 7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FormField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}: {
  label: string
  type?: string
  placeholder: string
  value?: string
  onChange?: (v: string) => void
}) {
  return (
    <div>
      <label
        className="block text-sm font-medium mb-1.5"
        style={{ color: "#475569" }}
      >
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all"
        style={{ borderColor: "#e2e8f0", color: "#1a1a2e" }}
        onFocus={(e) => (e.target.style.borderColor = "#4f46e5")}
        onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
      />
    </div>
  )
}
