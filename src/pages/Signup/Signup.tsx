import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logoImg from "@/assets/images/icon_symbor_mark.png";
import styles from "./Signup.module.css";

function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [gender, setGender] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [phone, setPhone] = useState("");
  const [agreeAll, setAgreeAll] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAgreeAll = (checked: boolean) => {
    setAgreeAll(checked);
    setAgreeTerms(checked);
    setAgreePrivacy(checked);
    setAgreeMarketing(checked);
  };

  const handleIndividual = (
    setter: (v: boolean) => void,
    value: boolean,
    others: boolean[],
  ) => {
    setter(value);
    const allChecked = others.every(Boolean) && value;
    setAgreeAll(allChecked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }
    if (!email.trim()) {
      setError("이메일을 입력해주세요.");
      return;
    }
    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!gender) {
      setError("성별을 선택해주세요.");
      return;
    }
    if (!birthYear || !birthMonth || !birthDay) {
      setError("생년월일을 입력해주세요.");
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      setError("올바른 전화번호를 입력해주세요.");
      return;
    }
    if (!agreeTerms || !agreePrivacy) {
      setError("필수 약관에 동의해주세요.");
      return;
    }

    const birthDate = `${birthYear}-${birthMonth.padStart(2, "0")}-${birthDay.padStart(2, "0")}`;

    setLoading(true);
    const success = await signup({
      name,
      email,
      password,
      gender,
      birthDate,
      phone: phone.replace(/\D/g, ""),
    });
    setLoading(false);

    if (success) {
      navigate("/");
    } else {
      setError("이미 가입된 이메일입니다.");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoArea}>
          <img src={logoImg} alt="LG전자" className={styles.logoImage} />
          <h1 className={styles.logoTitle}>LG전자 회원가입</h1>
          <p className={styles.logoSub}>LG 계정을 만들고 다양한 혜택을 누리세요</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="name">
              이름
            </label>
            <input
              id="name"
              type="text"
              className={styles.input}
              placeholder="이름을 입력하세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="signup-email">
              이메일
            </label>
            <input
              id="signup-email"
              type="email"
              className={styles.input}
              placeholder="이메일 주소를 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="signup-password">
              비밀번호
            </label>
            <input
              id="signup-password"
              type="password"
              className={styles.input}
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <span className={styles.hint}>영문, 숫자, 특수문자 포함 8자 이상</span>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="signup-password-confirm">
              비밀번호 확인
            </label>
            <input
              id="signup-password-confirm"
              type="password"
              className={styles.input}
              placeholder="비밀번호를 한 번 더 입력하세요"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          {/* 성별 */}
          <div className={styles.inputGroup}>
            <span className={styles.label}>성별</span>
            <div className={styles.genderRow}>
              <label className={`${styles.genderOption} ${gender === "male" ? styles.genderActive : ""}`}>
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={gender === "male"}
                  onChange={(e) => setGender(e.target.value)}
                  className={styles.genderRadio}
                />
                남성
              </label>
              <label className={`${styles.genderOption} ${gender === "female" ? styles.genderActive : ""}`}>
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={gender === "female"}
                  onChange={(e) => setGender(e.target.value)}
                  className={styles.genderRadio}
                />
                여성
              </label>
            </div>
          </div>

          {/* 생년월일 */}
          <div className={styles.inputGroup}>
            <span className={styles.label}>생년월일</span>
            <div className={styles.birthRow}>
              <select
                className={styles.select}
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
              >
                <option value="">년도</option>
                {Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>
              <select
                className={styles.select}
                value={birthMonth}
                onChange={(e) => setBirthMonth(e.target.value)}
              >
                <option value="">월</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={String(m)}>
                    {m}월
                  </option>
                ))}
              </select>
              <select
                className={styles.select}
                value={birthDay}
                onChange={(e) => setBirthDay(e.target.value)}
              >
                <option value="">일</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={String(d)}>
                    {d}일
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 전화번호 */}
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="phone">
              전화번호
            </label>
            <input
              id="phone"
              type="tel"
              className={styles.input}
              placeholder="'-' 없이 숫자만 입력하세요"
              value={phone}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "");
                if (v.length <= 11) {
                  // 자동 하이픈 포맷
                  if (v.length <= 3) setPhone(v);
                  else if (v.length <= 7) setPhone(`${v.slice(0, 3)}-${v.slice(3)}`);
                  else setPhone(`${v.slice(0, 3)}-${v.slice(3, 7)}-${v.slice(7)}`);
                }
              }}
              autoComplete="tel"
            />
          </div>

          {/* 약관 동의 */}
          <div className={styles.agreements}>
            <div className={styles.checkRow}>
              <input
                type="checkbox"
                id="agree-all"
                className={styles.checkbox}
                checked={agreeAll}
                onChange={(e) => handleAgreeAll(e.target.checked)}
              />
              <label
                htmlFor="agree-all"
                className={`${styles.checkLabel} ${styles.checkLabelAll}`}
              >
                전체 동의
              </label>
            </div>
            <div className={styles.checkDivider} />
            <div className={styles.checkRow}>
              <input
                type="checkbox"
                id="agree-terms"
                className={styles.checkbox}
                checked={agreeTerms}
                onChange={(e) =>
                  handleIndividual(setAgreeTerms, e.target.checked, [agreePrivacy, agreeMarketing])
                }
              />
              <label htmlFor="agree-terms" className={styles.checkLabel}>
                이용약관 동의<span className={styles.required}>(필수)</span>
              </label>
            </div>
            <div className={styles.checkRow}>
              <input
                type="checkbox"
                id="agree-privacy"
                className={styles.checkbox}
                checked={agreePrivacy}
                onChange={(e) =>
                  handleIndividual(setAgreePrivacy, e.target.checked, [agreeTerms, agreeMarketing])
                }
              />
              <label htmlFor="agree-privacy" className={styles.checkLabel}>
                개인정보 수집 및 이용 동의<span className={styles.required}>(필수)</span>
              </label>
            </div>
            <div className={styles.checkRow}>
              <input
                type="checkbox"
                id="agree-marketing"
                className={styles.checkbox}
                checked={agreeMarketing}
                onChange={(e) =>
                  handleIndividual(setAgreeMarketing, e.target.checked, [agreeTerms, agreePrivacy])
                }
              />
              <label htmlFor="agree-marketing" className={styles.checkLabel}>
                마케팅 정보 수신 동의 (선택)
              </label>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <div className={styles.bottomLinks}>
          <span style={{ fontSize: 14, color: "var(--color-gray-500)" }}>
            이미 계정이 있으신가요?
          </span>
          <Link to="/login" className={styles.bottomLink}>
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
