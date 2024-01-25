import axios from "axios";
import Element from 'element-ui'
import {getToken} from "./auth";

let request = axios.create()

//请求拦截
request.interceptors.request.use(config => {
        console.log('请求拦截！')
        if (getToken()) {
            config.headers['Authorization'] = getToken()
        }
        return config
    },
    error => {
        return Promise.reject(error)
    })


// 响应拦截器
request.interceptors.response.use(response => {
        return response
    },
    error => {
        Element.Message.error('请求失败' + error)
        return Promise.reject(error)
    })

export default request