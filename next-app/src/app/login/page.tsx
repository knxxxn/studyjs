//로그인 하면 토큰 받고 로그인 성공 후에 가입자 리스트 보이게
//url: https://refund.atoncorp.com:3101/ 이 시작
// 최초 로그인 페이지(아래 회원가입) → 성공시 홈으로 가고(토큰 저장해야 함) 실패시 “존재하지 않은 회원입니다” 띄우기
// 홈에서 맴버 리스트 보이는 페이지로 넘어가는 기능, 맴버리스트 보이는 화면에서 다시 홈으로 넘어가는 기능 필요
// 회원 가입하면 다시 로그인 페이지로 넘어가기

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('링크 올리기 ', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, password }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      localStorage.setItem("token", data.data); 
      router.push(`/home?userId=${userId}`);
      localStorage.setItem("userId",userId);
    } catch (error) {
      console.error(error);
      setErrorMessage('존재하지 않는 회원입니다.');
    }
  };

  return (
    <div>
      <h1>로그인</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="아이디" value={userId} onChange={(e) => setUserId(e.target.value)} />
        <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">로그인</button>
      </form>
      {errorMessage && <p>{errorMessage}</p>}
      <Link href="/join">
        <button>회원가입</button>
      </Link>
    </div>
  );
}