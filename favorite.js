const BASE_URL = "https://lighthouse-user-api.herokuapp.com/";
const INDEX_URL = BASE_URL + "api/v1/users/";
const USER_PER_PAGE = 20

const users = JSON.parse(localStorage.getItem('favoriteUsers')) || [];

const dataPanel = document.querySelector("#data-panel");


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
    <button type="button" class="btn btn-danger remove-from-favorite" data-id="${item.id}">X</button>
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

//從最愛清單中移除
function removeFromFavorite(id) {
  if (!users || !users.length) return
  const userIndex = users.findIndex((user) => user.id === id)
  if (userIndex === -1) return
  users.splice(userIndex, 1)
  localStorage.setItem('favoriteUsers', JSON.stringify(users))
  renderUserList(users)
}

//監聽點擊事件，弱點及照片，會取得目標的id，並執行showUserDetail的函式
dataPanel.addEventListener("click", function (event) {
  let target = event.target;
  if (target.tagName === 'IMG') {
    //如果target有data-id這個數值
    console.log(target.dataset.id);
    showUserDetail(Number(target.dataset.id));
  } else if (target.matches('.remove-from-favorite')) {
    removeFromFavorite(Number(target.dataset.id));
  }
});


renderUserList(users);