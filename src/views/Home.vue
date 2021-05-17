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
  <div class="card" :v-if="allProducts.length >= 1" v-for="product in allProducts" :key="product._id">
    <h5 class="card-header">
          <router-link v-if="isAuth" :to="{ name: 'product', params: { productID: product._id }, query: { useremail: 'useremail' }}">{{ product.name }} </router-link>
          <router-link v-else :to="{ name: 'product', params: { productID: product._id }}">{{ product.name }} </router-link>
    </h5>
    <div class="card-body">
      <h5 class="card-title">{{ product.price }}</h5>
      <p class="card-text">With supporting text below as a natural lead-in to additional content.</p>          
      <a v-if="isAuth" @click="addToBucket(product)" class="btn btn-primary">Добавить в корзину</a>
    </div> 
  </div>
  <div :v-else-if="allProducts.length <= 0">
    Список товаров пуст
  </div>
</div>
</template>

<script>
export default {
  name: 'Home',
  data(){
    return{
      allProducts: [],
      isAuth: window.localStorage.getItem('auth') == 'true',
      useremail: window.localStorage.getItem('auth') == 'true' ? window.localStorage.getItem('useremail') : ""
    }
  },
  methods:{
    addToBucket(thisProduct){
      fetch(`http://localhost:4000/users/bucket/add?useremail=${this.useremail}&productname=${thisProduct.name}&productprice=${thisProduct.price}`, {
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
        
      });
    },
    logoutUser(){
      window.localStorage.clear()
      location.reload()
    }
  },
  async mounted(){
    fetch('http://localhost:4000/', {
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
        this.allProducts = JSON.parse(result)
      });
  },
}
</script>
