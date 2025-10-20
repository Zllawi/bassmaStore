import { env } from '../config/env'
import * as mongo from './mongo'
import * as firebase from './firebase'

const vendor = env.DB_VENDOR

export const usersRepo = vendor === 'firebase' ? firebase.usersRepo : mongo.usersRepo
export const productsRepo = vendor === 'firebase' ? firebase.productsRepo : mongo.productsRepo
export const ordersRepo = vendor === 'firebase' ? firebase.ordersRepo : mongo.ordersRepo

