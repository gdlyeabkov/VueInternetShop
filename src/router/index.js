import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Product from '../views/Product.vue'
import UserCreateSuccess from '../views/UserCreateSuccess.vue'
import OrdersList from '../views/OrdersList.vue'
import Bucket from '../views/Bucket.vue'
import UsersLogin from '../views/UsersLogin.vue'
import UsersRegistry from '../views/UsersRegistry.vue'
import Amount from '../views/Amount.vue'


const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/product/:productID',
    name: 'product',
    component: () => import('../views/Product.vue')
  },
  {
    path: '/users/usercreatesuccess',
    name: 'UserCreateSuccess',
    component: () => import('../views/UserCreateSuccess.vue')
  },
  {
    path: '/admin/orders',
    name: 'OrdersList',
    component: () => import('../views/OrdersList.vue')
  },
  {
    path: '/users/bucket',
    name: 'Bucket',
    component: () => import('../views/Bucket.vue')
  },
  {
    path: '/users/login',
    name: 'UsersLogin',
    component: () => import('../views/UsersLogin.vue')
  },
  {
    path: '/users/register',
    name: 'UsersRegistry',
    component: () => import('../views/UsersRegistry.vue')
  },
  {
    path: '/users/amount',
    name: 'Amount',
    component: () => import('../views/Amount.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
