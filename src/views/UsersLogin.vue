<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">VueSuperShop</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <div>
              <li class="nav-item">
                <router-link class="nav-item" :to="{name:'UsersLogin'}">
                  Вход
                </router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-item" :to="{name:'UsersRegistry'}">
                  Регистрация
                </router-link>
              </li>
            </div>
          </ul>
        </div>
      </div>
    </nav>
    <img class="mb-4" src="https://cdn4.iconfinder.com/data/icons/logos-brands-5/24/vue-dot-js-256.png" alt="" width="72" height="72">
    <h1 class="h3 mb-3 font-weight-normal">Войдите</h1>    
    <label for="inputEmail" class="sr-only">Email</label>
    <input v-model="useremail" type="email" id="inputEmail" class="useremail form-control" placeholder="Email address" required="" autofocus="">
    <label for="inputPassword" class="sr-only">Password</label>
    <input v-model="userpassword" type="password" id="inputPassword" class="userpassword form-control" placeholder="Password" required="">
    <div class="checkbox mb-3">
    </div>
    <button @click="loginUser" class="btn btn-lg btn-primary btn-block">Войти</button>       
    <div>{{ errors }}</div>
  </div>
</template>

<script>

export default {
  name: 'UsersLogin',
  data(){
    return {
      useremail: '',
      userpassword: '',
      errors: ""
    }
  },
  methods:{
    async loginUser(){
      await fetch(`http://localhost:4000/users/check?useremail=${this.useremail}&userpassword=${this.userpassword}`, {
          mode: 'cors',
          method: 'GET'
        }).then(response => response.body).then(rb  => {
          const reader = rb.getReader()
          return new ReadableStream({
            start(controller) {
              function push() {
                reader.read().then( ({done, value}) => {
                  if (done) {
                    controller.close();
                    return;
                  }
                  controller.enqueue(value);
                  push();
                })
              }
              push();
            }
          });
      }).then(stream => {
          return new Response(stream, { headers: { "Content-Type": "text/html" } }).text();
        })
        .then(result => {
          if(!result.includes("user not found")){
            window.localStorage.setItem("auth", "true");
            window.localStorage.setItem("useremail", this.useremail);
            this.$router.push('/')
          } else if(result.includes("user not found")){
            this.errors = "Такого пользователя не существует!!!"
          }
        });
    }
  }
}
</script>
