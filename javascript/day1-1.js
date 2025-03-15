const phoneNumberInput = document.getElementById("phoneNumber");
const searchBtn = document.getElementById("searchBtn");
const resultSpan = document.getElementById("result");

phoneNumberInput.addEventListener("input", () => {
    if (phoneNumberInput.value.length >= 10) {
        searchBtn.disabled = false;
    } else {
        searchBtn.disabled = true;
    }
});

searchBtn.addEventListener("click", async () => {
    const phoneNumber = phoneNumberInput.value;

    try {
        const response = await fetch('https://refund.atoncorp.com:3101/javascript/table/data');

        if (response.status === 200) {
            const data = await response.json();
            resultSpan.textContent = `결과: true`;
            }
        else{
            resultSpan.textContent = `결과: false`;
        }
    } catch (error) {
        console.error(error);
    }
});

