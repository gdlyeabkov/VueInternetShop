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
          <div v-if="isAuth">
            <li class="nav-item">
              <router-link :to="{name:'Home'}">
                Домой
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-item" :to="{name:'Bucket', query:{ 'useremail': useremail }}">
                  Корзина
              </router-link>
            </li>
          </div>
          <div v-else >
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
          <div v-if="isAuth">
            <li>
                <span class="badge bg-primary">{{ useremail }}</span>
            </li>
            <li>
                <span class="badge bg-primary"><a class="badge bg-primary" @click="logoutUser" >Выйти</a></span>
            </li>
            <li>
                <span class="badge bg-primary"><a class="badge bg-primary" href="/users/amount?useremail=<%= useremail %>&amount=<%= 0 %>">+</a></span>
            </li>
          </div>
        </ul>
      </div>
    </div>
  </nav>

    <div v-if="allProductsInBucketOfThisUser.length > 0">
      <div class="card" v-for="product in allProductsInBucketOfThisUser" :key="product._id">
        <h5 class="card-header">{{ product.name }}</h5>
        <div class="card-body">
          <h5 class="card-header">{{ product.price }}</h5>
          <p class="card-text">With supporting text below as a natural lead-in to additional content.</p>
          <a @click="deleteFromBucket(product.name)"  class="btn btn-primary">удалить из корзины</a>
        </div>
      </div>
      КОРЗИНА
      <a @click="addOrder()" class="form-control btn btn-primary">
          Оформить заказ    
      </a>  
    </div>
    <div  v-else > 
      <router-link :to="{ name: 'Home'}" class="form-control btn btn-primary">
        У вас нет ещё ни одного товара в корзине    
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Bucket',
  data(){
    return{
      useremail: window.localStorage.getItem('auth') == 'true' ? window.localStorage.getItem('useremail') : "",
      allProductsInBucketOfThisUser: {},
      isAuth: window.localStorage.getItem('auth') == 'true'
    }
  },
  async mounted(){
    fetch(`http://localhost:4000/users/bucket?useremail=${this.$route.query.useremail}`, {
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
        this.allProductsInBucketOfThisUser = JSON.parse(result)
      });
  },
  methods:{
    addOrder(){
      fetch(`http://localhost:4000/users/bucket/buy?useremail=${this.$route.query.useremail}`, {
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
        location.reload()
      });
    },
    deleteFromBucket(productName){
      fetch(`http://localhost:4000/users/bucket/delete?useremail=${this.$route.query.useremail}&productname=${productName}`, {
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
        location.reload()
      });
    }
  }
}
</script>
