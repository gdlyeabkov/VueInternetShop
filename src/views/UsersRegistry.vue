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
    <h1 class="h3 mb-3 font-weight-normal">Зарегестрируйтесь</h1>
    
    <label class="sr-only">Email</label>
    <input v-model="useremail" type="email" id="" class="useremail form-control" placeholder="Email address" required="" autofocus="">
    <label class="sr-only">Password</label>
    <input v-model="userpassword" type="password" id="" class="userpassword form-control" placeholder="Password" required="">
    <label class="sr-only">Age</label>
    <input v-model="userage" type="text" id="" class="userage  form-control" placeholder="Age" required="" autofocus="">
    <label class="sr-only">Name</label>
    <input v-model="username" type="text" id="" class="username form-control" placeholder="Name" required="" autofocus="">
    <div class="checkbox mb-3">
    </div>
    <button @click="registerNewUser" class="btn btn-lg btn-primary btn-block">Зарегестрироваться</button>
    <div>{{ errors }}</div>
  </div>
</template>

<script>
export default {
  name: 'UsersRegistry',
  data(){
    return{
      useremail: '',
      userpassword: '',
      userage: 0,
      username: '',
      isAuth: window.localStorage.getItem('auth') == 'true',
      errors: ""

    }
  },
  methods:{
    registerNewUser(){
        fetch(`http://localhost:4000/users/usercreatesuccess?useremail=${this.useremail}&userpassword=${this.userpassword}&username=${this.username}&userage=${this.userage}`, {
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
          if(result.includes("created")){
            window.localStorage.setItem("auth", "true");
            window.localStorage.setItem("useremail", this.useremail);
            this.$router.push('/users/usercreatesuccess')  
          } else if(result.includes("rollback")){
            this.errors = "Такой пользователь уже существует!!!"
          } 
        });
      }
    }
}
</script>