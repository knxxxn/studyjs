const allBtn = document.getElementById("allBtn");
const tenBtn = document.getElementById("tenBtn");
const twentyBtn = document.getElementById("twentyBtn");
const dataTable = document.getElementById("dataTable").getElementsByTagName('tbody')[0];
const genderRatioDiv = document.getElementById("genderRatio");
const ageGroupTableBody = document.getElementById("ageGroupTableBody").getElementsByTagName('tr')[0];

let tableData = [];
let itemsPerPage = 0;
let currentPage = 1;

async function fetchData() {
    try {
        const response = await fetch('https://refund.atoncorp.com:3101/javascript/table/data');
        if (response.status === 200) {
            const data = await response.json();
            if (Array.isArray(data.data)) {
                tableData = data.data;
                displayData(tableData);
                calculateGenderRatio(tableData);
                calculateAgeGroup(tableData);
                createPagination(tableData);
            } else {
                console.error(error); //데이터 형식이 올바르지 않을 때
            }
        } else {
            console.error(error);//데이터 불러오기 실패
        }
    } catch (error) {
        console.error(error);
    }
}

function displayData(data, page = 1) {
    dataTable.innerHTML = "";
    let displayItems = data;
    if (itemsPerPage > 0) {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        displayItems = data.slice(startIndex, endIndex);
    }
    displayItems.forEach((item, index) => {
        let row = dataTable.insertRow();
        let number = row.insertCell(0);
        let name = row.insertCell(1);
        let age = row.insertCell(2);
        let gender = row.insertCell(3);
        number.innerHTML = itemsPerPage > 0 ? (page - 1) * itemsPerPage + index + 1 : index + 1;
        name.innerHTML = item.name;
        age.innerHTML = item.age;
        gender.innerHTML = item.gender === 0 ? "남성" : "여성";
    });
}

function calculateGenderRatio(data) {
    let maleCount = data.filter(item => item.gender === 0).length;
    let femaleCount = data.filter(item => item.gender === 1).length;
    let totalCount = data.length;
    let maleRatio = (maleCount / totalCount).toFixed(2) * 100;
    let femaleRatio = (femaleCount / totalCount).toFixed(2) * 100;
    genderRatioDiv.innerHTML = `남성 / 여성 ${maleRatio}% / ${femaleRatio}%`;
}

function calculateAgeGroup(data) {
    let ageGroups = {};
    data.forEach(item => {
        let ageGroup = Math.floor(item.age / 10) * 10;
        ageGroups[ageGroup] = (ageGroups[ageGroup] || 0) + 1;
    });

    ageGroupTableBody.innerHTML = "";

    let ageRanges = [10, 20, 30, 40];
    ageRanges.forEach(age => {
        let cell = document.createElement("td");
        cell.textContent = ageGroups[age] || 0;
        ageGroupTableBody.appendChild(cell);
    });

    let over50 = 0;
    for (let age in ageGroups) {
        if (parseInt(age) >= 50) {
            over50 += ageGroups[age];
        }
    }
    let over50Cell = document.createElement("td");
    over50Cell.textContent = over50;
    ageGroupTableBody.appendChild(over50Cell);
}

function createPagination(data) {
    const existingPagination = document.querySelector('.pagination');
    if (existingPagination) {
        existingPagination.remove();
    }

    const pagination = document.createElement('div');
    pagination.classList.add('pagination'); // 클래스 추가
    const totalPages = itemsPerPage > 0 ? Math.ceil(data.length / itemsPerPage) : 1;

    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            displayData(data, currentPage);
        });
        pagination.appendChild(pageBtn);
    }

    dataTable.parentNode.insertBefore(pagination, dataTable.nextSibling); //dataTable 다음에 오도록 설정
}

allBtn.addEventListener("click", () => {
    itemsPerPage = 0;
    currentPage = 1;
    displayData(tableData);
    createPagination(tableData);
});

tenBtn.addEventListener("click", () => {
    itemsPerPage = 10;
    currentPage = 1;
    displayData(tableData);
    createPagination(tableData);
});

twentyBtn.addEventListener("click", () => {
    itemsPerPage = 20;
    currentPage = 1;
    displayData(tableData);
    createPagination(tableData);
});

fetchData();