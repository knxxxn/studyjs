//멤버 리스트를 보여주는 화면
//홈 화면으로 넘어가는 버튼 필요 

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Member {
  id: string;
  index: number;
  name: string;
  email: string;
  phone: string;
  country: string;
  address: string;
  job: string;
  gender: string;
}

export default function MemberPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const router = useRouter();
  

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          return;
        }
        const response = await fetch('링크 올리기 ', {
          headers: {
            token,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setMembers(data.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchMembers();
  }, []);

  const handleHomeClick = () => {
    const userId = localStorage.getItem('userId');
    console.log(userId);
    if (userId) {
      router.push(`/home?userId=${userId}`);
    } else {
      router.push('/home');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); 
  };

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMembers.slice(indexOfFirstItem, indexOfLastItem);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredMembers.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div>
      <h1>가입자 리스트</h1>
      <input
        type="text"
        placeholder="이름 검색"
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <select value={itemsPerPage} onChange={handleItemsPerPageChange}>
        <option value={10}>10개씩 보기</option>
        <option value={20}>20개씩 보기</option>
        <option value={50}>50개씩 보기</option>
        <option value={filteredMembers.length}>전체 보기</option>
      </select>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Index</th>
            <th>이름</th>
            <th>이메일</th>
            <th>전화번호</th>
            <th>국가</th>
            <th>주소</th>
            <th>직업</th>
            <th>성별</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((member) => (
            <tr key={member.id}>
              <td>{member.id}</td>
              <td>{member.index}</td>
              <td>{member.name}</td>
              <td>{member.email}</td>
              <td>{member.phone}</td>
              <td>{member.country}</td>
              <td>{member.address}</td>
              <td>{member.job}</td>
              <td>{member.gender}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => setCurrentPage(number)}
            style={{ fontWeight: currentPage === number ? 'bold' : 'normal' }}
          >
            {number}
          </button>
        ))}
      </div>
      <button onClick={handleHomeClick}>홈으로</button>
    </div>
  );
}