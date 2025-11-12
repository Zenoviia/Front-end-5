function validateForm() {
  const name = document.getElementById("name");
  const faculty = document.getElementById("faculty");
  const birth = document.getElementById("birth");
  const address = document.getElementById("address");
  const email = document.getElementById("email");

  const nameRegex = /^[А-ЯІЇЄҐ][а-яіїєґ']+\s[А-ЯІЇЄҐ]\.[А-ЯІЇЄҐ]\.$/;
  const facultyRegex = /^[А-Яа-яІЇЄҐієїґ]+$/;
  const birthRegex = /^\d{2}\.\d{2}\.\d{4}$/;
  const addressRegex = /^м\.\s[А-ЯІЇЄҐ][а-яіїєґ']+$/;
  const emailRegex = /^[a-zA-Z._-]+@[a-zA-Z]{5}\.com$/;

  let valid = true;

  function check(input, regex) {
    if (!regex.test(input.value.trim())) {
      input.classList.add("error");
      valid = false;
    } else {
      input.classList.remove("error");
    }
  }

  check(name, nameRegex);
  check(faculty, facultyRegex);
  check(birth, birthRegex);
  check(address, addressRegex);
  check(email, emailRegex);

  if (valid) {
    const info = `
      <h3>Введені дані:</h3>
      <p><b>ПІБ:</b> ${name.value}</p>
      <p><b>Факультет:</b> ${faculty.value}</p>
      <p><b>Дата народження:</b> ${birth.value}</p>
      <p><b>Адреса:</b> ${address.value}</p>
      <p><b>Email:</b> ${email.value}</p>
    `;
    const newWin = window.open("", "_blank", "width=400,height=400");
    newWin.document.write(info);
  } else {
    alert("Перевірте правильність полів");
  }
}

const variantNumber = 5;
const table = document.getElementById("variantTable");

for (let i = 0, num = 1; i < 6; i++) {
  const tr = document.createElement("tr");
  for (let j = 0; j < 6; j++, num++) {
    const td = document.createElement("td");
    td.textContent = num;

    if (num === variantNumber) {
      td.addEventListener("mouseenter", () => {
        td.style.backgroundColor = getRandomColor();
      });
    }

    tr.appendChild(td);
  }
  table.appendChild(tr);
}

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
