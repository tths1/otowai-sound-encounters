import { acceptInvite, getUser, handleAuthCallback, login, logout } from "@netlify/identity";

const status = document.querySelector("#admin-status");
const loginForm = document.querySelector("#admin-login-form");
const inviteForm = document.querySelector("#admin-invite-form");
const accountPanel = document.querySelector("#admin-account");
let inviteToken = "";

function message(text, error = false) {
  status.textContent = text;
  status.dataset.error = String(error);
}

function showAccount(user) {
  loginForm.hidden = true;
  inviteForm.hidden = true;
  accountPanel.hidden = false;
  accountPanel.querySelector("strong").textContent = user.email || "管理员";
}

async function boot() {
  try {
    const callback = await handleAuthCallback();
    if (callback?.type === "invite" && callback.token) {
      inviteToken = callback.token;
      loginForm.hidden = true;
      inviteForm.hidden = false;
      message("请设置管理员密码以接受邀请。");
      return;
    }
    const user = await getUser();
    if (user) showAccount(user);
  } catch (error) {
    message(error?.message || "身份验证失败，请重试。", true);
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  message("正在登录…");
  try {
    const form = new FormData(loginForm);
    const user = await login(String(form.get("email")), String(form.get("password")));
    showAccount(user);
    message("登录成功，可以进入规则编辑端。");
  } catch (error) {
    message(error?.message || "邮箱或密码不正确。", true);
  }
});

inviteForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(inviteForm);
  const password = String(form.get("password"));
  const confirm = String(form.get("confirm"));
  if (password !== confirm) return message("两次输入的密码不一致。", true);
  message("正在创建管理员账户…");
  try {
    const user = await acceptInvite(inviteToken, password);
    history.replaceState(null, "", "/admin/");
    showAccount(user);
    message("管理员账户已创建，可以进入规则编辑端。");
  } catch (error) {
    message(error?.message || "邀请已失效，请重新发送邀请。", true);
  }
});

document.querySelector("#admin-logout").addEventListener("click", async () => {
  await logout();
  location.reload();
});

boot();

