const BASE_URL = "https://lighthouse-user-api.herokuapp.com/";
const INDEX_URL = BASE_URL + "api/v1/users/";
const USER_PER_PAGE = 10

const users = [];
let filteredUsers = []

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#inputKeyword");
const paginator = document.querySelector("#paginator");


//渲染使用者清單畫面
//這邊dataset的設置模式是參考modal answer，讓即使點擊姓名也能出現詳細資料
function renderUserList(data) {
  let rawHTML = "";
  data.forEach((item) => {
    rawHTML += `
    <div class="card m-2" style="width: 10rem">
  <img class="card-img-top user-image" src="${item.avatar}" alt="Card image cap">
  <div class="card-body" data-id="${item.id}">
          <h5 class="card-title mb-0">${item.name} ${item.surname}</h5>
        </div>
        <div class="card-footer text-muted">
    <button type="button" class="btn btn-primary show-detail" data-bs-toggle="modal" data-bs-target="#user-modal" data-id="${item.id}">More</button>
    <button type="button" class="btn btn-success add-to-favorite" data-id="${item.id}">+</button>
  </div>
      </div>
    `;
  });
  dataPanel.innerHTML = rawHTML;
}

//更改modal中個別使用者的詳細資料
function showUserDetail(id) {
  const modalImage = document.querySelector("#user-modal-image");
  const modalName = document.querySelector("#user-modal-name");
  const modalDescription = document.querySelector("#user-modal-description");

  //避免出現上一個user之殘影
  modalImage.src = "";
  modalName.textContent = "";
  modalDescription.textContent = "";

  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data;
      console.log(data);
      modalImage.innerHTML = `<img src="${data.avatar}" alt="user-image">`;
      modalName.innerText = `${data.name} ${data.surname}`;
      modalDescription.innerHTML = `
    <p>Gender：${data.gender}</p>
    <p>Age：${data.age}</p>
    <p>Birthdy：${data.birthday}</p>
    <p>Region：${data.region}</p>
    <p>Email：${data.email}</p>
    `;
    })
    .catch((err) => console.log(err));
}

//尋找功能
function searchForUser(event) {
  event.preventDefault()
  const keyWord = searchInput.value.trim().toLowerCase()
  filteredUsers = users.filter((user) => user.name.toLowerCase().includes(keyWord))

  if (filteredUsers.length === 0) {
    return alert('user not found')
  }
  renderPaginator(filteredUsers.length)
  renderUserList(usersByPage(1))
}

//加入最愛
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteUsers')) || []
  const user = users.find((user) => user.id === id)

  if (list.some(movie => movie.id === id)) {
    return alert('此使用者已經在收藏中')
  }

  list.push(user)
  localStorage.setItem('favoriteUsers', JSON.stringify(list))
}

//一頁的user
function usersByPage(page) {
  const data = filteredUsers.length ? filteredUsers : users
  const startIndex = (page - 1) * USER_PER_PAGE
  return data.slice(startIndex, startIndex + USER_PER_PAGE)
}

//根據user總數設置分頁
function renderPaginator(amount) {
  const numberOfPage = Math.ceil(amount / USER_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPage; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
  }
  paginator.innerHTML = rawHTML
}

//監聽點擊事件，弱點及照片，會取得目標的id，並執行showUserDetail的函式
dataPanel.addEventListener("click", function (event) {
  let target = event.target;
  if (target.matches('.show-detail')) {
    //如果target有data-id這個數值
    console.log(target.dataset.id);
    showUserDetail(Number(target.dataset.id));
  } else if (target.matches('.add-to-favorite')) {
    addToFavorite(Number(target.dataset.id));
  }
});

searchForm.addEventListener('submit', searchForUser)

paginator.addEventListener('click', function (event) {
  const target = event.target
  if (target.tagName !== 'A') return
  const page = Number(target.dataset.page)
  renderUserList(usersByPage(page))
})

//做出user的清單陣列
axios
  .get(INDEX_URL)
  .then((response) => {
    users.push(...response.data.results);
    renderPaginator(users.length);
    renderUserList(usersByPage(1));
  })
  .catch((err) => console.log(err));