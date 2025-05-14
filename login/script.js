let guest = document.getElementById("guestId");
guest.addEventListener("click",()=>{
    localStorage.setItem("username", "guest")
})

const apiUrl = "https://6823b82b65ba05803397b364.mockapi.io";
let username = document.getElementById("username");
let password = document.getElementById("password");
let submitButton = document.getElementById("submit");

submitButton.addEventListener("click", async (e) => {
  e.preventDefault();
  const user = { username: username.value, password: password.value };
  createUser(user);
});
async function createUser(user) {
  try {
    const checkUser = await fetch(`${apiUrl}/users?username=${user.username}`);
    if (checkUser.ok) {
      alert("User already exist");
      return;
    }
    // post create user
    const response = await fetch(`${apiUrl}/users`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(user),
    });

    let data = await response.json()
    console.log(data.username);
    
    
    localStorage.setItem("username", await data.username)
    alert("Successfully Signed In");
    window.location.href = "../";
    
  } catch (error) {
    console.log("error regster", error);
  }
}
