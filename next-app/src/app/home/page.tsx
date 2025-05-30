//로그인 성공 후 보여주는 화면
//멤버 리스트 보여주는 화면으로 넘어가는 버튼 필요

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface Account {
  userId: string;
  userName: string;
  password: string;
  email: string;
}

export default function HomePage() {
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const userId = searchParams.get('userId');
    if (userId) {
      const fetchAccount = async () => {
        try {
          const token = localStorage.getItem('token');
          if(!token){
            return
          }
          const response = await fetch(`링크 올리기 ?userId=${userId}`, {
            headers: {
             token,
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          setAccount(data.data);
        } catch (error) {
          console.error(error);
        }
      };

      fetchAccount();
    }
  }, [searchParams]);

  return (
    <div>
      <h1>홈</h1>
      {account ? (
        <div>
          <p>사용자 ID: {account.userId}</p>
          <p>사용자 이름: {account.userName}</p>
          <p>비밀번호: {account.password}</p>
          <p>이메일: {account.email}</p>
        </div>
      ) : (
        <p></p>
      )}
      <button onClick={() => router.push('/member')}>가입자 리스트</button>
    </div>
  );
}